// export default function Navbar({ searchTerm, handleSearch, showDropdown, filteredStocks, setSelectedInstrumentToken, candleData, interval }) {
//     return <nav className="bg-card px-10 border border-border py-3 shadow-md">
//         <div className="flex font-bold text items-center gap-1 text-xl">
//             <div className="p-2 bg-primary rounded-full" />
//             Siya
//         </div>
//     </nav>
// }

import React from "react";
import { intervals } from "./data/data";


export default function Navbar({
    searchTerm,
    handleSearch,
    showDropdown,
    filteredStocks,
    setShowDropdown,
    setSelectedInstrumentToken,
    candleData,
    interval,
    setInterval,
}) {
    return (
        <nav className="bg-card px-10 border border-border py-3 shadow-md">
            <div className="flex gap-10 items-center">
                {/* Logo Section */}
                <div className="flex font-bold text items-center gap-1 text-xl">
                    <div className="p-2 bg-primary rounded-full" />
                    Siya
                </div>

                {/* Search Input and Dropdown */}
                <div className="relative  flex gap-2 ">

                    <input
                        type="text"
                        placeholder="Search stock..."
                        value={searchTerm}
                        onChange={handleSearch}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        className="w-full  px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-black"
                    />

                    {/* Dropdown for Search Results */}
                    {showDropdown && (
                        <div className="absolute top-12 min-w-72 max-h-72 overflow-y-auto mt-1 bg-white border border-border rounded-md shadow-lg z-10">
                            {filteredStocks.length > 0 ? (
                                filteredStocks.map((item, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 "
                                        onMouseDown={() => {
                                            setSelectedInstrumentToken(item.instrument_token);
                                            candleData(item.instrument_token, interval);
                                        }}
                                    >
                                        {item.tradingsymbol} - {item.exchange}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-gray-500">No data found</div>
                            )}
                        </div>
                    )}
            {/* Interval Selection Dropdown */}
            <select
                        value={interval}
                        onChange={(e) =>setInterval(e.target.value)}
                        className="  px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-black"
                        style={{
                            padding: "10px",
                            background: "white",
                           
                            cursor: "pointer",
                        }}
                    >
                       {intervals.map((intervalOption) => (
                            <option key={intervalOption?.id} value={intervalOption?.id}>
                                {intervalOption?.lable}
                            </option>
                        ))}
                    </select>
                </div>
                
                
            </div>
        </nav>
    );
}
// import { useState } from "react";

// const Navbar = ({ 
//     searchTerm, handleSearch, showDropdown, setShowDropdown, filteredStocks, 
//     setSelectedInstrumentToken, candleData, interval, setInterval, 
//     selectedIndicators, handleCheckboxChange, indicators 
// }) => {
//     const [isOpen, setIsOpen] = useState(false);

//     return (
//         <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#222", color: "white" }}>
//             {/* Search Input */}
//             <input
//                 type="text"
//                 placeholder="Search stock..."
//                 value={searchTerm}
//                 onChange={handleSearch}
//                 onFocus={() => setShowDropdown(true)}
//                 onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//                 style={{
//                     width: "200px",
//                     padding: "8px",
//                     border: "1px solid black",
//                     borderRadius: "4px",
//                     backgroundColor: "white",
//                     color: "black",
//                     outline: "none",
//                 }}
//             />

           
//             {/* Indicator Selection */}
//             <div style={{ position: "relative" }}>
//                 <button
//                     onClick={() => setIsOpen(!isOpen)}
//                     style={{
//                         padding: "10px",
//                         background: "black",
//                         color: "white",
//                         border: "none",
//                         cursor: "pointer",
//                     }}
//                 >
//                     Select Indicators
//                 </button>
//                 {isOpen && (
//                     <div
//                         style={{
//                             position: "absolute",
//                             top: "100%",
//                             left: 0,
//                             background: "white",
//                             boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//                             padding: "10px",
//                             zIndex: 10,
//                         }}
//                     >
//                         {indicators.map(({ id, name }) => (
//                             <div key={id} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
//                                 <input
//                                     id={id}
//                                     type="checkbox"
//                                     checked={selectedIndicators.includes(id)}
//                                     onChange={() => handleCheckboxChange(id)}
//                                     style={{ marginRight: "5px" }}
//                                 />
//                                 <label htmlFor={id} style={{ fontSize: "14px", color: "#333" }}>
//                                     {name || id.toUpperCase()}
//                                 </label>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </nav>
//     );
// };

// export default Navbar
