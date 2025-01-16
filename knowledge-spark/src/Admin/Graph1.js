import { Column } from "@ant-design/plots";
import React, { useEffect, useRef, useState } from "react";

const Graph1 = (props) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [list, setList] = useState([]); // Define the list state
  const containerRef = useRef(null);

  useEffect(() => {
    fetch("https://gw.alipayobjects.com/os/antfincdn/iPY8JFnxdb/dodge-padding.json")
      .then((response) => response.json())
      .then((data) => {
        const transformedData = data.map((item) => ({
          月份: item["月份"],
          月均降雨量: item["月均降雨量"],
          name: item["name"],
        }));
        setList(transformedData); // Set the fetched and transformed data
      });
  }, []);

  const data = list?.map((field, key) => ({
    key: key,
    月份: field.月份,
    月均降雨量: field.月均降雨量,
    name: field.name,
  }));

  const config = {
    data: data || [],
    xField: "月份",
    yField: "月均降雨量",
    seriesField: "name",
    isGroup: true,
    autoFit: true,
    color: ["#1890ff", "#13c2c2", "#faad14"],
    padding: "auto",
    legend: {
      position: "top-left",
    },
    label: {
      position: "top", // Change "middle" to "top" or "bottom" as needed
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
  };

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

  return (
    <div ref={containerRef} style={{ width: "100%", height: "400px" }}>
      <Column {...config} />
    </div>
  );
};

export default Graph1;
