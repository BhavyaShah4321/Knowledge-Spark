import {DownOutlined, LogoutOutlined, PlusOutlined} from '@ant-design/icons';
import {Avatar, Button, Dropdown, Layout, Menu, Modal} from 'antd';
import React, {useEffect, useState} from 'react';
import { postRequest } from '../../Axios';

import { Link } from 'react-router-dom';
const {confirm} = Modal;

const {Header} = Layout;


const items = [
  {
    label: (
      <>
        <PlusOutlined style={{marginRight: 8}} />
        <a href="/add-dieprofile">Add Die Profile</a>
      </>
    ),
    key: '0',
  },
  {
    label: (
      <>
        <PlusOutlined style={{marginRight: 8}} />
        <a href="/add-new-customer">Add New Customer</a>
      </>
    ),
    key: '1',
  },
  {
    label: (
      <>
        <PlusOutlined style={{marginRight: 8}} />
        <a href="/create-quotation">Create Quotation</a>
      </>
    ),
    key: '2',
  },
  {
    label: (
      <>
        <PlusOutlined style={{marginRight: 8}} />
        <a href="/add-die-quotation">Create Die Quotation</a>
      </>
    ),
    key: '3',
  },
  {
    label: (
      <>
        <PlusOutlined style={{marginRight: 8}} />
        <a href="/create-work-order">Create WorkOrder</a>
      </>
    ),
    key: '4',
  },
  {
    label: (
      <>
        <PlusOutlined style={{marginRight: 8}} />
        <a href="/create-proforma">Create Proforma</a>
      </>
    ),
    key: '5',
  },
  {
    label: (
      <>
        <PlusOutlined style={{marginRight: 8}} />
        <a href="/bulk-order-list">Create BulkOrder</a>
      </>
    ),
    key: '7',
  }
];
export default function AppHeader() {
 
  const handleMenuClick = e => {
    switch (e.key) {
      case '1':
        console.log('Profile clicked');
        // Add code to navigate to Profile or handle Profile logic
        break;
      case '2':
        console.log('Settings clicked');
        // Add code to navigate to Settings or handle Settings logic
        break;
      case '3':
        console.log('Logout clicked');
        // handleLogout();
        showLogoutConfirm();
        break;
      default:
        break;
    }
  };

  const showLogoutConfirm = () => {
    confirm({
      title: 'Are you sure you want to log out?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // dispatch(logout());
        // setTimeout(() => {
        //   navigate('/login');
      },
      onCancel() {
        console.log('Cancelled logout');
      },
    });
  };

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      <Menu.Item key="3">
        <Link>Logout</Link>
      </Menu.Item>
    </Menu>
  );
  return (
    <Header>
      {/* Right section with buttons and user menu */}
      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
        <Dropdown
          className="addmenu"
          menu={{
            items,
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <a onClick={e => e.preventDefault()}>
          <Link>
            <PlusOutlined />
            </Link>
          </a>
        </Dropdown>
        <Dropdown overlay={userMenu} trigger={['click']} className="usermenu">
          <div
            style={{
              gap: '5px',
            }}
          >
             <Avatar className="ant-avatar" /> 
            <DownOutlined />
          </div>
        </Dropdown>

        <Button
          type="link"
          shape="circle"
          className="btnicon"
          onClick={showLogoutConfirm}
        >
          <LogoutOutlined />
        </Button>
      </div>
    </Header>
  );
}
