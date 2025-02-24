// import { DownOutlined, LogoutOutlined, PlusOutlined } from '@ant-design/icons';
// import { Avatar, Button, Dropdown, Layout, Menu, message, Modal } from 'antd';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// const { confirm } = Modal;
// const { Header } = Layout;

// const items = [
//   {
//     label: (
//       <>
//         <PlusOutlined style={{ marginRight: 8 }} />
//         <a href="">Add Die Profile</a>
//       </>
//     ),
//     key: '0',
//   },
// ];

// export default function AppHeader() {
//   const navigate = useNavigate();
//   const [userEmail, setUserEmail] = useState('');

//   useEffect(() => {
//     const authData = JSON.parse(localStorage.getItem('auth_token'));
//     if (authData && authData.user && authData.user.email) {
//       setUserEmail(authData.user.email);
//     } else {
//       setUserEmail('N/A');
//     }
//   }, []);

//   const handleMenuClick = (e) => {
//     switch (e.key) {
//       case '1':
//         console.log('Profile clicked');
//         break;
//       case '2':
//         console.log('Settings clicked');
//         break;
//       case '3':
//         showLogoutConfirm();
//         break;
//       default:
//         break;
//     }
//   };

//   const showLogoutConfirm = () => {
//     confirm({
//       title: 'Are you sure you want to log out?',
//       okText: 'Yes',
//       okType: 'danger',
//       cancelText: 'No',
//       onOk() {
//         handleLogout();
//       },
//       onCancel() {
//         console.log('Cancelled logout');
//       },
//     });
//   };

//   const handleLogout = async () => {
//     try {
//       const authData = JSON.parse(localStorage.getItem('auth_token'));

//       if (!authData || !authData.refresh_token) {
//         message.error('No refresh token found. Please log in again.');
//         return;
//       }

//       const refreshToken = authData.refresh_token;
//       const accessToken = authData.access_token;

//       const response = await axios.post(
//         'http://localhost:8000/api/user/logout/',
//         { refresh_token: refreshToken },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         message.success('Logged out successfully!');
//         localStorage.removeItem('auth_token');
//         navigate('/');
//       } else {
//         message.error('Failed to log out. Please try again.');
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//       if (error.response && error.response.status === 401) {
//         message.error('Session expired. Please log in again.');
//       } else {
//         message.error('An error occurred while logging out. Please try again.');
//       }
//     }
//   };

//   const getInitials = (email) => {
//     if (!email || email === 'N/A') return 'N/A';
//     const namePart = email.split('@')[0];
//     const initials = namePart
//       .split(/[\W]/)
//       .map((word) => word.charAt(0).toUpperCase())
//       .join('');
//     return initials.slice(0, 2);
//   };

//   const backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

//   const userMenu = (
//     <Menu onClick={handleMenuClick}>
//       <Menu.Item key="1">
//         <Link to='/profile'>Profile</Link>
//       </Menu.Item>
//       <Menu.Item key="2">
//         <Link>Settings</Link>
//       </Menu.Item>
//       <Menu.Item key="3">
//         <Link>Logout</Link>
//       </Menu.Item>
//     </Menu>
//   );

//   return (
//     <Header>
//       <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//         <Dropdown overlay={userMenu} trigger={['click']} className="usermenu">
//           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <Avatar
//               style={{
//                 backgroundColor: backgroundColor,
//                 color: '#fff',
//               }}
//             >
//               {getInitials(userEmail)}
//             </Avatar>
//             <DownOutlined />
//           </div>
//         </Dropdown>
//         <Button
//           type="link"
//           shape="circle"
//           className="btnicon"
//           onClick={showLogoutConfirm}
//         >
//           <LogoutOutlined />
//         </Button>
//       </div>
//     </Header>
//   );
// }




import { DownOutlined, LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, message, Modal } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const { confirm } = Modal;
const { Header } = Layout;

const items = [
  {
    label: (
      <>
        <PlusOutlined style={{ marginRight: 8 }} />
        <a href="">Add Die Profile</a>
      </>
    ),
    key: '0',
  },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('auth_token'));
    if (authData && authData.user && authData.user.email) {
      setUserEmail(authData.user.email);
      setUserId(authData.user.id);
    } else {
      setUserEmail('N/A');
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const authData = JSON.parse(localStorage.getItem('auth_token'));

      if (!authData || !authData.refresh_token) {
        message.error('No refresh token found. Please log in again.');
        return;
      }

      const accessToken = authData.access_token;
      axios
        .get(`http://localhost:8000/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          const { profile_picture } = response.data;
          setProfilePicture(profile_picture || '');  // Update profile picture
        })

        .catch((error) => {
          console.error('Error fetching user data:', error);
          message.error('Failed to load user data.');
        });
    }
  }, [userId]);

  const handleMenuClick = (e) => {
    switch (e.key) {
      case '1':
        console.log('Profile clicked');
        break;
      case '2':
        console.log('Settings clicked');
        break;
      case '3':
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
        handleLogout();
      },
      onCancel() {
        console.log('Cancelled logout');
      },
    });
  };

  const handleLogout = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('auth_token'));

      if (!authData || !authData.refresh_token) {
        message.error('No refresh token found. Please log in again.');
        return;
      }

      const refreshToken = authData.refresh_token;
      const accessToken = authData.access_token;

      const response = await axios.post(
        'http://localhost:8000/api/user/logout/',
        { refresh_token: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        message.success('Logged out successfully!');
        localStorage.removeItem('auth_token');
        navigate('/');
      } else {
        message.error('Failed to log out. Please try again.');
      }
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    } catch (error) {
      console.error('Logout error:', error);
      if (error.response && error.response.status === 401) {
        message.error('Session expired. Please log in again.');
      } else {
        message.error('An error occurred while logging out. Please try again.');
      }
    }
  };

  const getInitials = (email) => {
    if (!email || email === 'N/A') return 'N/A';
    const namePart = email.split('@')[0];
    const initials = namePart
      .split(/[\W]/)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
    return initials.slice(0, 2);
  };

  const backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">
        <Link to='/profile'>Profile</Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link>Settings</Link>
      </Menu.Item>
      <Menu.Item key="3">
        <Link>Logout</Link>
      </Menu.Item>
    </Menu>
  );
  return (
    <Header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Dropdown overlay={userMenu} trigger={['click']} className="usermenu">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {profilePicture ? (
              <img
                src={`${profilePicture}`}
                alt="User Profile"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ddd',
                }}
              />

            ) : (
              <Avatar style={{ backgroundColor: backgroundColor, color: '#fff' }}>
                {getInitials(userEmail)}
              </Avatar>
            )}
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
