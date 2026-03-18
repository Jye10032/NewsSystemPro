import { useEffect, useRef } from 'react'
import { use, init, graphic } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([LineChart, TitleComponent, TooltipComponent, GridComponent, CanvasRenderer])

export default function HomeTrendChart() {
    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!chartRef.current) return
        const chart = init(chartRef.current)

        const seriesData: { date: string; views: number }[] = []
        const startDate = new Date()
        const DATA_COUNT = 14
        const baseViews = 400
        const growth = 30

        for (let i = 0; i < DATA_COUNT; i++) {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() - (DATA_COUNT - 1 - i))
            const mm = String(date.getMonth() + 1).padStart(2, '0')
            const dd = String(date.getDate()).padStart(2, '0')
            const dayStr = `${mm}-${dd}`
            const noise = (Math.random() - 0.5) * 40
            const views = Math.round(baseViews + i * growth + noise)
            seriesData.push({ date: dayStr, views })
        }

        chart.setOption({
            title: {
                text: '近两周访问趋势',
                left: 'left',
                textStyle: { fontSize: 16, fontWeight: 500 }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: { name: string; value: number }[]) => {
                    const item = params[0]
                    return `${item.name}<br/>浏览量：<b>${item.value}</b>`
                }
            },
            grid: { top: 50, bottom: 30, left: 50, right: 20 },
            xAxis: {
                type: 'category',
                data: seriesData.map((d) => d.date),
                axisTick: { show: false },
                axisLabel: { rotate: 40 }
            },
            yAxis: { type: 'value', axisTick: { show: true } },
            series: [
                {
                    type: 'line',
                    data: seriesData.map((d) => d.views),
                    smooth: true,
                    areaStyle: {
                        color: new graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
                        ])
                    },
                    lineStyle: { width: 2, color: '#1890ff' },
                    itemStyle: { color: '#1890ff' }
                }
            ]
        })

        let observer: ResizeObserver | null = null
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(() => chart.resize())
            observer.observe(chartRef.current)
        }

        return () => {
            observer?.disconnect()
            chart.dispose()
        }
    }, [])

    return <div ref={chartRef} style={{ width: '100%', height: 300 }} />
}
