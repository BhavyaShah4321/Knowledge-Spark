import {
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RiseOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../Image/Logo.png';
import '../../Styles/Common.css';
const { Sider } = Layout;
const { SubMenu } = Menu;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const parentKeys = {
    '/die-grouplist': '2',
    '/die-category': '2',
    '/die-subcategory': '2',
    '/die-size-list': '2',
    '/die-press-list': '2',
    '/die-type-list': '2',
    '/under-group-list': '2',
    '/account-group-list': '2',
    '/customer-category-list': '2',
    '/customer-type-list': '2',
    '/tempers-list': '2',
    '/manage-user': '3',
    '/manage-user-group': '3',
    '/die-profilelist': '4',
    '/die-tool-list': '4',
    '/customer-list': '5',
    '/conversion-rate-list': '5',
    '/quotation-list': '5',
    '/die-quotation-list': '5',
    '/work-order-list': '5',
    '/proforma-list': '5',
    '/bulk-order-list': '5',
    '/Work-Order-Report': 7,
    '/packing-report-list': 7,
    '/packing-report': 7,
  };

  const [openKeys, setOpenKeys] = useState([parentKeys[location.pathname]]);

  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (latestOpenKey) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys([]);
    }
  };
  const handleNavigate = (event) => {
    navigate(event.key);
  };

  useEffect(() => {
    const currentPath = location.pathname;
    if (parentKeys[currentPath]) {
      setOpenKeys([parentKeys[currentPath]]);
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(windowWidth < 992);

  const handleCollapse = collapsed => {
    setCollapsed(collapsed);
  };

  return (
    <section className="sidebar_menu_section">
      <Sider
        width={280}
        collapsible
        collapsed={collapsed}
        onBreakpoint={broken => console.log('Breakpoint:', broken)}
        onCollapse={handleCollapse}
        trigger={null}
        className="sidebar_menu_section"
        breakpoint="lg"
      >
        <div className="LogoSec">
          <img
            className="widhout-collapsed-logo"
            src={Logo}
            width={'181px'}
            height={'48px'}
            alt=""
          ></img>
          <img
            className="with-collapsed-logo"
            src={Logo}
            width={'50px'}
            height={'49px'}
            alt=""
          ></img>
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={(event) => {
            handleNavigate(event);
          }}
          style={{ padding: '12px' }}
        >
          <Menu.Item key="/dashboard" icon={<BarChartOutlined />}>
            <Tooltip title="Dashboard" placement="right">
              <span>Dashboard</span>
            </Tooltip>
          </Menu.Item>
          <SubMenu key="5" icon={<RiseOutlined />} title="Manage Teacher">
            <Menu.Item key="/teacher-list">
              <Tooltip title="Manage Teacher" placement="right">
                <span>Teacher</span>
              </Tooltip>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="3"
            icon={<RobotOutlined />}
            title="Manage Student"
          >
            <Menu.Item key="/student-list">
              <Tooltip title="Manage Student" placement="right">
                <span>Student</span>
              </Tooltip>
            </Menu.Item>

          </SubMenu>
        </Menu>
      </Sider>
      <Button
        type="text"
        className="toggleBtn"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />
    </section>
  );
}
