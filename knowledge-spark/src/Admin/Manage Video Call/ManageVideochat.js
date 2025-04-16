import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Col, Input, message, Modal, Row, Space, Table, Tooltip } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";
import CreateVideoCall from './CreateVideoCall';
import EditVideoCall from './EditVideoCall';

function ManageVideochat() {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);  // Default page size
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openEditModal = (record) => {
    setEditData(record);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditData(null);
    setIsEditModalOpen(false);
  };

  const auth_token = JSON.parse(localStorage.getItem('auth_token') || "{}");
  if (!auth_token?.access_token) {
    throw new Error("Authentication tokens are missing. Please log in again.");
  }
  const accesstoken = auth_token.access_token;

  const fetchVideoCallData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/video-call/`, {
        headers: { Authorization: `Bearer ${accesstoken}` },
        params: {
          search: searchText,
          page: currentPage,
          page_size: pageSize
        }
      });

      setData(response.data.results || []);
      setTotalItems(response.data.count || 0);
      setPageSize(response.data.page_size || 10); // API-defined page size
    } catch (error) {
      message.error("Failed to fetch video call data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or when filters change
  useEffect(() => {
    fetchVideoCallData();
  }, [searchText, currentPage, pageSize]);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this video call?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          setLoading(true);
          await axios.delete(`http://localhost:8000/api/video-call/${id}/`, {
            headers: { Authorization: `Bearer ${accesstoken}` }
          });
          message.success("Video call deleted successfully.");
          fetchVideoCallData();
        } catch (error) {
          message.error("An error occurred while deleting the video call.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEndVideoCall = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to end this video call?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          setLoading(true);
          await axios.post(
            "http://localhost:8000/api/video-call/endvideocall/",
            { id },
            { headers: { Authorization: `Bearer ${accesstoken}` } }
          );
          message.success("Video call ended successfully.");
          fetchVideoCallData();
        } catch (error) {
          message.error("An error occurred while ending the video call.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "SrNo",
      key: "SrNo",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: "Teacher Name",
      dataIndex: "teacher_username",
      key: "teacher_username",
    },
    {
      title: "Student Name",
      dataIndex: "student_username",
      key: "student_username",
    },
    // {
    //   title: "Start Time",
    //   dataIndex: "start",
    //   key: "start",
    // },
    // {
    //   title: "End Time",
    //   dataIndex: "end",
    //   key: "end",
    // },
    // {
    //   title: "Duration",
    //   dataIndex: "duration",
    //   key: "duration",
    // },
    {
      title: "Status",
      dataIndex: "status",
      key: "Status",
    },
    {
      title: "Created By",
      dataIndex: "created_by_username",
      key: "created_by_username",
    }
    // {
    //     //   title: "Created At",
    //     //   dataIndex: "created_at",
    //     //   key: "created_at",
    //     // },
    //     // {
    //     //   title: "Updated At",
    //     //   dataIndex: "updated_at",
    //     //   key: "updated_at",
    //     // },
    //     // {
    //     //   title: "Action",
    //     //   key: "action",
    //     //   render: (text, record) => (
    //     //     <Space>
    //     //       <Tooltip title="Edit">
    //     //         <Button
    //     //           icon={<EditOutlined />}
    //     //           style={{ cursor: "pointer" }}
    //     //           onClick={() => openEditModal(record)}
    //     //         />
    //     //       </Tooltip>
    //     //       <Tooltip title="Delete">
    //     //         <Button
    //     //           icon={<DeleteOutlined />}
    //     //           style={{ cursor: "pointer", color: "red" }}
    //     //           onClick={() => handleDelete(record.id)}
    //     //         />
    //     //       </Tooltip>
    //     //       {record.end === null && (
    //     //         <Tooltip title="End Call">
    //     //           <Button
    //     //             type="primary"
    //     //             style={{ cursor: "pointer", backgroundColor: "#28a745", borderColor: "#28a745" }}
    //     //             onClick={() => handleEndVideoCall(record.id)}
    //     //           >
    //     //             End Call
    //     //           </Button>
    //     //         </Tooltip>
    //     //       )}
    //     //     </Space>
    //     //   ),
    //     // }
  ];

  const resetFilter = () => {
    setSearchText("");
    setCurrentPage(1);
  };

  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Video Call</h2>
          <Breadcrumb
            items={[
              { title: <Link to="/dashboard">Home</Link> },
              { title: "Video Call" },
            ]}
          />
        </Col>
        <Row gutter={[16, 16]}>
          <Col>
            <Space size="small">
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearch}
              />
              <Tooltip placement="top" title="Reset Filter">
                <Button type="primary" className="iconlink" onClick={resetFilter}>
                  <FilterIcon />
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: true,
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            setCurrentPage(1); // Reset to first page when changing page size
          },
          onChange: (page) => setCurrentPage(page),
          showTotal: (total) => `Total ${total} items`,
        }}
      />
      {/* 
      <Modal
        title="Create Video Call"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <CreateVideoCall closeModal={closeModal} refreshData={fetchVideoCallData} />
      </Modal>

      <Modal
        title="Edit Video Call"
        open={isEditModalOpen}
        onCancel={closeEditModal}
        footer={null}
        width={800}
      >
        <EditVideoCall editData={editData} closeModal={closeEditModal} refreshData={fetchVideoCallData} />
      </Modal> */}
    </div>
  );
}

export default ManageVideochat;
