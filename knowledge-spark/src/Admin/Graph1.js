// import { Column } from "@ant-design/plots";
// import React, { useEffect, useRef, useState } from "react";

// const Graph1 = (props) => {
//   const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
//   const [list, setList] = useState([]); // Define the list state
//   const containerRef = useRef(null);

//   useEffect(() => {
//     fetch("https://gw.alipayobjects.com/os/antfincdn/iPY8JFnxdb/dodge-padding.json")
//       .then((response) => response.json())
//       .then((data) => {
//         const transformedData = data.map((item) => ({
//           月份: item["月份"],
//           月均降雨量: item["月均降雨量"],
//           name: item["name"],
//         }));
//         setList(transformedData); // Set the fetched and transformed data
//       });
//   }, []);

//   const data = list?.map((field, key) => ({
//     key: key,
//     月份: field.月份,
//     月均降雨量: field.月均降雨量,
//     name: field.name,
//   }));

//   const config = {
//     data: data || [],
//     xField: "月份",
//     yField: "月均降雨量",
//     seriesField: "name",
//     isGroup: true,
//     autoFit: true,
//     color: ["#1890ff", "#13c2c2", "#faad14"],
//     padding: "auto",
//     legend: {
//       position: "top-left",
//     },
//     label: {
//       position: "top", // Change "middle" to "top" or "bottom" as needed
//       style: {
//         fill: "#FFFFFF",
//         opacity: 0.6,
//       },
//     },
//   };

//   useEffect(() => {
//     const updateSize = () => {
//       if (containerRef.current) {
//         setContainerSize({
//           width: containerRef.current.offsetWidth,
//           height: containerRef.current.offsetHeight,
//         });
//       }
//     };

//     updateSize();
//     window.addEventListener("resize", updateSize);
//     return () => window.removeEventListener("resize", updateSize);
//   }, []);

//   return (
//     <div ref={containerRef} style={{ width: "100%", height: "400px" }}>
//       <Column {...config} />
//     </div>
//   );
// };

// export default Graph1;

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

const Graph1 = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    console.log("Fetching course purchases..."); // Debug log
  
    const fetchCoursePurchases = async () => {
      const accessToken = localStorage.getItem("access_token");
  
      if (!accessToken) {
        console.error("No access token found");
        return;
      }
  
      try {
        const response = await axios.get("http://localhost:8000/api/course-purchase/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
  
        console.log("Course Purchases Response:", response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching course purchases:", error.response || error.message);
      }
    };
  
    fetchCoursePurchases();
  }, []);
  

  return (
    <div className="w-full h-96 bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">📊 Course Purchases: Today vs Yesterday</h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="hour" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="today" fill="#8884d8" name="Today" />
            <Bar dataKey="yesterday" fill="#82ca9d" name="Yesterday" />
          </BarChart>
        </ResponsiveContainer>
       ) : (
         <p className="text-center text-gray-500">No data available</p>
       )}
    </div>
  );
};

export default Graph1;
