// import {
//   SearchOutlined,
// } from "@ant-design/icons";
// import {
//   Breadcrumb,
//   Button,
//   Col,
//   Input,
//   Row,
//   Space,
//   Table,
//   Tooltip,
//   Form,
//   message,
// } from "antd";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";

// export default function PurchaseCourse() {
//   const [searchText, setSearchText] = useState("");
//   const [filteredData, setFilteredData] = useState([]);
//   const [form] = Form.useForm();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [courseData, setCourseData] = useState([]);

//   const getAccessToken = () => {
//     const authData = JSON.parse(localStorage.getItem("auth_token"));
//     if (!authData?.access_token) {
//       throw new Error("Authentication tokens are missing. Please log in again.");
//     }
//     return authData.access_token;
//   };

//   const fetchCourseDetails = async (page = 1) => {
//     try {
//       setLoading(true);
//       const accessToken = getAccessToken();
//       const response = await axios.get(`http://localhost:8000/api/course-purchase/`, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//       const courseDetails = response.data;
      
//       setCourseData(courseDetails.results || []);
//       setFilteredData(courseDetails.results|| []);
//       setTotalItems(courseDetails.count || 0);
//     } catch (error) {
//       console.error("Error fetching course details:", error);
//       message.error("Failed to fetch course details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(()=>{
//     fetchCourseDetails(currentPage);
//   },[])

//   const resetFilter = () => {
//     setSearchText("");
//     setCurrentPage(1);
//     fetchCourseDetails();
//   };
  
//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchText(value);
  
//     if (!value) {
//       setFilteredData(courseData);
//       return;
//     }
  
//     const filtered = courseData.filter((course) =>
//       course.name.toLowerCase().includes(value)
//     );
//     setFilteredData(filtered);
//   };
 
//   const columns = [
//     {
//       title: "Sr. No.",
//       key: "index",
//       render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
//     },
//     {
//       title: "Course Name",
//       dataIndex: "course_title",
//       key: "course_title",
//     },
//     {
//       title: "Student Name",
//       dataIndex: "user_username",
//       key: "user_username",
//     },
//     {
//       title: "Course Price",
//       dataIndex: "amount",
//       key: "amount",
//     },
//     {
//       title: "Payment Status",
//       dataIndex: "status",
//       key: "status",
//     },
//   ];

//   return (
//     <div>
//       <Row className="pagenamerow mb-0" justify="space-between" align="middle">
//         <Col>
//           <h2>Purchased Courses</h2>
//           <div className="bredcrumbwrp">
//             <Link to="/dashboard" className="back">
//               BACK
//             </Link>
//             <Breadcrumb
//               items={[
//                 { title: <Link to="/dashboard">Home</Link> },
//                 { title: "Purchased Courses" },
//               ]}
//             />
//           </div>
//         </Col>
//         <Col>
//           <Space size="small">
//             <Input
//               placeholder="Search"
//               prefix={<SearchOutlined />}
//               value={searchText}
//               onChange={handleSearch} 
//               style={{ width: "200px" }}
//             />
//             <Tooltip placement="top" title="Reset Filter">
//               <Button type="primary" className="iconlink" onClick={resetFilter}>
//                 <FilterIcon />
//               </Button>
//             </Tooltip>
//             {/* <Tooltip title="Add Category">
//               <Button
//                 type="primary"
//                 icon={<PlusOutlined />}
//                 onClick={() => handleOpenModal()}
//               >
//                 Add Category
//               </Button>
//             </Tooltip> */}
//           </Space>
//         </Col>
//       </Row>

     
//       <Table
//         dataSource={filteredData} 
//         columns={columns}
//         rowKey="id"
//         pagination={{
//           current: currentPage,
//           total: totalItems,
//           showTotal: (total) => `Total ${total} items`, // This will display the total records
//         }}
//         loading={loading}
//         onChange={(pagination) => setCurrentPage(pagination.current)}
//       />
//     </div>
//   );
// }

import {
  SearchOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Col,
  Input,
  Row,
  Space,
  Table,
  Tooltip,
  Form,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";

export default function PurchaseCourse() {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState([]);

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
    }
    return authData.access_token;
  };

  const fetchCourseDetails = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      const response = await axios.get(`http://localhost:8000/api/course-purchase/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page,
          search, // Send search query for backend filtering
        },
      });

      const courseDetails = response.data;
      setCourseData(courseDetails.results || []);
      setFilteredData(courseDetails.results || []);
      setTotalItems(courseDetails.count || 0);
      setCurrentPage(page); // Update the pagination state
    } catch (error) {
      console.error("Error fetching course details:", error);
      message.error("Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails(currentPage, searchText);
  }, [currentPage, searchText]); // Fetch data when page or search changes

  const resetFilter = () => {
    setSearchText("");
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
    setCurrentPage(1); // Reset to first page on search
  };

  const columns = [
    {
      title: "Sr. No.",
      key: "index",
      render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
    },
    {
      title: "Course Name",
      dataIndex: "course_title",
      key: "course_title",
    },
    {
      title: "Teacher Name",
      dataIndex: "course_teacher",
      key: "course_teacher",
    },
    {
      title: "Student Name",
      dataIndex: "user_username",
      key: "user_username",
    },
    {
      title: "Course Price",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Payment Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Purchased Courses</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">
              BACK
            </Link>
            <Breadcrumb
              items={[
                { title: <Link to="/dashboard">Home</Link> },
                { title: "Purchased Courses" },
              ]}
            />
          </div>
        </Col>
        <Col>
          <Space size="small">
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: "200px" }}
            />
            <Tooltip placement="top" title="Reset Filter">
              <Button type="primary" className="iconlink" onClick={resetFilter}>
                <FilterIcon />
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          total: totalItems,
          pageSize: 10,
          showTotal: (total) => `Total ${total} items`,
          onChange: (page) => setCurrentPage(page), // Update page on pagination change
        }}
        loading={loading}
      />
    </div>
  );
}
