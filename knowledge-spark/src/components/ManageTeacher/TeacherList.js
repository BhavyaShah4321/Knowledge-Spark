import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Col, Input, Row, Space, Table, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
// import jsPDF from 'jspdf';

function TeacherList() {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    // const { user: currentUser } = useSelector((state) => state.auth);
  
    const data = [
      {
        // key: '1',
        // // srNo: 1,
        // orderDate: '18/10/2024',
        // orderNo: 'R/24-25/0003',
        // poNo: '1692',
        // partyName: 'Ajni industries private limited',
        // totalWeight: 554.4,
        // packedWeight: 0.0,
        // dispatchedWeight: 456.75,
        // pendingWeight: 97.65,
        // status: 'Closed',
        // deliveryDate: '18/10/2024',
      },
    ];
   
    
  
    const columns = [
      {
        title: 'Sr. No.',
        dataIndex: 'srNo',
        key: 'srNo',
        sorter: (a, b) => a.srNo - b.srNo,
      },
      {
        title: 'First Name',
        dataIndex: 'f_name',
        key: 'f_name',
      },
      {
        title: 'Last Name',
        dataIndex: 'l_name',
        key: 'l_name',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      
      {
        title: 'Action',
        key: 'action',
        // render: () => (
        // //   <Space>
        // //     {currentUser.permissions.includes("workorder|view_workorder") && (
        // //       <Tooltip title='View'>
        // //         <Link to='/view-work-order-list'>
        // //         <ViewIcon /></Link>
        // //       </Tooltip>
        // //     )}
        // //     <Link onClick={downloadPdf}> 
        // //       <Tooltip title='Print'>
        // //         <PlanPrintIcon />
        // //       </Tooltip>
        // //     </Link>
        // //     {currentUser.permissions.includes("workorder|change_workorder") && (
        // //       <Tooltip title='Edit'>
        // //         <Link to="/edit-work-order/:id">
        // //           <EditIcon />
        // //         </Link>
        // //       </Tooltip>
        // //     )}
        // //     {currentUser.permissions.includes("workorder|delete_workorder") && (
        // //       <Link>
        // //         <Tooltip title='Archive'>
        // //           <Archive />
        // //         </Tooltip>
        // //       </Link>
        // //     )}
        // //   </Space>
        // ),
      },
    ];
  
    const onSearchChange = e => {
      setSearchText(e.target.value);
    };
  
    const rowSelection = {
      selectedRowKeys,
      onChange: selectedKeys => {
        setSelectedRowKeys(selectedKeys);
      },
    };
  
    return (
      <div>
        <Row className="pagenamerow mb-0" justify="space-between" align="middle">
          <Col>
            <h2>Teacher List</h2>
            <div className="bredcrumbwrp">
              <Link to="/dashboard" className="back">
                {/* <Back /> */}
                 BACK
              </Link>
              <Breadcrumb
                items={[
                  { title: <Link to="/dashboard">Home</Link> },
                  { title: 'Teacher List' }
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
                onChange={onSearchChange}
                style={{ width: '100%' }}
              />
              <Link className='iconlink'>
                <Tooltip title="Filter">
                  {/* <FilterIcon /> */}
                </Tooltip>
              </Link>
              {/* {currentUser.permissions.includes("workorder|add_workorder") && ( */}
                {/* <Link to="/create-work-order">
                  <Tooltip title='Create Work Order'>
                    <Button type="primary" icon={<PlusOutlined />}>
                      Create Work Order
                    </Button>
                  </Tooltip>
                </Link> */}
              {/* )} */}
              <Link to="/archive-work-order-list" className='iconlink'>
                <Tooltip title="Archive">
                  {/* <Archiveicon /> */}
                </Tooltip>
              </Link>
              <Link className='iconlink'>
                <Tooltip title="Column List">
                  {/* <ColumnListIcon /> */}
                </Tooltip>
              </Link>
  
            </Space>
          </Col>
  
        </Row>
        {/* Table */}
        <Table
          rowSelection={rowSelection}
          dataSource={data}
          columns={columns}
          pagination={{ defaultCurrent: 1, pageSize: 7 }}
          scroll={{
            x: 1500,
          }}
        />
  
  
      </div>
    );
  }

  export default TeacherList;