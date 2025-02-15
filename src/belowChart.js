// Define belowChart
import React from "react";
import {  Chart } from "react-stockcharts";
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
        component: (index, { showTicks }) => {
            return (
                <Chart
                    id={6}
                    yExtents={[0, 100]}
                    height={125}
                    origin={(w, h) => [0, 225 + (index * 125)]}
                    padding={{ top: 10, bottom: 10 }}
                >
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
                    origin={(w, h) => [0, 225 + (index * 125)]}
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
                    <StochasticTooltip
                        origin={[-38, 15]}
                        yAccessor={(d) => d.atrCalculator}
                        options={atrCalculator.options()}
                        appearance={stoAppearance}
                        label="Slow STO"
                    />
                </Chart>
            );
        },
    },
    {
        id: "macd",
        indicator: "MACD",
        component: (index, { showTicks }) => {
            return (
                <Chart
                    id={4}
                    yExtents={[0, 100]}
                    height={125}
                    origin={(w, h) => [0, 225 + (index * 125)]}
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
];

// Export belowChart
export { belowChart };