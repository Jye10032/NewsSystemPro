import api from './Request'
import type { Right, User } from '@/types'

const CACHE_TTL = 60 * 1000
const USER_CACHE_KEY = 'news-system-bootstrap-user-v1'
const RIGHTS_CACHE_KEY = 'news-system-bootstrap-rights-v1'

type CacheRecord<T> = {
    expiresAt: number
    data: T
}

let userMemoryCache: CacheRecord<User> | null = null
let rightsMemoryCache: CacheRecord<Right[]> | null = null
let userPromise: Promise<User> | null = null
let rightsPromise: Promise<Right[]> | null = null

function readSessionCache<T>(key: string): CacheRecord<T> | null {
    if (typeof window === 'undefined') return null

    try {
        const raw = window.sessionStorage.getItem(key)
        if (!raw) return null
        const parsed = JSON.parse(raw) as CacheRecord<T>
        if (!parsed?.expiresAt || parsed.expiresAt <= Date.now()) {
            window.sessionStorage.removeItem(key)
            return null
        }
        return parsed
    } catch {
        return null
    }
}

function writeSessionCache<T>(key: string, data: T) {
    if (typeof window === 'undefined') return

    try {
        window.sessionStorage.setItem(
            key,
            JSON.stringify({
                expiresAt: Date.now() + CACHE_TTL,
                data
            } satisfies CacheRecord<T>)
        )
    } catch {
        // Ignore session cache failures and keep memory cache only.
    }
}

function readUserCache(): User | null {
    if (userMemoryCache && userMemoryCache.expiresAt > Date.now()) {
        return userMemoryCache.data
    }

    const sessionCache = readSessionCache<User>(USER_CACHE_KEY)
    if (!sessionCache) return null
    userMemoryCache = sessionCache
    return sessionCache.data
}

function readRightsCache(): Right[] | null {
    if (rightsMemoryCache && rightsMemoryCache.expiresAt > Date.now()) {
        return rightsMemoryCache.data
    }

    const sessionCache = readSessionCache<Right[]>(RIGHTS_CACHE_KEY)
    if (!sessionCache) return null
    rightsMemoryCache = sessionCache
    return sessionCache.data
}

function writeUserCache(user: User) {
    const record: CacheRecord<User> = {
        expiresAt: Date.now() + CACHE_TTL,
        data: user
    }
    userMemoryCache = record
    writeSessionCache(USER_CACHE_KEY, user)
}

function writeRightsCache(rights: Right[]) {
    const record: CacheRecord<Right[]> = {
        expiresAt: Date.now() + CACHE_TTL,
        data: rights
    }
    rightsMemoryCache = record
    writeSessionCache(RIGHTS_CACHE_KEY, rights)
}

export function clearBootstrapCache() {
    userMemoryCache = null
    rightsMemoryCache = null
    userPromise = null
    rightsPromise = null

    if (typeof window === 'undefined') return
    window.sessionStorage.removeItem(USER_CACHE_KEY)
    window.sessionStorage.removeItem(RIGHTS_CACHE_KEY)
}

export function getCachedBootstrapUser(): User | null {
    return readUserCache()
}

export function getCachedRights(): Right[] | null {
    return readRightsCache()
}

export function fetchBootstrapUser(): Promise<User> {
    const cached = readUserCache()
    if (cached) return Promise.resolve(cached)
    if (userPromise) return userPromise

    userPromise = api.get<User>('/api/users/me', { skipGlobalLoading: true })
        .then((res) => {
            writeUserCache(res.data)
            return res.data
        })
        .finally(() => {
            userPromise = null
        })

    return userPromise
}

export function fetchRightsTree(): Promise<Right[]> {
    const cached = readRightsCache()
    if (cached) return Promise.resolve(cached)
    if (rightsPromise) return rightsPromise

    rightsPromise = api.get<Right[]>('/rights', { skipGlobalLoading: true })
        .then((res) => {
            writeRightsCache(res.data)
            return res.data
        })
        .finally(() => {
            rightsPromise = null
        })

    return rightsPromise
}
