import React, { useEffect, useState } from 'react';
import { Button, Modal, Progress, Space, Typography } from 'antd';
import { ExclamationCircleFilled, UserOutlined, CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

function ProfileCompletionPrompt() {
  const [visible, setVisible] = useState(false);
  const [showMiniPrompt, setShowMiniPrompt] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(100);
  const [missingFields, setMissingFields] = useState([]);
  const [userType, setUserType] = useState(null);

  // Define required fields based on user type
  const getRequiredFields = () => {
    const baseFields = [
      { key: 'profile_picture', label: 'Profile Picture' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'type', label: 'Account Type' },
      { key: 'status', label: 'Account Status' }
    ];

    if (userType === 'teacher') {
      return [
        ...baseFields,
        { key: 'user_degree_certificate', label: 'Degree Certificate' },
        { key: 'razorpay_contact_id', label: 'Payment Information' }
      ];
    }

    return baseFields;
  };

  useEffect(() => {
    const calculateCompletion = () => {
      const authData = JSON.parse(localStorage.getItem('auth_token'));
      if (!authData || !authData.user) return;

      const user = authData.user;
      setUserType(user.type); // Set user type for field customization

      const requiredFields = getRequiredFields();
      let completedFields = 0;
      const missing = [];

      requiredFields.forEach(field => {
        if (user[field.key]) {
          completedFields++;
        } else {
          missing.push(field.label);
        }
      });

      const completion = Math.round((completedFields / requiredFields.length) * 100);
      setProfileCompletion(completion);
      setMissingFields(missing);

      // Only show prompt if not previously dismissed
      const promptDismissed = localStorage.getItem('profilePromptDismissed');
      if (!promptDismissed && completion < 100) {
        if (completion < 70) {
          setVisible(true);
        } else {
          const timer = setTimeout(() => {
            setShowMiniPrompt(true);
          }, 5000);
          return () => clearTimeout(timer);
        }
      }
    };

    calculateCompletion();
  }, []);

  const handleClose = () => {
    setVisible(false);
    setShowMiniPrompt(false);
    // Remember dismissal for this session
    localStorage.setItem('profilePromptDismissed', 'true');
  };

  const handleMiniPromptClick = () => {
    setShowMiniPrompt(false);
    setVisible(true);
  };

  const handleCloseMiniPrompt = (e) => {
    e.stopPropagation();
    setShowMiniPrompt(false);
    // Remember dismissal for this session
    localStorage.setItem('profilePromptDismissed', 'true');
  };

  // Only render if profile is incomplete
  if (profileCompletion >= 100) return null;

  return (
    <>
      <Modal
        title={
          <Space>
            <ExclamationCircleFilled style={{ color: '#faad14' }} />
            <span>Complete Your {userType === 'teacher' ? 'Teacher' : 'Student'} Profile</span>
          </Space>
        }
        open={visible}
        onCancel={handleClose}
        footer={[
          <Button key="later" onClick={handleClose}>
            I'll do it later
          </Button>,
          <Button 
            key="complete" 
            type="primary" 
            onClick={handleClose}
          >
            <Link to="/profile">Complete Now</Link>
          </Button>,
        ]}
        width={600}
        centered
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Progress
            type="circle"
            percent={profileCompletion}
            width={150}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            format={percent => `${percent}%`}
          />
          
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ marginBottom: 8 }}>
              Your profile is {profileCompletion}% complete
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Complete your profile to unlock all {userType === 'teacher' ? 'teaching' : 'learning'} features.
            </Text>
            
            {missingFields.length > 0 && (
              <div>
                <Text strong>Missing information:</Text>
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {showMiniPrompt && (
        <div 
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            background: 'white',
            borderRadius: 8,
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            border: '1px solid #f0f0f0',
            width: 250,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderLeft: profileCompletion >= 80 ? '4px solid #52c41a' : '4px solid #1890ff',
            animation: 'slideIn 0.3s ease-out'
          }}
          onClick={handleMiniPromptClick}
        >
          {profileCompletion >= 80 ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
          ) : (
            <UserOutlined style={{ color: '#1890ff', fontSize: 24 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {profileCompletion >= 80 ? 'Almost complete!' : 'Complete your profile'}
            </div>
            <Progress 
              percent={profileCompletion} 
              showInfo={false} 
              strokeColor={profileCompletion >= 80 ? '#52c41a' : '#1890ff'}
            />
          </div>
          <CloseOutlined 
            style={{ 
              position: 'absolute',
              top: -8,
              right: -8,
              color: '#999',
              background: 'white',
              borderRadius: '50%',
              padding: 4,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onClick={handleCloseMiniPrompt}
          />
        </div>
      )}
    </>
  );
}

export default ProfileCompletionPrompt;