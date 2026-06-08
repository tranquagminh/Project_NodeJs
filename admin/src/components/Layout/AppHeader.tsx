import { Avatar, Dropdown, Space, Typography, Badge } from 'antd';
import { UserOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';

const { Text } = Typography;

export default function AppHeader() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authService.logout(); } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const userMenu = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <span style={{ fontSize: 13 }}>{user?.fullName}</span>,
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="app-header-inner">
      {/* Page context breadcrumb could go here */}
      <div />

      <Space size={20}>
        {/* Notification bell */}
        <Badge count={0} showZero={false}>
          <BellOutlined style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', cursor: 'pointer' }} />
        </Badge>

        {/* User dropdown */}
        <Dropdown menu={{ items: userMenu }} placement="bottomRight" trigger={['click']}>
          <Space style={{ cursor: 'pointer' }} size={10}>
            <Avatar
              size={32}
              style={{ background: '#3a9456', fontWeight: 700, fontSize: 13 }}
            >
              {user?.fullName?.[0]?.toUpperCase() ?? 'A'}
            </Avatar>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 600 }}>
                {user?.fullName}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </div>
  );
}
