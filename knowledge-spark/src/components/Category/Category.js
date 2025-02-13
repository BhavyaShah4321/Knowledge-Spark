import {
  DeleteOutlined,
    DownOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
  } from "@ant-design/icons";
  import {
    Breadcrumb,
    Button,
    Col,
    Dropdown,
    Input,
    Menu,
    Modal,
    Row,
    Space,
    Spin,
    Table,
    Tooltip,
    Form,
    message,
  } from "antd";
  import axios from "axios";
  import React, { useEffect, useState } from "react";
  import { Link } from "react-router-dom";
  import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";
  import { ReactComponent as EditIcon } from "../../Image/EditIcon.svg";
  
  export default function Category() {
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
  
    const getAccessToken = () => {
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      if (!authData?.access_token) {
        throw new Error("Authentication tokens are missing. Please log in again.");
      }
      return authData.access_token;
    };
  
    const fetchCategoryDetails = async (page = 1) => {
      try {
        setLoading(true);
        const accessToken = getAccessToken();
        
        const response = await axios.get(`http://localhost:8000/api/course-category/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const categoryDetails = response.data;
        setCategoryData(categoryDetails.results.data || []);
        setTotalItems(categoryDetails.count || 0);
      } catch (error) {
        console.error("Error fetching category details:", error);
        message.error("Failed to fetch category details");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchCategoryDetails(currentPage);
    }, [currentPage]);
  
    const resetFilter = () => {
      setSearchText("");
      setCurrentPage(1);
      fetchCategoryDetails(1);
    };
  
    const updateCategoryStatus = async (id, status) => {
      try {
        setLoading(true);
        const accessToken = getAccessToken();
        
        // Find the current category to keep its name
        const currentCategory = categoryData.find(cat => cat.id === id);
        if (!currentCategory) {
          throw new Error("Category not found");
        }
  
        const form_data = {
          name: currentCategory.name, // Include the existing name
          status: status,
        };
  
        const response = await axios.patch(
          `http://localhost:8000/api/course-category/${id}/`,
          form_data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.status === 200) {
          setCategoryData((prevData) =>
            prevData.map((category) =>
              category.id === id ? { ...category, status: status } : category
            )
          );
          message.success("Category status updated successfully");
        }
      } catch (error) {
        console.error("Error updating category status:", error);
        message.error("Failed to update category status");
      } finally {
        setLoading(false);
      }
    };
  
    const handleOpenModal = (record = null) => {
      setEditingCategory(record);
      setIsModalVisible(true);
      if (record) {
        form.setFieldsValue({
          name: record.name
        });
      } else {
        form.resetFields();
      }
    };
  
    const handleCloseModal = () => {
      form.resetFields();
      setIsModalVisible(false);
      setEditingCategory(null);
    };
  
    const handleSubmit = async (values) => {
      try {
        const accessToken = getAccessToken();
  
        const endpoint = editingCategory
          ? `http://localhost:8000/api/course-category/${editingCategory.id}/`
          : "http://localhost:8000/api/course-category/";
  
        const method = editingCategory ? "patch" : "post";
  
        const form_data = {
          name: values.name,
        };
  
        const response = await axios({
          method,
          url: endpoint,
          data: form_data,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
  
        if (response.status === 200 || response.status === 201) {
          message.success(
            `Category ${editingCategory ? "updated" : "added"} successfully`
          );
          handleCloseModal();
          fetchCategoryDetails(currentPage);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        message.error("Failed to save category detail");
      }
    };
  
    const menu = (record) => (
      <Menu
        onClick={({ key }) => {
          updateCategoryStatus(record.id, key);
        }}
      >
        <Menu.Item key="active" disabled={record.status === "active"}>
          Set to Active
        </Menu.Item>
        <Menu.Item key="inactive" disabled={record.status === "inactive"}>
          Set to Inactive
        </Menu.Item>
      </Menu>
    );
  
    const columns = [
      {
        title: "Sr. No.",
        key: "index",
        render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
      },
      {
        title: "Category Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Status",
        key: "status",
        render: (text, record) => (
          <Space>
            <Tooltip title="Change Status">
              <Dropdown overlay={menu(record)} trigger={["click"]}>
                <Button
                  type={record.status === "active" ? "primary" : "default"}
                  className={
                    record.status === "active"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }
                >
                  {record.status === "active" ? "Active" : "Inactive"}{" "}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </Tooltip>
          </Space>
        ),
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <Space>
            <Tooltip title="Edit Category">
              <Button icon={<EditOutlined/>} onClick={() => handleOpenModal(record)} />
            </Tooltip>
            {/* <Tooltip title="Delete Category">
              <Button icon={<DeleteOutlined/>} onClick={() => handleDelete(record)} />
            </Tooltip> */}
          </Space>
        ),
      }
    ];
  
    return (
      <div>
        <Row className="pagenamerow mb-0" justify="space-between" align="middle">
          <Col>
            <h2>Category</h2>
            <div className="bredcrumbwrp">
              <Link to="/dashboard" className="back">
                BACK
              </Link>
              <Breadcrumb
                items={[
                  { title: <Link to="/dashboard">Home</Link> },
                  { title: "Category" },
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
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "200px" }}
              />
              <Tooltip placement="top" title="Reset Filter">
                <Button type="primary" className="iconlink" onClick={resetFilter}>
                  <FilterIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Add Category">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  Add Category
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
  
        <Modal
          title={
            <div
              style={{
                color: '#123B66',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </div>
          }
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={[
            <Button
              key="cancel"
              onClick={handleCloseModal}
              style={{
                backgroundColor: '#f2f2f2',
                border: 'none',
                color: '#333',
                fontWeight: 'bold',
              }}
              disabled={loading}
            
            >
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              style={{
                backgroundColor: '#123B66',
                border: 'none',
                fontWeight: 'bold',
              }}
              onClick={() => form.submit()}
              loading={loading}
            >
              {editingCategory ? 'Update' : 'Save'}
            </Button>,
          ]}
          mask={false}
          // style={{
          //   top: '20%',
          // }}
          centered
        >
          <Spin spinning={loading}>
            <div>
              <Form
                onFinish={handleSubmit}
                form={form}
                layout="vertical"
              >
                <Form.Item
                  name="name"
                  label={
                    <span
                      style={{
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: '#333',
                      }}
                    >
                      Category Name:
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a category name',
                    },
                  ]}
                >
                  <Input
                    placeholder="Please enter category name"
                    style={{
                      borderRadius: '5px',
                      height: '40px',
                      fontSize: '14px',
                    }}
                  />
                </Form.Item>
              </Form>
            </div>
          </Spin>
        </Modal>
  
        <Table
          dataSource={Array.isArray(categoryData) ? categoryData : []}
          columns={columns}
          rowKey="id"
          pagination={{
            current: currentPage,
            total: totalItems,
            pageSize: 10,
            showSizeChanger: false,
          }}
          loading={loading}
          onChange={(pagination) => setCurrentPage(pagination.current)}
        />
      </div>
    );
  }