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
import { Column } from "@ant-design/plots";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const Graph1 = ({ dateRange }) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Function to format data for the chart
  const processDataForChart = (data) => {
    // Group purchases by date
    const purchasesByDate = data.reduce((acc, purchase) => {
      const purchaseDate = dayjs(purchase.created_at).format("YYYY-MM-DD");
      
      if (!acc[purchaseDate]) {
        acc[purchaseDate] = {
          date: purchaseDate,
          totalAmount: 0,
          teacherRevenue: 0,
          platformFee: 0,
          purchaseCount: 0,
          purchases: []
        };
      }
      
      // Parse amounts as numbers
      const amount = parseFloat(purchase.amount);
      const teacherAmount = parseFloat(purchase.teacher_amount);
      const platformFee = parseFloat(purchase.platform_fee);
      
      acc[purchaseDate].totalAmount += amount;
      acc[purchaseDate].teacherRevenue += teacherAmount;
      acc[purchaseDate].platformFee += platformFee;
      acc[purchaseDate].purchaseCount += 1;
      acc[purchaseDate].purchases.push({
        id: purchase.id,
        courseTitle: purchase.course_title,
        amount: amount,
        teacherAmount: teacherAmount,
        platformFee: platformFee
      });
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    let chartData = Object.values(purchasesByDate).sort((a, b) => 
      dayjs(a.date).diff(dayjs(b.date))
    );
    
    // Format for the chart
    const formattedData = [];
    
    chartData.forEach(dayData => {
      const formattedDate = dayjs(dayData.date).format("MMM DD");
      
      // Total Amount entry
      formattedData.push({
        date: formattedDate,
        rawDate: dayData.date,
        value: Number(dayData.totalAmount.toFixed(2)),
        category: "Total Sales",
        purchaseCount: dayData.purchaseCount,
        teacherRevenue: Number(dayData.teacherRevenue.toFixed(2)),
        platformFee: Number(dayData.platformFee.toFixed(2)),
        purchases: dayData.purchases
      });
      
      // Teacher Revenue entry
      formattedData.push({
        date: formattedDate,
        rawDate: dayData.date,
        value: Number(dayData.teacherRevenue.toFixed(2)),
        category: "Teacher Revenue",
        purchaseCount: dayData.purchaseCount,
        totalAmount: Number(dayData.totalAmount.toFixed(2)),
        platformFee: Number(dayData.platformFee.toFixed(2)),
        purchases: dayData.purchases
      });
      
      // Platform Fee entry
      formattedData.push({
        date: formattedDate,
        rawDate: dayData.date,
        value: Number(dayData.platformFee.toFixed(2)),
        category: "Platform Fee",
        purchaseCount: dayData.purchaseCount,
        totalAmount: Number(dayData.totalAmount.toFixed(2)),
        teacherRevenue: Number(dayData.teacherRevenue.toFixed(2)),
        purchases: dayData.purchases
      });
    });
    
    return formattedData;
  };

  useEffect(() => {
    const fetchPurchaseData = async () => {
      setLoading(true);
      try {
        const authData = JSON.parse(localStorage.getItem("auth_token"));
        if (!authData || !authData.access_token) {
          throw new Error("Authentication tokens are missing");
        }
  
        const accessToken = authData.access_token;
        let allPurchases = [];
        let nextPage = "http://localhost:8000/api/course-purchase/";
  
        while (nextPage) {
          const response = await axios.get(nextPage, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
  
          allPurchases = [...allPurchases, ...response.data.results];
          nextPage = response.data.next;
        }
  
        // Filter by date range if provided
        if (dateRange && dateRange.length === 2) {
          const startDate = dayjs(dateRange[0]).startOf("day");
          const endDate = dayjs(dateRange[1]).endOf("day");
  
          allPurchases = allPurchases.filter((purchase) => {
            const purchaseDate = dayjs(purchase.created_at);
            return purchaseDate.isAfter(startDate) && purchaseDate.isBefore(endDate);
          });
        }
  
        let processedData;
        if (allPurchases.length === 0) {
          // If no data, create default empty data
          let defaultData = [];
          if (dateRange && dateRange.length === 2) {
            const startDate = dayjs(dateRange[0]);
            const endDate = dayjs(dateRange[1]);
            let currentDate = startDate;
  
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
              let formattedDate = currentDate.format("MMM DD");
              let rawDate = currentDate.format("YYYY-MM-DD");
  
              defaultData.push({ date: formattedDate, rawDate, value: 1, category: "Total Sales" });
              defaultData.push({ date: formattedDate, rawDate, value: 2, category: "Teacher Revenue" });
              defaultData.push({ date: formattedDate, rawDate, value: 3, category: "Platform Fee" });
  
              currentDate = currentDate.add(1, "day");
            }
          } else {
            let today = dayjs().format("MMM DD");
            let rawDate = dayjs().format("YYYY-MM-DD");
  
            defaultData = [
              { date: today, rawDate, value: 1, category: "Total Sales" },
              { date: today, rawDate, value: 2, category: "Teacher Revenue" },
              { date: today, rawDate, value: 3, category: "Platform Fee" },
            ];
          }
          processedData = defaultData;
        } else {
          processedData = processDataForChart(allPurchases);
        }
  
        setPurchaseData(processedData);
      } catch (error) {
        console.error("Failed to fetch purchase data:", error);
        setError("Failed to load purchase data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchPurchaseData();
  }, [dateRange]);
  

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const customTooltip = {
    customContent: (title, data) => {
      if (!data || data.length === 0) return null;
      
      // All data points for this date share the same purchases
      const firstPoint = data[0];
      const dayData = {
        date: firstPoint.data.rawDate,
        formattedDate: firstPoint.data.date,
        totalAmount: firstPoint.data.category === "Total Sales" ? 
          firstPoint.data.value : firstPoint.data.totalAmount,
        teacherRevenue: firstPoint.data.category === "Teacher Revenue" ? 
          firstPoint.data.value : firstPoint.data.teacherRevenue,
        platformFee: firstPoint.data.category === "Platform Fee" ? 
          firstPoint.data.value : firstPoint.data.platformFee,
        purchaseCount: firstPoint.data.purchaseCount,
        purchases: firstPoint.data.purchases
      };
      
      return (
        <div style={{ padding: '10px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{dayData.formattedDate}</div>
          <div>Total Sales: ₹{dayData.totalAmount.toLocaleString()}</div>
          <div>Teacher Revenue: ₹{dayData.teacherRevenue.toLocaleString()}</div>
          <div>Platform Fee: ₹{dayData.platformFee.toLocaleString()}</div>
          <div>Purchases: {dayData.purchaseCount}</div>
          <div style={{ marginTop: '5px', fontSize: '12px' }}>
            {dayData.purchases.length > 0 && (
              <div>
                <div style={{ fontWeight: 'bold' }}>Courses:</div>
                <ul style={{ margin: '0', paddingLeft: '15px' }}>
                  {dayData.purchases.slice(0, 3).map((purchase, index) => (
                    <li key={index}>{purchase.courseTitle} - ₹{purchase.amount.toLocaleString()}</li>
                  ))}
                  {dayData.purchases.length > 3 && (
                    <li>...and {dayData.purchases.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  const config = {
    data: purchaseData,
    isGroup: true,
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    autoFit: true,
    color: ['#1890ff', '#13c2c2', '#faad14'],
    padding: 'auto',
    legend: {
      position: 'top-left',
    },
    tooltip: customTooltip,
    yAxis: {
      label: {
        formatter: (v) => `₹${v}`
      }
    },
    meta: {
      value: {
        alias: 'Amount',
        formatter: (v) => `₹${v.toLocaleString()}`
      }
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (loading) {
    return <div className="loading-chart">Loading chart data...</div>;
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "400px" }}>
      {purchaseData.length > 0 ? (
        <Column {...config} />
      ) : (
        <div className="no-data-message" style={{ textAlign: 'center', padding: '100px 0' }}>
          
        </div>
      )}
    </div>
  );
};

export default Graph1;