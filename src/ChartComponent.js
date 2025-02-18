import React, { useState, useEffect, useRef } from "react";
import { render } from "react-dom";
import Chart from "./Chart";
import { getData } from "./utils";
import { TypeChooser } from "react-stockcharts/lib/helper";
import { belowChart } from "./belowChart";
import { timeParse } from "d3-time-format";
import { mainChart } from "./mainChart"
import { debounce } from "lodash";
import { useHistory } from "react-router-dom";



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
    const [interval, setInterval] = useState("minute"); // Default interval
    const [selectedInstrumentToken, setSelectedInstrumentToken] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    // const [fromDate, setFromDate] = useState(new Date()); // Start with current date
    const [loading, setLoading] = useState(false);
    const chartRef = useRef(null);


    useEffect(() => {
        const pathname = window.location.pathname;
        const segments = pathname.split("/").filter(Boolean);
        const token = segments[segments.length - 1];
        setSelectedInstrumentToken(token);
    }, []);
    const history = useHistory();

    const indicators = [
        { id: "rsi", name: "RSI: Relative Strength Index" },
        { id: "sma20", name: "SMA20: Simple Moving Average" },
        { id: "ema", name: "EMA: Exponential Moving Average" },
        { id: "ema50", name: "EMA50: Exponential Moving Average" },
        { id: "atr", name: "ATR: Average True Range" },
        { id: "macd", name: "MACD: Moving Average Convergence Divergence" },
        { id: "bollingerBands", name: "Bollinger Bands" },
        { id: "wma20", name: "wma20" },
    ];

    const intervals = [
        "minute",
        "3minute",
        "5minute",
        "10minute",
        "15minute",
        "30minute",
        "60minute",
        "Day"
    ];



    const debouncedGetStockList = debounce(async (query) => {
        if (!query) {
            setFilteredStocks([]);
            return;
        }
        try {
            setIsSearching(true);
            const response = await fetch(
                `https://api.siyacharting.com/api/ds/search_symbol?s=${query}`
            );
            if (!response.ok) throw new Error("Failed to fetch data");
            const json = await response.json();
            setStockList(json);
            setFilteredStocks(json);
        } catch (error) {
            console.error("Error fetching stocks:", error);
        } finally {
            setIsSearching(false); // End search
        }
    }, 2000);


    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        debouncedGetStockList(query); // Call debounced function

    };

    const formatDate = (date) => {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    
    const getStartDate = (interval) => {
        const date = new Date();
        if (interval === "day") {
            date.setMonth(date.getMonth() - 60);
        } else if (interval === "minute") {
            date.setDate(date.getDate() - 45);
        } else if (interval === "3minute") {
            date.setDate(date.getDate() - 60);
        } else if (interval === "5minute") {
            date.setDate(date.getDate() - 100);
        } else if (interval === "10minute") {
            date.setDate(date.getDate() - 150);
        } else if (interval === "15minute") {
            date.setDate(date.getDate() - 200);
        } else if (interval === "30minute") {
            date.setDate(date.getDate() - 200);
        } else if (interval === "60minute") {
            date.setDate(date.getDate() - 400);
        } else if (interval === "Day") {
            date.setDate(date.getDate() - 400);
        }

        // Format the date in the desired format "YYYY-MM-DDTHH:mm"
        const fromDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        return fromDate;
    };
    const parseDate = timeParse("%Y-%m-%dT%H:%M:%S%Z");
    console.log(formatDate(new Date()))

    const candleData = async (instrument_token, interval, from_date = getStartDate(interval),to_date = formatDate(new Date())) => {
        // let from_date = getStartDate(interval);
        // let to_date = "2025-02-18T21:16";
        // const date = new Date();
        // const to_date = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

        const response = await fetch(
            `http://110.227.194.239:5300/api/ds/historical?instrument_token=${instrument_token}&from_date=${from_date}&to_date=${to_date}&interval=${interval}`);
        const json = await response.json();
        if (Array.isArray(json)) {
            const newData = json.map((d) => {
                d.date = parseDate(d.date);
                d.close = +d.close;
                d.high = +d.high;
                d.low = +d.low;
                d.open = +d.open;
                d.volume = +d.volume;
                return d;
            });
            console.log("Mapped Data:", newData); 
            setData(newData);

        }
    };

    useEffect(() => {
        debouncedGetStockList(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        getData().then(setData).catch(console.error);
        // setData()
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

            const mainChartIds = mainChart.map((indicator) => indicator.id);
            const nonMainIndicators = newSelectedIndicators.filter(
                (indicator) => !mainChartIds.includes(indicator)
            );
            setMostRecentIndicator(
                nonMainIndicators.length > 0 ? nonMainIndicators[nonMainIndicators.length - 1] : null
            );

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
            {/* <Navbar /> */}
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
                <div style={{ position: "relative", width: "90px", marginBottom: "20px", marginLeft: "20px", marginRight: "auto" }}>
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
                        token={selectedInstrumentToken}
                        selectedInterval={interval}
                    />
                )}
            </TypeChooser>
        </div>
    );


};

render(<ChartComponent />, document.getElementById("root"));
export default ChartComponent;
