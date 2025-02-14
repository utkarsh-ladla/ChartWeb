import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import Chart from "./Chart";
import { getData } from "./utils";
import { TypeChooser } from "react-stockcharts/lib/helper";

const ChartComponent = () => {
  const [data, setData] = useState(null);
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const indicators = [
    { id: "rsi", name: "RSI: Relative Strength Index" },
    { id: "sma20", name: "SMA: Simple Moving Average" },
    { id: "ema", name: "EMA: Exponential Moving Average" },
    { id: "atr", name: "ATR: Average True Range" },
    { id: "macd", name: "MACD: Moving Average Convergence Divergence" },
    { id: "bollingerBands", name: "Bollinger Bands" },
    { id: "pivotPoints", name: "Pivot Points" },
    { id: "supertrend", name: "Supertrend" },
    { id: "anchoredVWAP", name: "Anchored VWAP" },
    { id: "vwap", name: "VWAP: Volume Weighted Average Price" },
    { id: "adx", name: "ADX: Average Directional Index" },
    { id: "cci", name: "CCI: Commodity Channel Index" },
    { id: "obv", name: "OBV: On-Balance Volume" },
    { id: "stochasticOscillator", name: "Stochastic Oscillator" },
    { id: "williamsR", name: "Williams %R" },
    { id: "roc", name: "ROC: Rate of Change" },
    { id: "momentum", name: "Momentum Indicator" },
  ];

  useEffect(() => {
    getData().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const handleCheckboxChange = (id) => {
    setSelectedIndicators((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredIndicators = indicators.filter(({ name }) =>
    name.toLowerCase().includes(searchInput.toLowerCase())
  );
  return (
    <div style={{ position: "relative", width: "100%", padding: "20px", boxSizing: "border-box" }}>
      {/* Header Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Search Input on the Left */}
        <input
          type="text"
          placeholder="Search indicators..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            width: "250px",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
  
        {/* Button on the Right */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: "12px 15px",
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            borderRadius: "4px",
          }}
        >
          Select Indicators
        </button>
      </div>
  
      {/* Indicator Selection Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "10px",
            width: "250px",
            maxWidth: "90vw",
            background: "white",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "10px",
            zIndex: 10,
            borderRadius: "5px",
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {filteredIndicators.length > 0 ? (
            filteredIndicators.map(({ id, name }) => (
              <div key={id} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                <input
                  id={id}
                  type="checkbox"
                  checked={selectedIndicators.includes(id)}
                  onChange={() => handleCheckboxChange(id)}
                  style={{ marginRight: "5px" }}
                />
                <label htmlFor={id} style={{ fontSize: "14px", color: "#333" }}>
                  {name || id.toUpperCase()}
                </label>
              </div>
            ))
          ) : (
            <p>No indicators found</p>
          )}
        </div>
      )}
  
      {/* Chart Component - Fixed Spacing */}
      <div style={{ marginTop: "10px", width: "100%", maxWidth: "100vw", overflow: "hidden" }}>
        <TypeChooser>
          {(type) => <Chart type={type} data={data} selectedIndicators={selectedIndicators} />}
        </TypeChooser>
      </div>
    </div>
  );
  
};

render(<ChartComponent />, document.getElementById("root"));
export default ChartComponent;
