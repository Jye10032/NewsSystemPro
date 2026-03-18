import { useEffect, useRef } from 'react'
import { use, init } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

interface ChartDatum {
    name: string
    value: number
}

export default function HomeCategoryChart({ data }: { data: ChartDatum[] }) {
    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!chartRef.current) return
        const chart = init(chartRef.current)

        chart.setOption({
            title: {
                text: '新闻分类分布',
                left: 'left',
                textStyle: { fontSize: 16, fontWeight: 500 }
            },
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { orient: 'horizontal', bottom: 0, left: 'center' },
            series: [
                {
                    type: 'pie',
                    radius: ['35%', '60%'],
                    center: ['50%', '45%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false },
                    emphasis: {
                        label: { show: true, fontSize: 14, fontWeight: 'bold' }
                    },
                    data
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
    }, [data])

    return <div ref={chartRef} style={{ width: '100%', height: 300 }} />
}
