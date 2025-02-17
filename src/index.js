import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import Chart from "./Chart";
import { getData } from "./utils";
import { TypeChooser } from "react-stockcharts/lib/helper";
import { belowChart } from "./belowChart";
import { timeParse } from "d3-time-format";
// import {mainchart} from ""

const ChartComponent = () => {
  const [data, setData] = useState(null);
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [stockList, setStockList] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mostRecentIndicator, setMostRecentIndicator] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [interval, setInterval] = useState("5minute"); // Default interval
  const [selectedInstrumentToken, setSelectedInstrumentToken] = useState(null);

  const indicators = [
    { id: "rsi", name: "RSI: Relative Strength Index" },
    { id: "sma20", name: "SMA20: Simple Moving Average" },
    { id: "ema", name: "EMA: Exponential Moving Average" },
    { id: "ema50", name: "EMA50: Exponential Moving Average"},
    { id: "atr", name: "ATR: Average True Range" },
    { id: "macd", name: "MACD: Moving Average Convergence Divergence" },
    { id: "bollingerBands", name: "Bollinger Bands" },
    { id: "wma20", name: "wma20" },
    // { id: "tma20", name: "tma20" },
    // { id: "heikinAshi", name: "heikinAshi" },
    //   { id: "vwap", name: "VWAP: Volume Weighted Average Price" },
    //   { id: "adx", name: "ADX: Average Directional Index" },
    //   { id: "cci", name: "CCI: Commodity Channel Index" },
    //   { id: "obv", name: "OBV: On-Balance Volume" },
    //   { id: "stochasticOscillator", name: "Stochastic Oscillator" },
    //   { id: "williamsR", name: "Williams %R" },
    //   { id: "roc", name: "ROC: Rate of Change" },
    //   { id: "momentum", name: "Momentum Indicator" },
  ];

  const intervals = [
    "minute",
    "day",
    "3minute",
    "5minute",
    "10minute",
    "15minute",
    "30minute",
    "60minute",
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(value.length > 0);

  };

  const getStockList = async (query) => {
    if (!query) {
      setFilteredStocks([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.siyacharting.com/api/ds/search_symbol?s=${query}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const json = await response.json();
      setStockList(json);
      setFilteredStocks(json);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  const parseDate = timeParse("%Y-%m-%d");
  const candleData = async (instrument_token) => {
    const response = await fetch(
      `http://192.168.1.39:5300/api/ds/historical?instrument_token=${instrument_token}&from_date=${"2025-01-05T21:16"}&to_date=${"2025-02-01T21:16"}&interval=${interval}`);
    const json = await response.json();
    console.log("API Response:", json);
    const newData = json.map((d) => {
      d.date = parseDate(d.date.split("T")[0]);
      d.close = +d.close;
      d.high = +d.high;
      d.low = +d.low;
      d.open = +d.open;
      d.volume = +d.volume;
      return d;
    });

    setData(newData);
  };

  useEffect(() => {
    if (searchTerm) {
      getStockList(searchTerm);
      console.log("searchTerm", searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    getData().then(setData).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedInstrumentToken) {
      candleData(selectedInstrumentToken, interval);
    }
  }, [interval, selectedInstrumentToken]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const handleCheckboxChange = (id) => {
    setSelectedIndicators((prev) => {
      const newSelectedIndicators = prev.includes(id)
        ? prev.filter((item) => item !== id) 
        : [...prev, id]; 
      setMostRecentIndicator(id);

      return newSelectedIndicators;
    });
  };
  const filteredIndicators = indicators.filter(({ name }) =>
    name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const reorderedBelowChart = selectedIndicators
    .map((id) => belowChart.find((chart) => chart.id === id))
    .filter((chart) => chart !== undefined);

  console.log(reorderedBelowChart)  


  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "relative", width: "250px" }}>
          <input
            type="text"
            placeholder="Search stock..."
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid black",
              borderRadius: "4px",
              backgroundColor: "white",
              color: "black",
              outline: "none",
            }}
          />
          {showDropdown && filteredStocks.length > 0 && (
            <div
              style={{
                position: "absolute",
                width: "100%",
                backgroundColor: "white",
                border: "1px solid black",
                borderTop: "none",
                borderRadius: "4px",
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                maxHeight: "150px",
                overflowY: "auto",
                zIndex: 10,
              }}
            >
              {filteredStocks.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    color: "black",
                    backgroundColor: "white",
                    borderBottom: "1px solid #eee",
                  }}
                  onMouseDown={() => {
                    setSelectedInstrumentToken(item.instrument_token);
                    candleData(item.instrument_token, interval);
                  }}
                >
                  {item.tradingsymbol}
                </div>
              ))}
            </div>
          )}
          {showDropdown && filteredStocks.length === 0 && (
            <div
              style={{
                position: "absolute",
                width: "100%",
                backgroundColor: "white",
                border: "1px solid black",
                borderTop: "none",
                borderRadius: "4px",
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                padding: "8px",
                color: "black",
                zIndex: 10,
              }}
            >
              No data found
            </div>
          )}
        </div>

        {/* Interval Selection Dropdown */}
        <div style={{ position: "relative", width: "90px", marginBottom: "20px", marginLeft: "20px",marginRight: "auto" }}>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {intervals.map((intervalOption) => (
              <option key={intervalOption} value={intervalOption}>
                {intervalOption}
              </option>
            ))}
          </select>
        </div>


        {/* Indicator Selection */}
        <div
          style={{ position: "relative", width: "250px", marginBottom: "20px" }}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: "100%",
              padding: "10px",
              background: "black",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Select Indicators
          </button>
          {isOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                background: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "10px",
                zIndex: 10,
              }}
            >
              {indicators.map(({ id, name }) => (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={selectedIndicators.includes(id)}
                    onChange={() => handleCheckboxChange(id)}
                    style={{ marginRight: "5px" }}
                  />
                  <label
                    htmlFor={id}
                    style={{ fontSize: "14px", color: "#333" }}
                  >
                    {name || id.toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Component */}
      <TypeChooser>
        {(type) => (
          <Chart
            type={type}
            data={data}
            selectedIndicators={selectedIndicators}
            mostRecentIndicator={mostRecentIndicator}
            reorderedBelowChart={reorderedBelowChart}
          />
        )}
      </TypeChooser>
    </div>
  );


};

render(<ChartComponent />, document.getElementById("root"));
export default ChartComponent;
