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
import Navbar from "./Navbar";
import { MultiSelectDropdown } from "./components/MultiSelectDropdown";
import { indicators } from "./data/data";



const ChartComponent = () => {
    const [data, setData] = useState(null);
    const [selectedIndicators, setSelectedIndicators] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [stockList, setStockList] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("idea");
    const [mostRecentIndicator, setMostRecentIndicator] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [interval, setInterval] = useState("minute"); // Default interval
    const [selectedInstrumentToken, setSelectedInstrumentToken] = useState(3677697);
    const [isSearching, setIsSearching] = useState(false);
    
    // const ws = new WebSocket("wss://api.siyacharting.com/api/ticker/ws"); // Replace with your WebSocket URL

    // useEffect(() => {
    //     ws.onmessage = (event) => {
    //       const newCandle = JSON.parse(event.data);
    //       setData((prevData) => {
    //         const lastCandle = prevData[prevData.length - 1];
    
    //         if (lastCandle.time === newCandle.time) {
    //           return prevData.map((c) => (c.time === newCandle.time ? newCandle : c)); // Update last candle
    //         } else {
    //           return [...prevData, newCandle]; // Add new candle
    //         }
    //       });
    //     };
    
    //     return () => ws.close(); // Cleanup on unmount
    //   }, []);

    useEffect(() => {
        const pathname = window.location.pathname;
        const segments = pathname.split("/").filter(Boolean);
        const token = segments[segments.length - 1];
        setSelectedInstrumentToken(token);
    }, []);
    const history = useHistory();





    const debouncedGetStockList = async (query) => {
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
    }
    


    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

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

    const candleData = async (instrument_token, interval, from_date = getStartDate(interval), to_date = formatDate(new Date())) => {
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
            setData(newData);

        }
    };
    const xfatchGetStocklist = React.useCallback(debounce(debouncedGetStockList, 300), []);

    useEffect(() => {
        xfatchGetStocklist(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        if (selectedInstrumentToken && selectedInstrumentToken) {
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


    return (
        <div>
            <Navbar
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                filteredStocks={filteredStocks}
                setSelectedInstrumentToken={setSelectedInstrumentToken}
                candleData={candleData}
                interval={interval} // Pass the interval as needed
                setInterval={setInterval}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>


                {/* Indicator Selection */}
                <div
                    style={{ position: "relative", width: "250px", margin: "20px" }}
                >
                    <button
                        className="w-full  px-1 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-black"

                        onClick={() => setIsOpen(!isOpen)}
                        style={{

                            padding: "10px",
                            background: "white",
                            cursor: "pointer",
                        }}
                    >
                        Add Indicators
                    </button>
                    {isOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: "110%",
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
            <Chart
                        data={data}
                        selectedIndicators={selectedIndicators}
                        mostRecentIndicator={mostRecentIndicator}
                        reorderedBelowChart={reorderedBelowChart}
                        token={selectedInstrumentToken}
                        selectedInterval={interval}
                    />

        </div>
    );

};

render(<ChartComponent />, document.getElementById("root"));
export default ChartComponent;
