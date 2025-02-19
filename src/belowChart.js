import React from "react";
import { Chart } from "react-stockcharts";
import {
    atr,
    rsi,
} from "react-stockcharts/lib/indicator";
import {
    LineSeries,
    StochasticSeries,
} from "react-stockcharts/lib/series";
import { format } from "d3-format";
import { RSITooltip } from "react-stockcharts/lib/tooltip";
import { timeFormat } from "d3-time-format";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {

    MouseCoordinateX,
    MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";
import { ema, stochasticOscillator } from "react-stockcharts/lib/indicator";
import {
    StochasticTooltip,
} from "react-stockcharts/lib/tooltip";
import { OHLCTooltip } from "react-stockcharts/lib/tooltip";

const stoAppearance = {
    stroke: Object.assign({}, StochasticSeries.defaultProps.stroke),
};

const rsiCalculator = rsi()
    .options({ windowSize: 14 })
    .merge((d, c) => {
        d.rsi = c;
    })
    .accessor((d) => d.rsi);


const atrCalculator = atr()
    .merge((d, c) => {
        d.atr = c;
    })
    .accessor((d) => d.atr);

const fastSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 1 })
    .merge((d, c) => {
        d.fastSTO = c;
    })
    .accessor((d) => d.fastSTO);


const belowChart = [
    {
        id: "rsi",
        indicator: "rsi",
        component: (index,dimensions, { showTicks }) => {
            return (
                <Chart
                    id={6}
                    yExtents={[0, 100]}
                    height={150}
                    origin={(w, h) => [0,( dimensions?.height-(((dimensions?.height/100)*20))*index)]}
                    padding={{ top: 10, bottom: 10 }}
                >
                    {console.log("rsi",( dimensions?.height-(((dimensions?.height/100)*20))*index) ,index)}
                    <XAxis axisAt="bottom" orient="bottom" showTicks={showTicks} />
                    <YAxis axisAt="right" orient="right" />
                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}
                    />
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}
                    />
                    <LineSeries yAccessor={(d) => d.rsi || null} stroke="blue" />
                    <RSITooltip
                        origin={[-38, 15]}
                        yAccessor={(d) => d.rsi}
                        options={rsiCalculator.options()}
                        label="RSI"
                    />
                </Chart>
            );
        },
    },
    {
        id: "atr",
        indicator: "ATR",
        component: (index, { showTicks }) => {
            return (
                <Chart
                    id={3}
                    yExtents={[0, 100]}
                    height={125}
                    origin={(w, h) => [0, 475]}
                    padding={{ top: 10, bottom: 10 }}
                >
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        showTicks={showTicks}
                        outerTickSize={0}
                    />
                    <YAxis axisAt="right" orient="right" tickValues={[20, 50, 80]} />
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}
                    />
                    <LineSeries yAccessor={(d) => d.atr || null} stroke="blue" />
                        
                    {/* <StochasticTooltip
                        origin={[-38, 15]}
                        yAccessor={(d) => d.atrCalculator}
                        options={atrCalculator.options()}
                        appearance={atrCalculator}
                        label="ATR"
                    /> */}
                </Chart>
            );
        },
    },
    {
        id: "macd",
        indicator: "MACD",
        component: (index, dimensions, { showTicks }) => {
            return (
                <Chart
                    id={4}
                    yExtents={[0, 100]}
                    height={150}
                    origin={(w, h) => [0, ( dimensions?.height-(((dimensions?.height/100)*20))*index)]}
                    padding={{ top: 10, bottom: 10 }}
                >
                                        {console.log("macd",( dimensions?.height-(((dimensions?.height/100)*20))*index) ,index)}                
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        showTicks={true}
                        outerTickSize={0}
                    />
                    <YAxis axisAt="right" orient="right" tickValues={[20, 50, 80]} />
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}
                    />
                    <StochasticSeries yAccessor={(d) => d.slowSTO} {...stoAppearance} />
                    <StochasticTooltip
                        origin={[-38, 15]}
                        yAccessor={(d) => d.fastSTO}
                        options={fastSTO.options()}
                        appearance={stoAppearance}
                        label="MACD"
                    />
                </Chart>
            );
        },
    },
    // {
    //     id: "pivotPoints",
    //     indicator: "pivotPoints",
    //     component: (index, { showTicks }) => {
    //         return (
    //             <Chart
    //                 id={7}
    //                 yExtents={(d) => [d.pivot, d.r1, d.s1, d.r2, d.s2, d.r3, d.s3]}
    //                 height={125}
    //                 origin={(w, h) => [0, 225 + (index * 125)]}
    //                 padding={{ top: 10, bottom: 10 }}
    //             >
    //                 <XAxis axisAt="bottom" orient="bottom" showTicks={showTicks} />
    //                 <YAxis axisAt="right" orient="right" />
    //                 <MouseCoordinateX at="bottom" orient="bottom" displayFormat={timeFormat("%Y-%m-%d")} />
    //                 <MouseCoordinateY at="right" orient="right" displayFormat={format(".2f")} />
    //                 <LineSeries yAccessor={(d) => d.pivot} stroke="orange" />
    //                 <LineSeries yAccessor={(d) => d.r1} stroke="green" strokeDasharray="ShortDash" />
    //                 <LineSeries yAccessor={(d) => d.s1} stroke="red" strokeDasharray="ShortDash" />
    //                 <LineSeries yAccessor={(d) => d.r2} stroke="green" strokeDasharray="ShortDot" />
    //                 <LineSeries yAccessor={(d) => d.s2} stroke="red" strokeDasharray="ShortDot" />
    //                 <LineSeries yAccessor={(d) => d.r3} stroke="green" strokeDasharray="Dot" />
    //                 <LineSeries yAccessor={(d) => d.s3} stroke="red" strokeDasharray="Dot" />
    //                 <OHLCTooltip origin={[-38, 15]} />
    //             </Chart>
    //         );
    //     },
    // },
    // {
    //     id: "supertrend",
    //     indicator: "supertrend",
    //     component: (index, { showTicks }) => {
    //         return (
    //             <Chart
    //                 id={8}
    //                 yExtents={(d) => [d.supertrend]}
    //                 height={125}
    //                 origin={(w, h) => [0, 225 + (index * 125)]}
    //                 padding={{ top: 10, bottom: 10 }}
    //             >
    //                 <XAxis axisAt="bottom" orient="bottom" showTicks={showTicks} />
    //                 <YAxis axisAt="right" orient="right" />
    //                 <MouseCoordinateX
    //                     at="bottom"
    //                     orient="bottom"
    //                     displayFormat={timeFormat("%Y-%m-%d")}
    //                 />
    //                 <MouseCoordinateY
    //                     at="right"
    //                     orient="right"
    //                     displayFormat={format(".2f")}
    //                 />
    //                 <LineSeries
    //                     yAccessor={(d) => d.supertrend}
    //                     stroke={(d) => (d.close > d.supertrend ? "green" : "red")}
    //                 />
    //                 <OHLCTooltip origin={[-38, 15]} />
    //             </Chart>
    //         );
    //     },
    // },
];

// Export belowChart
export { belowChart };