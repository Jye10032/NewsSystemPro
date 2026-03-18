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

export default function HomePersonalPieChart({ data }: { data: ChartDatum[] }) {
    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!chartRef.current) return
        const chart = init(chartRef.current)

        chart.setOption({
            title: { text: '个人新闻分类', left: 'center' },
            tooltip: { trigger: 'item' },
            legend: { orient: 'vertical', left: 'left' },
            series: [
                {
                    name: '发布数量',
                    type: 'pie',
                    radius: '50%',
                    data,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
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

    return <div ref={chartRef} style={{ width: '100%', height: 400 }} />
}
