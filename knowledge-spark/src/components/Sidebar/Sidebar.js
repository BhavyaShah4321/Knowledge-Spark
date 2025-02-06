import {
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RiseOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../Image/logo.jpg';
import '../../Styles/Common.scss';

const { Sider } = Layout;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth_token');
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      const { user } = parsedAuth;
      if (user) {
        setUser(user);
      }
    }
  }, []);

  if (!user) return null; // Show nothing until user data is loaded

  // Define sidebar items with access control
  const sidebarItems = [
    { key: "/dashboard", label: "Dashboard", icon: <BarChartOutlined />, roles: ["Admin", "Teacher", "Student"] },
    { key: "/mycourses", label: "My Course", icon: <BarChartOutlined />, roles: ["Student"] },
    { key: "/teacher-list", label: "Teachers", icon: <RobotOutlined />, roles: ["Admin"] },
    { key: "/student-list", label: "Students", icon: <BarChartOutlined />, roles: ["Admin", "Teacher"] },
    { key: "/category-list", label: "Category", icon: <BarChartOutlined />, roles: ["Admin", "Teacher"] },
    { key: "/course-list", label: "Courses", icon: <RiseOutlined />, roles: ["Admin", "Teacher", "Student"] },
    { key: "/feedback", label: "Feedback", icon: <BarChartOutlined />, roles: ["Admin", "Student"] },
    { key: "/complaints", label: "Complaints", icon: <BarChartOutlined />, roles: ["Admin", "Student","Teacher"] },
  ];

  // Filter items based on user type from localStorage
  const filteredSidebarItems = sidebarItems.filter(item => item.roles.includes(user.type));

  const handleNavigate = (event) => {
    navigate(event.key);
  };

  return (
    <section className="sidebar_menu_section">
      <Sider
        width={280}
        collapsible
        collapsed={collapsed}
        trigger={null}
        className="sidebar_menu_section"
      >
        <div className="LogoSec">
          <img className="widhout-collapsed-logo" src={Logo} width="181px" height="63px" alt="Logo" />
          <img className="with-collapsed-logo" src={Logo} width="50px" height="49px" alt="Logo" />
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleNavigate}
          style={{ padding: '12px' }}
        >
          {filteredSidebarItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Tooltip title={item.label} placement="right">
                <span>{item.label}</span>
              </Tooltip>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      <Button
        type="text"
        className="toggleBtn"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />
    </section>
  );
}
