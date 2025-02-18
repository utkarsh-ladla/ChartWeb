

import { tsvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";

function parseData(parse) {
    return function (d) {
        d.date = parse(d.date);
        d.open = +d.open;
        d.high = +d.high;
        d.low = +d.low;
        d.close = +d.close;
        d.volume = +d.volume;

        return d;
    };
}

const parseDate = timeParse("%Y-%m-%d");

export const getData = async () => {
    const response = await fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv");
    //     const response = await fetch("http://192.168.1.39:5300/api/ds/historical?instrument_token=${instrument_token}&from_date=${"2025-01-05T21:16"}&to_date=${"2025-02-01T21:16"}");
    const data = tsvParse(await response.text(), parseData(parseDate));
    return data; // Return the array directly
};

// export const getData = async () => {
//     const response = await fetch(`http://192.168.1.39:5300/api/ds/historical?instrument_token=${3677697}&from_date=2025-01-05T21:16&to_date=2025-02-01T21:16`);
    
//     // if (!response.ok) {
//     //   console.error('Failed to fetch data:', response.status);
//     //   return;
//     // }
  
//     const jsonData = await response.json(); // Use .json() to parse JSON response
//     // console.log("Data being passed to getFilteredResponse:", jsonData);
    
//     // Optionally, you can transform the data here if needed (e.g., parsing dates, etc.)
//     const parsedData = jsonData.map((item) => ({
//       date: new Date(item.date),  // Convert date string to a Date object
//       open: item.open,
//       high: item.high,
//       low: item.low,
//       close: item.close,
//       volume: item.volume
//     }));
  
//     return parsedData; // Return the parsed data
//   };
  
  
