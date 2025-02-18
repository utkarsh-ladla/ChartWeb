import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { ChartCanvas, Chart } from "react-stockcharts";
import { RSITooltip } from "react-stockcharts/lib/tooltip";
import { atr, bollingerBand, macd, rsi, sma, wma, tma, heikinAshi } from "react-stockcharts/lib/indicator";

import {
  BarSeries,
  StraightLine,
  CandlestickSeries,
  LineSeries,
  StochasticSeries,
  BollingerSeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CrossHairCursor,
  EdgeIndicator,
  CurrentCoordinate,
  MouseCoordinateX,
  MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
  OHLCTooltip,
  MovingAverageTooltip,
  StochasticTooltip,
} from "react-stockcharts/lib/tooltip";
import { ema, stochasticOscillator } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

const stoAppearance = {
  stroke: Object.assign({}, StochasticSeries.defaultProps.stroke),
};



const CandleStickChartWithFullStochasticsIndicator = ({
  type = "svg",
  data: initialData,
  width,
  ratio,
  selectedIndicators,
  mostRecentIndicator,
  reorderedBelowChart = [],
  SelectedInterval

}) => {
  const chartContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const height = 750;
  const margin = { left: 70, right: 70, top: 20, bottom: 30 };
  var heightIndex = 0;

  const gridHeight = height - margin.top - margin.bottom;
  const gridWidth = width - margin.left - margin.right;

  const showGrid = true;
  const yGrid = showGrid
    ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.1 }
    : {};
  const xGrid = showGrid
    ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.1 }
    : {};

  const ema20 = ema()
    .id(0)
    .options({ windowSize: 20 })
    .merge((d, c) => {
      d.ema20 = c;
    })
    .accessor((d) => d.ema20);

  const ema50 = ema()
    .id(2)
    .options({ windowSize: 50 })
    .merge((d, c) => {
      d.ema50 = c;
    })
    .accessor((d) => d.ema50);

  const sma20 = sma()
    .options({ windowSize: 20 })
    .merge((d, c) => {
      d.sma20 = c;
    })
    .accessor((d) => d.sma20);

  const slowSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 3 })
    .merge((d, c) => {
      d.slowSTO = c;
    })
    .accessor((d) => d.slowSTO);

  const fastSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 1 })
    .merge((d, c) => {
      d.fastSTO = c;
    })
    .accessor((d) => d.fastSTO);

  const fullSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 3, dWindowSize: 4 })
    .merge((d, c) => {
      d.fullSTO = c;
    })
    .accessor((d) => d.fullSTO);

  const rsiCalculator = rsi()
    .options({ windowSize: 14 })
    .merge((d, c) => {
      d.rsi = c;
    })
    .accessor((d) => d.rsi);

  const bb = bollingerBand()
    .merge((d, c) => {
      d.bb = c;
    })
    .accessor((d) => d.bb);

  const wma20 = wma()
    .id(4)
    .options({ windowSize: 20 })
    .merge((d, c) => {
      d.wma = c;
    })
    .accessor((d) => d.wma);


  const tma20 = tma()
    .id(5) // Unique identifier
    .options({ windowSize: 20 }) // Set the window size
    .merge((d, c) => {
      d.tma = c; // Merge the TMA value into the data object
    })
    .accessor((d) => d.tma); // Accessor function to retrieve the TMA value

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
    (d) => d.date
  );


  const macdCalculator = macd()
    .options({
      fast: 12,
      slow: 26,
      signal: 9,
    })
    .merge((d, c) => {
      d.macd = c;
    })
    .accessor((d) => d.macd);

  const atrCalculator = atr()
    .merge((d, c) => {
      d.atr = c;
    })
    .accessor((d) => d.atr);

  const bbAppearance = {
    stroke: {
      top: "#964B00",
      middle: "#FF6600",
      bottom: "#964B00",
    },
    fill: "#4682B4",
  };

  const calculatedData = tma20(wma20(macdCalculator(
    atrCalculator(
      rsiCalculator(
        sma20(bb(ema20(ema50(slowSTO(fastSTO(fullSTO(initialData)))))))
      )
    ))
  ));

  const { data, xScale, xAccessor, displayXAccessor } =
    xScaleProvider(calculatedData);

  const start = xAccessor(last(data));
  const end = xAccessor(data[Math.max(0, data.length - 150)]);
  const xExtents = [start, end];
  const stoAppearance = {
    stroke: Object.assign({}, StochasticSeries.defaultProps.stroke),
  };

  const indicators = [ema20, ema50, sma20, slowSTO, fastSTO, fullSTO, rsiCalculator, bb, wma20, tma20];

  // Find the selected indicator from the list
  const selectedInd = indicators.find(ind => ind.id() === selectedIndicators.id); // Assuming selectedIndicator contains an id


  useEffect(() => {
    console.log(selectedIndicators);
  }, [selectedIndicators]);

  let showTicks = false
  const oldestIndicator = selectedIndicators[0];

  // const belowChart = [
  //   {
  //     id: "rsi",
  //     indicator: "rsi",
  //     component: (index, {showTicks}) => {
  //       return (
  //         <Chart
  //           id={6}
  //           yExtents={[0, 100]}
  //           height={125}
  //           origin={(w, h) => [0, 225 + (index * 125)]}
  //           padding={{ top: 10, bottom: 10 }}
  //         >
  //           <XAxis axisAt="bottom" orient="bottom" showTicks={showTicks} />
  //           <YAxis axisAt="right" orient="right" />
  //           <MouseCoordinateX
  //             at="bottom"
  //             orient="bottom"
  //             displayFormat={timeFormat("%Y-%m-%d")}
  //           />
  //           <MouseCoordinateY
  //             at="right"
  //             orient="right"
  //             displayFormat={format(".2f")}
  //           />
  //           <LineSeries yAccessor={(d) => d.rsi || null} stroke="blue" />
  //           <RSITooltip
  //             origin={[-38, 15]}
  //             yAccessor={(d) => d.rsi}
  //             options={rsiCalculator.options()}
  //             label="RSI"
  //           />
  //         </Chart>
  //       );
  //     },
  //   },
  //   {
  //     id: "atr",
  //     indicator: "ATR",
  //     component: (index, {showTicks}) => {
  //       return (
  //         <Chart
  //           id={3}
  //           yExtents={[0, 100]}
  //           height={125}
  //           origin={(w, h) => [0, 225 + (index * 125)]}
  //           padding={{ top: 10, bottom: 10 }}
  //         >
  //           <XAxis
  //             axisAt="bottom"
  //             orient="bottom"
  //             showTicks={showTicks}
  //             outerTickSize={0}
  //           />
  //           <YAxis axisAt="right" orient="right" tickValues={[20, 50, 80]} />
  //           <MouseCoordinateY
  //             at="right"
  //             orient="right"
  //             displayFormat={format(".2f")}
  //           />
  //           <LineSeries yAccessor={(d) => d.atr || null} stroke="blue" />
  //           <StochasticTooltip
  //             origin={[-38, 15]}
  //             yAccessor={(d) => d.atrCalculator}
  //             options={atrCalculator.options()}
  //             appearance={stoAppearance}
  //             label="Slow STO"
  //           />
  //         </Chart>
  //       );
  //     },
  //   },
  //   {
  //     id: "macd",
  //     indicator: "MACD",
  //     component: (index, {showTicks}) => {
  //       return (
  //         <Chart
  //           id={4}
  //           yExtents={[0, 100]}
  //           height={125}
  //           origin={(w, h) => [0, 225 + (index * 125)]}
  //           padding={{ top: 10, bottom: 10 }}
  //         >
  //           <XAxis
  //             axisAt="bottom"
  //             orient="bottom"
  //             showTicks={showTicks}
  //             outerTickSize={0}
  //           />
  //           <YAxis axisAt="right" orient="right" tickValues={[20, 50, 80]} />
  //           <MouseCoordinateY
  //             at="right"
  //             orient="right"
  //             displayFormat={format(".2f")}
  //           />
  //           <StochasticSeries yAccessor={(d) => d.slowSTO} {...stoAppearance} />
  //           <StochasticTooltip
  //             origin={[-38, 15]}
  //             yAccessor={(d) => d.fastSTO}
  //             options={fastSTO.options()}
  //             appearance={stoAppearance}
  //             label="MACD"
  //           />
  //         </Chart>
  //       );
  //     },
  //   },

  // ];

  const mainChart = [
    {
      id: "ema",
      indicator: "EMA",
      cordinate: (
        <CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
      ),
      component: (
        <LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()} />
      ),
    },
    {
      id: "ema50",
      indicator: "EMA50",
      cordinate: (
        <CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} />
      ),
      component: (
        <LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()} />
      ),
    },
    {
      id: "sma20",
      indicator: "SMA20",
      cordinate: (
        <CurrentCoordinate yAccessor={sma20.accessor()} fill={sma20.stroke()} />
      ),
      component: (
        <LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()} />
      ),
    },
    {
      id: "wma20",
      indicator: "wma20",
      cordinate: (
        <CurrentCoordinate yAccessor={wma20.accessor()} fill={wma20.stroke()} />
      ),
      component: (
        <LineSeries yAccessor={wma20.accessor()} stroke={wma20.stroke()} />
      ),
    },
    {
      id: "bollingerBands",
      indicator: "Bollinger Bands",
      cordinate: (
        <CurrentCoordinate
          yAccessor={bb.accessor().middle}
          fill={bbAppearance.stroke.middle}
        />
      ),
      component: <BollingerSeries yAccessor={(d) => d.bb} {...bbAppearance} />,
    },

    {
      id: "tma20",
      indicator: "tma20",
      cordinate: (
        <CurrentCoordinate yAccessor={(d) => d.tma20} fill={(d) => d.tma20} />
      ),
      component: (
        <LineSeries yAccessor={(d) => d.tma20} stroke={(d) => d.tma20} />
      ),
    },
    {
      id: "heikinAshi",
      indicator: "heikinAshi",
      cordinate: (
        <CurrentCoordinate yAccessor={(d) => d.heikinAshi.close} fill={(d) => d.heikinAshi.close} />
      ),
      component: (
        <CandlestickSeries
          yAccessor={(d) => ({
            open: d.heikinAshi.open,
            high: d.heikinAshi.high,
            low: d.heikinAshi.low,
            close: d.heikinAshi.close,
          })}
        />
      ),
    },
  ];


  useEffect(() => {
    const handleWheel = (event) => {

      if (chartContainerRef.current?.contains(event.target)) {
        event.preventDefault();
      }
    };

    const handleMouseDown = (event) => {
      if (chartContainerRef.current?.contains(event.target) && event.button === 0) {
        setIsDragging(true);
        setStartY(event.clientY);
        setScrollTop(window.scrollY);
      }
    };

    const handleMouseMove = (event) => {
      if (isDragging) {
        const deltaY = event.clientY - startY;
        window.scrollTo(0, scrollTop - deltaY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startY, scrollTop]);

  const getMovingAverageOptions = () => {
    const options = [];
    if (selectedIndicators.includes('ema')) {
      options.push({
        yAccessor: ema20.accessor(),
        type: ema20.type(),
        stroke: ema20.stroke(),
        windowSize: ema20.options().windowSize,
      });
    }
    if (selectedIndicators.includes('ema20')) {
      options.push({
        yAccessor: ema20.accessor(),
        type: ema20.type(),
        stroke: ema20.stroke(),
        windowSize: ema20.options().windowSize,
      });
    }
    if (selectedIndicators.includes('ema50')) {
      options.push({
        yAccessor: ema50.accessor(),
        type: ema50.type(),
        stroke: ema50.stroke(),
        windowSize: ema50.options().windowSize,
      });
    }
    if (selectedIndicators.includes('sma20')) {
      options.push({
        yAccessor: sma20.accessor(),
        type: sma20.type(),
        stroke: sma20.stroke(),
        windowSize: sma20.options().windowSize,
      });
    }
    if (selectedIndicators.includes('bb')) {
      options.push({
        yAccessor: bb.accessor(),
        type: bb.type(),
        stroke: bb.stroke(),
        windowSize: bb.options().windowSize,
      });
    }
    return options;
  };


  return (
    <div ref={chartContainerRef}>
      <ChartCanvas
        height={900}
        width={width}
        ratio={ratio}
        margin={margin}
        type={type}
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
        zoomEvent={true}
      >
        {Array.isArray(reorderedBelowChart) &&
          reorderedBelowChart.map((chart, index) => {
            if (selectedIndicators.includes(chart.id)) {
              heightIndex = heightIndex + 1;

              const isMostRecent = chart.id === mostRecentIndicator;

              return chart.component(heightIndex, { showTicks: isMostRecent });
            }

            return null;
          })
        }


        <Chart
          id={1}
          height={325}
          yExtents={(d) => [d.high, d.low]}
          padding={{ top: 10, bottom: 20 }}
        >
          <YAxis axisAt="right" orient="right" ticks={5} {...yGrid} />
          <XAxis
            axisAt="bottom"
            orient="bottom"
            showTicks={selectedIndicators.length === 0}
            outerTickSize={0}
          />

          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".2f")}
          />

          <CandlestickSeries />

          {/* <LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()} />
        <LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()} />

        <CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
        <CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} /> */}

          {mainChart.map((line, index) => {
            return selectedIndicators.indexOf(line.id) !== -1
              ? (line.cordinate, line.component)
              : null;
          })}

          <EdgeIndicator
            itemType="last"
            orient="right"
            edgeAt="right"
            yAccessor={(d) => d.close}
            fill={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
          />

          <StraightLine type="vertical" xValue={608} />
          <StraightLine type="vertical" xValue={558} strokeDasharray="Dot" />
          <StraightLine type="vertical" xValue={578} strokeDasharray="LongDash" />

          <OHLCTooltip origin={[-40, -10]} />
          <MovingAverageTooltip
            onClick={(e) => console.log(e)}
            origin={[-38, 5]}
            options={getMovingAverageOptions()
            //   [
            //   {
            //     yAccessor: ema20.accessor(),
            //     type: ema20.type(),
            //     stroke: ema20.stroke(),
            //     windowSize: ema20.options().windowSize,
            //   },
            //   {
            //     yAccessor: ema50.accessor(),
            //     type: ema50.type(),
            //     stroke: ema50.stroke(),
            //     windowSize: ema50.options().windowSize,
            //   },
            //   {
            //     yAccessor: ema50.accessor(),
            //     type: ema50.type(),
            //     stroke: ema50.stroke(),
            //     windowSize: ema50.options().windowSize,
            //   },
            // ]
          }
          />
        </Chart>

        <Chart
          id={2}
          yExtents={(d) => d.volume}
          height={100}
          origin={(w, h) => [0, h - 625]}
        >
          <YAxis
            axisAt="left"
            orient="left"
            ticks={5}
            tickFormat={format(".2s")}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".4s")}
          />
          <BarSeries
            yAccessor={(d) => d.volume}
            fill={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
          />
          {/* <XAxis axisAt="bottom" orient="bottom" {...xGrid} /> */}
        </Chart>

        <CrossHairCursor />
      </ChartCanvas>
    </div>
  );
};

CandleStickChartWithFullStochasticsIndicator.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithFullStochasticsIndicator.defaultProps = {
  type: "svg",
};

export default fitWidth(CandleStickChartWithFullStochasticsIndicator);