import { Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  RollbackOutlined,
  AppstoreOutlined,
  UserOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { key: '/',        icon: <DashboardOutlined />, label: 'Dashboard'       },
  { key: '/orders',  icon: <ShoppingCartOutlined />, label: 'Đơn hàng'    },
  { key: '/reviews', icon: <StarOutlined />,        label: 'Đánh giá'     },
  { key: '/returns', icon: <RollbackOutlined />,    label: 'Hoàn trả'     },
  { key: '/products',icon: <AppstoreOutlined />,    label: 'Sản phẩm'     },
  { key: '/users',   icon: <UserOutlined />,        label: 'Người dùng'   },
  { key: '/coupons', icon: <TagOutlined />,          label: 'Mã giảm giá' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const selectedKey =
    menuItems
      .slice()
      .reverse()
      .find((item) => pathname === item.key || pathname.startsWith(item.key + '/'))
      ?.key ?? '/';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1a2844' }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-brand">V VOLTA</span>
        <span className="sidebar-logo-label">Admin Panel</span>
      </div>

      {/* Nav */}
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ flex: 1, borderRight: 0, background: '#1a2844', paddingTop: 8 }}
      />

      {/* Bottom brand mark */}
      <div className="sidebar-footer">
        <span>VOLTA Performance</span>
      </div>
    </div>
  );
}
