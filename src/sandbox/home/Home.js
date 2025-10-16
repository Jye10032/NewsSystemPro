import NewsSandBox from '../NewsSandBox'
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Card, Col, Row, List, Avatar, Drawer } from 'antd'
import { EditOutlined, EllipsisOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import * as echarts from 'echarts'
import _ from 'lodash'
const { Meta } = Card
/**
 * 后台管理首页
 * 
 */


export default function Home() {

    // 柱状图引用
    const barRef = useRef()
    // 饼状图引用
    const pieRef = useRef()
    // 抽屉状态
    const [open, setOpen] = useState(false)
    // 饼状图实例
    const [pieChart, setPieChart] = useState(null)
    // 新闻浏览数据
    const [newsViewList, setNewsViewList] = useState([])
    // 新闻点赞数据
    const [newsStarList, setNewsStarList] = useState([])
    // 所有新闻数据
    const [allList, setAllList] = useState([])
    useEffect(() => {

        Promise.all([
            axios.get('/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=7'),
            axios.get('/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=7'),
            axios.get('/news?publishState=2&_expand=category')
        ]).then((res) => {
            //renderBarView(_.groupBy(res[2].data, (item) => item.category.title))
            renderLineView()
            setNewsViewList(res[0].data)
            setNewsStarList(res[1].data)

            setAllList(res[2].data)
        })
        return () => {
            window.onresize = null
        }
    }, [])
    const {
        username,
        region,
        role: { roleName }
    } = JSON.parse(localStorage.getItem('token'))

    // 渲染折线图
    function renderLineView() {
        var myChart = echarts.init(barRef.current);


        //var option;

        var GRID_TOP = 80;
        var GRID_BOTTOM = 60;
        var GRID_LEFT = 60;
        var GRID_RIGHT = 60;

        // 生成日期和浏览量数据
        // 生成上升趋势的数据
        function generateSeriesData() {
            const seriesData = [];
            const startDate = new Date();
            const DATA_COUNT = 14; // 14 天
            let baseViews = 400;   // 起始值
            let growth = 30;       // 平均每天增长量

            for (let i = 0; i < DATA_COUNT; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() - (DATA_COUNT - 1 - i));

                // 👉 格式化为 "MM-DD"
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const dayStr = `${mm}-${dd}`;

                // 在增长趋势上加一点随机浮动
                const noise = (Math.random() - 0.5) * 40; // 小幅波动
                const views = Math.round(baseViews + i * growth + noise);
                seriesData.push({ date: dayStr, views });
            }
            return seriesData;
        }

        const data = generateSeriesData();

        const option = {
            title: {
                text: '近两周每日浏览量',
                subtext: '（单位：次）',
                left: 'center',
                textStyle: {
                    fontSize: 20
                },
                subtextStyle: {
                    color: '#175ce5',
                    fontSize: 14
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    const item = params[0];
                    return `${item.name}<br/>浏览量：<b>${item.value}</b>`;
                },
                backgroundColor: '#fff',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: { color: '#333' }
            },
            grid: {
                top: GRID_TOP,
                bottom: GRID_BOTTOM,
                left: GRID_LEFT,
                right: GRID_RIGHT
            },
            xAxis: {
                type: 'category',
                name: '日期',
                data: data.map(d => d.date),
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: {
                    rotate: 40 // 日期倾斜显示
                }
            },
            yAxis: {
                type: 'value',
                name: '浏览量',
                axisTick: { show: true }
            },
            series: [
                {
                    type: 'line',
                    name: '浏览量',
                    data: data.map(d => d.views),
                    symbol: 'circle',
                    showSymbol: true,
                    symbolSize: 6,
                    areaStyle: { opacity: 0.2 },
                    lineStyle: { width: 2, color: '#175ce5' },
                    itemStyle: { color: '#175ce5' }
                }
            ]
        };
        /**
         * This is some interaction logic with axis break:
         *  - Brush to fisheye-magnify an area.
         *
         * You can ignore this part if you do not need it.
         */
        // 放大 / 拖拽 / fisheye
        // function initAxisBreakInteraction() {
        //     var _brushingEl = null;
        //     myChart.on('click', function (params) {
        //         if (params.name === 'clearAxisBreakBtn') {
        //             var option = {
        //                 xAxis: { breaks: [] },
        //                 yAxis: { breaks: [] }
        //             };
        //             addClearButtonUpdateOption(option, false);
        //             myChart.setOption(option);
        //         }
        //     });
        //     function addClearButtonUpdateOption(option, show) {
        //         option.graphic = [
        //             {
        //                 elements: [
        //                     {
        //                         type: 'rect',
        //                         ignore: !show,
        //                         name: 'clearAxisBreakBtn',
        //                         top: 5,
        //                         left: 5,
        //                         shape: { r: 3, width: 70, height: 30 },
        //                         style: { fill: '#eee', stroke: '#999', lineWidth: 1 },
        //                         textContent: {
        //                             type: 'text',
        //                             style: {
        //                                 text: 'Reset',
        //                                 fontSize: 15,
        //                                 fontWeight: 'bold'
        //                             }
        //                         },
        //                         textConfig: { position: 'inside' }
        //                     }
        //                 ]
        //             }
        //         ];
        //     }
        //     myChart.getZr().on('mousedown', function (params) {
        //         _brushingEl = new echarts.graphic.Rect({
        //             shape: { x: params.offsetX, y: params.offsetY },
        //             style: { stroke: 'none', fill: '#ccc' },
        //             ignore: true
        //         });
        //         myChart.getZr().add(_brushingEl);
        //     });
        //     myChart.getZr().on('mousemove', function (params) {
        //         if (!_brushingEl) {
        //             return;
        //         }
        //         var initX = _brushingEl.shape.x;
        //         var initY = _brushingEl.shape.y;
        //         var currPoint = [params.offsetX, params.offsetY];
        //         _brushingEl.setShape('width', currPoint[0] - initX);
        //         _brushingEl.setShape('height', currPoint[1] - initY);
        //         _brushingEl.ignore = false;
        //     });
        //     document.addEventListener('mouseup', function (params) {
        //         if (!_brushingEl) {
        //             return;
        //         }
        //         var initX = _brushingEl.shape.x;
        //         var initY = _brushingEl.shape.y;
        //         var currPoint = [params.offsetX, params.offsetY];
        //         var xPixelSpan = Math.abs(currPoint[0] - initX);
        //         var yPixelSpan = Math.abs(currPoint[1] - initY);
        //         if (xPixelSpan > 2 && yPixelSpan > 2) {
        //             updateAxisBreak(
        //                 myChart,
        //                 [initX, initY],
        //                 currPoint,
        //                 xPixelSpan,
        //                 yPixelSpan
        //             );
        //         }
        //         myChart.getZr().remove(_brushingEl);
        //         _brushingEl = null;
        //     });
        //     function updateAxisBreak(myChart, initXY, currPoint, xPixelSpan, yPixelSpan) {
        //         var dataXY0 = myChart.convertFromPixel({ gridIndex: 0 }, initXY);
        //         var dataXY1 = myChart.convertFromPixel({ gridIndex: 0 }, currPoint);
        //         function makeDataRange(v0, v1) {
        //             var dataRange = [roundXYValue(v0), roundXYValue(v1)];
        //             if (dataRange[0] > dataRange[1]) {
        //                 dataRange.reverse();
        //             }
        //             return dataRange;
        //         }
        //         var xDataRange = makeDataRange(dataXY0[0], dataXY1[0]);
        //         var yDataRange = makeDataRange(dataXY0[1], dataXY1[1]);
        //         var xySpan = getXYAxisPixelSpan(myChart);
        //         var xGapPercentStr = (xPixelSpan / xySpan[0]) * 100 + '%';
        //         var yGapPercentStr = (yPixelSpan / xySpan[1]) * 100 + '%';
        //         function makeOption(xGapPercentStr, yGapPercentStr) {
        //             return {
        //                 xAxis: {
        //                     breaks: [
        //                         {
        //                             start: xDataRange[0],
        //                             end: xDataRange[1],
        //                             gap: xGapPercentStr
        //                         }
        //                     ]
        //                 },
        //                 yAxis: {
        //                     breaks: [
        //                         {
        //                             start: yDataRange[0],
        //                             end: yDataRange[1],
        //                             gap: yGapPercentStr
        //                         }
        //                     ]
        //                 }
        //             };
        //         }
        //         // This is to make a transition animation effect - firstly create axis break
        //         // on the brushed area, then collapse it to a small gap.
        //         myChart.setOption(makeOption(xGapPercentStr, yGapPercentStr));
        //         setTimeout(() => {
        //             var option = makeOption('80%', '80%');
        //             addClearButtonUpdateOption(option, true);
        //             myChart.setOption(option);
        //         }, 0);
        //     }
        //     function getXYAxisPixelSpan(myChart) {
        //         return [
        //             myChart.getWidth() - GRID_LEFT - GRID_RIGHT,
        //             myChart.getHeight() - GRID_BOTTOM - GRID_TOP
        //         ];
        //     }
        // } // End of initAxisBreakInteraction

        // function roundXYValue(val) {
        //     return +(+val).toFixed(Y_DATA_ROUND_PRECISION);
        // }
        // function generateSeriesData() {
        //     function makeRandom(lastYVal, range, factor) {
        //         lastYVal = lastYVal - range[0];
        //         var delta =
        //             (Math.random() - 0.5 * Math.sin(lastYVal / factor)) *
        //             (range[1] - range[0]) *
        //             0.8;
        //         return roundXYValue(lastYVal + delta + range[0]);
        //     }
        //     var seriesData = [];
        //     var DATA_COUNT = 13;
        //     var reset1 = true;
        //     var reset2 = true;
        //     let yVal = 0;
        //     for (var idx = 0; idx < DATA_COUNT; idx++) {
        //         if (idx < DATA_COUNT / 4) {
        //             yVal = makeRandom(yVal, [100, 10000], 50000);
        //         } else if (idx < (2 * DATA_COUNT) / 3) {
        //             if (reset1) {
        //                 yVal = 110010;
        //                 reset1 = false;
        //             }
        //             yVal = makeRandom(yVal, [100000, 105000], 50000);
        //         } else {
        //             if (reset2) {
        //                 yVal = 300100;
        //                 reset2 = false;
        //             }
        //             yVal = makeRandom(yVal, [300000, 305000], 20000);
        //         }
        //         seriesData.push([idx, yVal]);
        //     }
        //     return seriesData;
        // }
        // setTimeout(initAxisBreakInteraction, 0);

        //option && myChart.setOption(option);
        myChart.setOption(option);

    }
    // // 渲染柱状图
    // function renderBarView(obj) {
    //     const myChart = echarts.init(barRef.current)
    //     window.onresize = () => {
    //         myChart.resize()
    //     }
    //     // 绘制图表
    //     myChart.setOption({
    //         title: {
    //             text: '新闻分类图示'
    //         },
    //         tooltip: {},
    //         xAxis: {
    //             data: Object.keys(obj)
    //         },
    //         yAxis: {
    //             minInterval: 1
    //         },
    //         series: [
    //             {
    //                 name: '销量',
    //                 type: 'bar',
    //                 data: Object.values(obj).map((item) => item.length)
    //             }
    //         ]
    //     })
    // }


    // 渲染饼状图
    function renderPieView() {
        const currentList = allList.filter((item) => item.author === username)
        const groupObj = _.groupBy(currentList, (item) => item.category.title)
        let list = []
        for (let i in groupObj) {
            list.push({
                name: i,
                value: groupObj[i].length
            })
        }
        var myChart
        if (!pieChart) {
            myChart = echarts.init(pieRef.current)
            setPieChart(true)
        } else {
            myChart = pieChart
        }

        const option = {
            title: {
                text: '当前用户新闻分类图示',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: '发布数量',
                    type: 'pie',
                    radius: '50%',
                    data: list,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        }

        option && myChart.setOption(option)
    }
    return (

        <div
            style={{
                width: '100%',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 60px'
            }}>
            <Row gutter={[24, 24]} style={{ width: '100%', maxWidth: '1400px' }}>
                {/* 左半部分：折线图和列表 */}
                <Col span={12}>
                    {/* 折线图 */}
                    <Card
                        ref={barRef}
                        style={{ width: '100%', height: '400px', marginBottom: '24px' }}
                    ></Card>

                    {/* 用户最常浏览 */}
                    <Card
                        title="用户最常浏览"
                        style={{ marginBottom: '24px' }}
                    >
                        <List
                            dataSource={newsViewList}
                            renderItem={(item) => (
                                <List.Item>
                                    <Link to={{ pathname: `/news-manage/preview/${item.id}` }}>{item.title}</Link>
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* 用户点赞最多 */}
                    <Card
                        title="用户点赞最多"
                    >
                        <List
                            dataSource={newsStarList}
                            renderItem={(item) => (
                                <List.Item>
                                    <Link to={{ pathname: `/news-manage/preview/${item.id}` }}>{item.title}</Link>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* 右半部分：用户卡片 */}
                <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Card
                        style={{ width: '360px' }}
                        cover={
                            <img
                                alt="example"
                                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                        }
                        actions={[
                            <SettingOutlined
                                key="setting"
                                onClick={() => {
                                    setOpen(true)
                                    setTimeout(() => {
                                        renderPieView()
                                    }, 0)
                                }}
                            />,
                            <EditOutlined key="edit" />,
                            <EllipsisOutlined key="ellipsis" />
                        ]}
                    >
                        <Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={username}
                            description={
                                <div>
                                    <b>{region ? region : '全球'}</b>
                                    <span style={{ marginLeft: '15px' }}>{roleName}</span>
                                </div>
                            }
                        />
                    </Card>
                </Col>
            </Row>

            <Drawer
                width="550px"
                height="400px"
                title="个人新闻数据分析"
                placement="right"
                onClose={() => setOpen(false)}
                open={open}
            >
                <div
                    ref={pieRef}
                    style={{ width: '100%', height: '400px' }}
                ></div>
            </Drawer>

        </div>
    )
}
