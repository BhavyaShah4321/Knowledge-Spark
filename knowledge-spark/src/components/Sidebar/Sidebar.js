import {
  BarChartOutlined,
  CreditCardOutlined,
  LaptopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RiseOutlined,
  RobotOutlined,
  VideoCameraOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../Image/logo.jpg";
import "../../Styles/Common.scss";

const { Sider } = Layout;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = () => {
      const storedAuth = localStorage.getItem("auth_token");
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);

        // ✅ Ensure type is never null, set it to "Admin" if missing
        if (!parsedAuth.user.type) {
          parsedAuth.user.type = "Admin";
          localStorage.setItem("auth_token", JSON.stringify(parsedAuth)); // Save updated data
        }

        setUser(parsedAuth.user);
      }
    };

    fetchUserData(); // Initial fetch

    // Listen for storage changes
    const handleStorageChange = () => fetchUserData();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (!user) return null; // Show nothing until user data is loaded

  // Define sidebar items with access control
  const sidebarItems = [
    {
      key: "/dashboard",
      label: "Dashboard",
      icon: <BarChartOutlined />,
      roles: ["Admin", "Teacher", "Student"],
    },
    {
      key: "/mycourses",
      label: "My Course",
      icon: <BarChartOutlined />,
      roles: ["Student"],
    },
    {
      key: "/teacher-list",
      label: "Teachers",
      icon: <RobotOutlined />,
      roles: ["Admin"],
    },
    {
      key: "/student-list",
      label: "Students",
      icon: <BarChartOutlined />,
      roles: ["Admin"],
    },
    {
      key: "/category-list",
      label: "Category",
      icon: <BarChartOutlined />,
      roles: ["Admin"],
    },
    {
      key: "/course-list",
      label: "Courses",
      icon: <RiseOutlined />,
      roles: ["Admin"],
    },
    {
      key: "/chat-list",
      label: "Chat",
      icon: <WechatOutlined />,
      roles: ["Admin"],
    },
    {
      key: "/manage-video-chat",
      label: "Vido Call",
      icon: <VideoCameraOutlined />,
      roles: ["Admin"],
    },
    {
      key: "/feedback",
      label: "Feedback",
      icon: <BarChartOutlined />,
      roles: ["Admin"],
    },
    // { key: "/complaints", label: "Complaints", icon: <BarChartOutlined />, roles: ["Admin"] },
    {
      key: "/manage-courses",
      label: "Course",
      icon: <RobotOutlined />,
      roles: ["Teacher"],
    },
    {
      key: "/teacher-chat",
      label: "Chat",
      icon: <WechatOutlined />,
      roles: ["Teacher"],
    },
    {
      key: "/student-coures",
      label: "Courses",
      icon: <LaptopOutlined />,
      roles: ["Student"],
    },
    {
      key: "/student-chat",
      label: "Chat",
      icon: <WechatOutlined />,
      roles: ["Student"],
    },

    {
      key: "/student-payment",
      label: "Purchase Course",
      icon: <CreditCardOutlined />,
      roles: ["Student"],
    },
    {
      key: "/complaint-list",
      label: "Complaints",
      icon: <RiseOutlined />,
      roles: ["Admin"],
    },
    {
      key: "/teacher-feedback",
      label: "Feedback",
      icon: <BarChartOutlined />,
      roles: ["Teacher"],
    },
    {
      key: "/create-complaint",
      label: "Complaint",
      icon: <RiseOutlined />,
      roles: ["Teacher", "Student"],
    },
  ];

  // Filter items based on user type from localStorage
  const filteredSidebarItems = sidebarItems.filter((item) =>
    item.roles.includes(user.type)
  );

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
          <img
            className="widhout-collapsed-logo"
            src={Logo}
            width="181px"
            alt="Logo"
            style={{ height: "62px", objectFit: "cover" }}
          />
          <img
            className="with-collapsed-logo"
            src={Logo}
            width="50px"
            height="49px"
            alt="Logo"
          />
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleNavigate}
          style={{ padding: "12px" }}
        >
          {filteredSidebarItems.map((item) => (
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
        style={{ fontSize: "16px", width: 64, height: 64 }}
      />
    </section>
  );
}
