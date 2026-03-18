import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import lighthouse from 'lighthouse'
import { launch } from 'chrome-launcher'
import puppeteer from 'puppeteer-core'

const DEFAULT_BASE_URL = 'https://jye10032.github.io'
const DEFAULT_RUNS = 3
const DEFAULT_OUTPUT_DIR = 'reports/lighthouse'
const DEFAULT_PAGES_FILE = 'scripts/lighthouse-pages.json'
function parseArgs(argv) {
  const options = {
    baseUrl: DEFAULT_BASE_URL,
    runs: DEFAULT_RUNS,
    outDir: DEFAULT_OUTPUT_DIR,
    pagesFile: DEFAULT_PAGES_FILE,
    preset: 'mobile',
    apiBaseUrl: process.env.LIGHTHOUSE_API_BASE_URL || process.env.VITE_API_BASE_URL || '',
    username: process.env.LIGHTHOUSE_AUTH_USERNAME || '',
    password: process.env.LIGHTHOUSE_AUTH_PASSWORD || ''
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--base-url') options.baseUrl = argv[++i]
    else if (arg === '--runs') options.runs = Number(argv[++i] || DEFAULT_RUNS)
    else if (arg === '--out-dir') options.outDir = argv[++i]
    else if (arg === '--pages') options.pagesFile = argv[++i]
    else if (arg === '--desktop') options.preset = 'desktop'
    else if (arg === '--mobile') options.preset = 'mobile'
    else if (arg === '--api-base-url') options.apiBaseUrl = argv[++i]
    else if (arg === '--username') options.username = argv[++i]
    else if (arg === '--password') options.password = argv[++i]
  }

  if (!Number.isFinite(options.runs) || options.runs < 1) {
    throw new Error(`Invalid --runs value: ${options.runs}`)
  }

  return options
}

function joinUrl(baseUrl, pagePath) {
  return new URL(pagePath, `${baseUrl.replace(/\/$/, '')}/`).toString()
}

function toSeconds(ms) {
  return Number((ms / 1000).toFixed(2))
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

function summarizeRun(lhr) {
  return {
    performance: Math.round((lhr.categories.performance?.score || 0) * 100),
    fcpMs: lhr.audits['first-contentful-paint']?.numericValue || 0,
    lcpMs: lhr.audits['largest-contentful-paint']?.numericValue || 0,
    tbtMs: lhr.audits['total-blocking-time']?.numericValue || 0,
    cls: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
    speedIndexMs: lhr.audits['speed-index']?.numericValue || 0
  }
}

function summarizePage(name, pathName, url, runMetrics) {
  return {
    name,
    path: pathName,
    url,
    runs: runMetrics.length,
    median: {
      performance: Math.round(median(runMetrics.map((item) => item.performance))),
      fcpSeconds: toSeconds(median(runMetrics.map((item) => item.fcpMs))),
      lcpSeconds: toSeconds(median(runMetrics.map((item) => item.lcpMs))),
      tbtMs: Math.round(median(runMetrics.map((item) => item.tbtMs))),
      cls: Number(median(runMetrics.map((item) => item.cls)).toFixed(3)),
      speedIndexSeconds: toSeconds(median(runMetrics.map((item) => item.speedIndexMs)))
    }
  }
}

function printSummary(pageSummaries) {
  const table = pageSummaries.map((page) => ({
    page: page.name,
    performance: page.median.performance,
    fcp_s: page.median.fcpSeconds,
    lcp_s: page.median.lcpSeconds,
    tbt_ms: page.median.tbtMs,
    cls: page.median.cls,
    speed_index_s: page.median.speedIndexSeconds
  }))

  console.table(table)
}

async function loginViaPage(browser, baseUrl, options) {
  if (!options.username || !options.password) {
    throw new Error('Authenticated pages require --username and --password (or corresponding LIGHTHOUSE_AUTH_* env vars).')
  }

  const page = await browser.newPage()
  try {
    await page.goto(joinUrl(baseUrl, '/NewsSystemPro/login'), { waitUntil: 'domcontentloaded' })

    await page.waitForSelector('input[placeholder="用户名"]')
    await page.waitForSelector('input[placeholder="密码"]')
    await page.type('input[placeholder="用户名"]', options.username)
    await page.type('input[placeholder="密码"]', options.password)

    await Promise.all([
      page.waitForFunction(
        () => !window.location.pathname.endsWith('/login'),
        { timeout: 15000 }
      ),
      page.click('button[type="submit"]')
    ])

    const finalUrl = page.url()
    if (finalUrl.includes('/login')) {
      throw new Error(`Login did not leave the login page. Final URL: ${finalUrl}`)
    }
  } finally {
    await page.close()
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const cwd = process.cwd()
  const outDir = path.resolve(cwd, options.outDir)
  const pagesFile = path.resolve(cwd, options.pagesFile)
  const pages = JSON.parse(await fs.readFile(pagesFile, 'utf8'))

  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error(`No pages found in ${pagesFile}`)
  }

  await ensureDir(outDir)

  const chrome = await launch({
    chromeFlags: [
      '--headless=new',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter',
      '--disable-sync',
      '--disable-component-update',
      '--no-first-run',
      '--no-default-browser-check',
      '--no-sandbox'
    ]
  })
  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${chrome.port}`
  })

  const pageSummaries = []

  try {
    const hasProtectedPages = pages.some((page) => page.requiresAuth)
    if (hasProtectedPages) {
      await loginViaPage(browser, options.baseUrl, options)
    }

    for (const page of pages) {
      const pageUrl = joinUrl(options.baseUrl, page.path)
      const pageOutDir = path.join(outDir, page.name)
      await ensureDir(pageOutDir)

      const metrics = []

      for (let runIndex = 1; runIndex <= options.runs; runIndex += 1) {
        console.log(`[lighthouse] ${page.name} run ${runIndex}/${options.runs}: ${pageUrl}`)

        const result = await lighthouse(pageUrl, {
          port: chrome.port,
          output: 'json',
          logLevel: 'error',
          onlyCategories: ['performance'],
          preset: options.preset,
          disableStorageReset: Boolean(page.requiresAuth)
        })

        if (!result?.lhr) {
          throw new Error(`No Lighthouse result for ${pageUrl}`)
        }

        const runSummary = summarizeRun(result.lhr)
        metrics.push(runSummary)

        const outputFile = path.join(pageOutDir, `run-${runIndex}.json`)
        await fs.writeFile(outputFile, result.report)
      }

      pageSummaries.push(summarizePage(page.name, page.path, pageUrl, metrics))
    }
  } finally {
    await browser.disconnect()
    await chrome.kill()
  }

  const summaryFile = path.join(outDir, 'summary.json')
  await fs.writeFile(summaryFile, JSON.stringify(pageSummaries, null, 2))

  printSummary(pageSummaries)
  console.log(`[done] summary written to ${summaryFile}`)
  console.log('[note] public pages can run directly. Protected admin pages require pages with \"requiresAuth\": true plus LIGHTHOUSE_AUTH_* credentials or matching CLI flags.')
}

main().catch((error) => {
  console.error('[failed]', error.message)
  process.exitCode = 1
})
