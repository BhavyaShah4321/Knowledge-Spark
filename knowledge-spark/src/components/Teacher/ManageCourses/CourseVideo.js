// import {
//   DownOutlined,
//   EditOutlined,
//   PlusOutlined,
//   SearchOutlined,
//   UploadOutlined,
// } from "@ant-design/icons";
// import {
//   Breadcrumb,
//   Button,
//   Col,
//   Dropdown,
//   Input,
//   Menu,
//   Row,
//   Space,
//   Table,
//   Tooltip,
//   message,
//   Drawer,
//   Form,
//   Select,
//   Upload,
// } from "antd";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ReactComponent as EditIcon } from "../../../Image/EditIcon.svg";
// import { ReactComponent as FilterIcon } from "../../../Image/FilterIcon.svg";
// import { Option } from "antd/es/mentions";

// export default function CourseVideo() {
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [courseData, setCourseData] = useState([]);
//   const [editDrawerOpen, setEditDrawerOpen] = useState(false);
//        const [open, setOpen] = useState(false);
  
//   const [editingCourseVideo, setEditingCourseVideo] = useState(null);
//   const [form] = Form.useForm();
//   const navigate = useNavigate();

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
      
//       const response = await axios.get(`http://localhost:8000/api/course/`, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });

//       const CourseDetails = response.data;
//       setCourseData(CourseDetails.results.data || []);
//       setTotalItems(CourseDetails.count || 0);
//     } catch (error) {
//       console.error("Error fetching course details:", error);
//       message.error("Failed to fetch course details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCourseDetails(currentPage);
//   }, [currentPage]);

//   const openEditDrawer = (course) => {
//     setEditingCourseVideo(course);
//     form.setFieldsValue(course);
//     setEditDrawerOpen(true);
//   };

//   const handleEditSubmit = async (values) => {
//     try {
//       if (!editingCourseVideo?.id) {
//         message.error("No course selected for editing");
//         return;
//       }

//       const formData = new FormData();

  
//       const form_data = {
//         course_description: values.course_description,
//         course_title: values.course_title,
//         course_price: values.course_price,
//       };
  
//       formData.append("form_data", JSON.stringify(form_data));
//       setLoading(true);
//       const accessToken = getAccessToken();
  
//       const response = await axios.patch(
//         `http://localhost:8000/api/course/${editingCourseVideo.id}/`,
//          formData,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
  
//       if (response.status === 200) {
//         message.success("Course updated successfully");
//         setEditDrawerOpen(false);
//         // fetchCourseDetails(currentPage); // Refresh course list
//       }
//     } catch (error) {
//       console.error("Error updating course:", error);
//       message.error("Failed to update course");
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   const columns = [
//     {
//       title: "Sr. No.",
//       key: "index",
//       render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
//     },
//     {
//       title: "Course Video Title",
//       dataIndex: "course_video_title",
//       key: "course_video_title",
//       render: (text, record) => (
//         <Tooltip title="View Course Video">
//         <a
//           onClick={() => navigate(`/view-course/${record.id}`)}
//           style={{ color: "#1890ff", cursor: "pointer" }}
//         >
//           {text}
//         </a>
//         </Tooltip>
//       ),
//     },
//     {
//       title: "Course Video Description",
//       dataIndex: "course_video_description",
//       key: "course_video_description",
//     },
//     // {
//     //   title: "Course Price",
//     //   dataIndex: "course_price",
//     //   key: "course_price",
//     //   render: (price) => `₹${price}`,
//     // },
//     {
//       title: "Course Video",
//       dataIndex: "course_video",
//       key: "course_video",
//     },
//     {
//       title: "Action",
//       dataIndex: "action",
//       key: "action",
//       render: (text, record) => (
//         <Space>
//           <Tooltip title="Edit">
//             <Button icon={<EditOutlined/>} style={{ cursor: "pointer" }} onClick={() => openEditDrawer(record)} />
//           </Tooltip>
//         </Space>
//       ),
//     },
//   ];

//   const showDrawer = () => {
//     // seteditingCourse(null);
//     form.resetFields();
//     setOpen(true);
//   };

//   const onClose = () => {
//     setOpen(false);
//     form.resetFields();
//     // seteditingCourse(null);
//   };




//   return (
//     <div>
//       <Row className="pagenamerow mb-0" justify="space-between" align="middle">
//         <Col>
//           <h2>Course Videos</h2>
//           <div className="bredcrumbwrp">
//             <Link to="/dashboard" className="back">
//               BACK
//             </Link>
//             <Breadcrumb
//               items={[
//                 { title: <Link to="/dashboard">Home</Link> },
//                 { title: "Course Videos" },
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
//               // onChange={onSearchChange}
//               style={{ width: "100%" }}
//             />
//             <Tooltip placement="top" title="Reset Filter">
//               <Button type="primary" className="iconlink"
//               //  onClick={resetFilter}
//                >
//                 <FilterIcon />
//               </Button>
//             </Tooltip>
//             <Tooltip title="Add Course">
//               <Button
//                 type="primary"
//                 icon={<PlusOutlined />}
//                 onClick={showDrawer}
//               >
//                 Add Course Video
//               </Button>
//             </Tooltip>
//           </Space>
//         </Col>
//       </Row>

//       <Drawer
//         title={editingCourseVideo ? "Edit Course Video" : "Add Course Video"}
//         onClose={onClose}
//         open={open}
//         width={400}
//       >
//         <Form layout="vertical" form={form} onFinish={handleSubmit}>
//           <Form.Item
//             name="course_video_title"
//             label="Course Video Title"
//             rules={[
//               { required: true, message: "Please enter course video title!" },
//               {
//                 pattern: /^[a-zA-Z\s]+$/,
//                 message: "course video title can only include letters and spaces!",
//               },
//             ]}
//           >
//             <Input placeholder="Enter Course Video Title" />
//           </Form.Item>

//           <Form.Item
//             name="course_video_description"
//             label="Course Video Description"
//             rules={[
//               {
//                 required: true,
//                 message: "Please enter course video description!",
//               },
              
//             ]}
//           >
//             <Input placeholder="Enter Course Video Description" />
//           </Form.Item>
//           <Form.Item
//             name="course_video_thumbnail"
//             label="Course Video Thumbnail"
//             rules={[
//               {required:true,message:'please upload course video thumbnail'}
//             ]}
//             valuePropName="fileList"
//             getValueFromEvent={(e) => {
//               if (Array.isArray(e)) {
//                 return e;
//               }
//               return e?.fileList;
//             }}
//           >
//             <Upload
//               name="course_video_thumbnail"
//               listType="picture"
//               beforeUpload={() => false}
//               accept="image/*"
//               maxCount={1}
//               defaultFileList={
//                 editingCourseVideo?.profile_picture
//                   ? [
//                       {
//                         uid: "-1",
//                         name: "Current Profile Picture",
//                         status: "done",
//                         url: getProfilePictureUrl(
//                           editingCourseVideo.profile_picture
//                         ),
//                       },
//                     ]
//                   : []
//               }
//             >
//               <Button icon={<UploadOutlined />}>Upload Course Video Thumbnail</Button>
//             </Upload>
//           </Form.Item>
//           <Form.Item
//             name="course_video"
//             label="Course Video"
//             rules={[
//               {required:true,message:'please upload course video'}
//             ]}
//             valuePropName="fileList"
//             getValueFromEvent={(e) => {
//               if (Array.isArray(e)) {
//                 return e;
//               }
//               return e?.fileList;
//             }}
//           >
//             <Upload
//               name="course_video"
//               listType="picture"
//               beforeUpload={() => false}
//               accept="image/*"
//               maxCount={1}
//               defaultFileList={
//                 editingCourseVideo?.profile_picture
//                   ? [
//                       {
//                         uid: "-1",
//                         name: "Current Profile Picture",
//                         status: "done",
//                         url: getProfilePictureUrl(
//                           editingCourseVideo.profile_picture
//                         ),
//                       },
//                     ]
//                   : []
//               }
//             >
//               <Button icon={<UploadOutlined />}>Upload Course Video</Button>
//             </Upload>
//           </Form.Item>
          

//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               icon={editingCourseVideo ? <EditIcon /> : <PlusOutlined />}
//             >
//               {editingCourseVideo ? "Update Course Video" : "Add Course Video"}
//             </Button>
//           </Form.Item>
//         </Form>
//       </Drawer>

//       <Table
//         dataSource={Array.isArray(courseData) ? courseData : []}
//         columns={columns}
//         rowKey="id"
//         pagination={{
//           current: currentPage,
//           total: totalItems,
//           pageSize: 10,
//           showSizeChanger: false,
//         }}
//         loading={loading}
//       />

//       {/* Edit Drawer */}
//       <Drawer
//         title="Edit Course"
//         placement="right"
//         width={400}
//         onClose={() => setEditDrawerOpen(false)}
//         open={editDrawerOpen}
//       >
//         <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
//           <Form.Item
//             label="Course Title"
//             name="course_title"
//             rules={[{ required: true, message: "Please enter course title" }]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item
//             label="Course Description"
//             name="course_description"
//             rules={[{ required: true, message: "Please enter course description" }]}
//           >
//             <Input.TextArea />
//           </Form.Item>

//           <Form.Item
//             label="Course Price"
//             name="course_price"
//             rules={[{ required: true, message: "Please enter course price" }]}
//           >
//             <Input type="number" />
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit" loading={loading}>
//               Update Course
//             </Button>
//           </Form.Item>
//         </Form>
//       </Drawer>
//     </div>
//   );
// }
