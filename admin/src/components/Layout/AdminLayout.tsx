import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

const { Sider, Header, Content } = Layout;

export default function AdminLayout() {
  const { isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        collapsedWidth={64}
        style={{ background: '#1a2844', position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
      >
        <Sidebar />
      </Sider>

      <Layout style={{ background: '#f7f6f3' }}>
        <Header
          style={{
            padding: '0 28px',
            background: '#1a2844',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <AppHeader />
        </Header>

        <Content style={{ margin: '28px 28px 28px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
