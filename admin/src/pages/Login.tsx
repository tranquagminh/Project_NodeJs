import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { useAuthStore } from '../store/authStore';

const { Title, Text } = Typography;

export default function Login() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { mutate: login, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN') {
        message.error('Tài khoản không có quyền truy cập admin');
        return;
      }
      setAuth(data.user, data.accessToken);
      navigate('/');
    },
    onError: () => {
      message.error('Email hoặc mật khẩu không đúng');
    },
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="login-logo-mark">V</div>
          <Title level={4} style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '-0.03em', color: '#1a2844', marginBottom: 4 }}>
            VOLTA Admin
          </Title>
          <Text style={{ fontSize: 13, color: '#6b7a9e' }}>
            Đăng nhập để tiếp tục
          </Text>
        </div>

        <Form layout="vertical" onFinish={login} size="large" autoComplete="off">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#a8b0c8' }} />}
              placeholder="Email"
              style={{ borderRadius: 4 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#a8b0c8' }} />}
              placeholder="Mật khẩu"
              style={{ borderRadius: 4 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isPending}
              style={{
                height: 42,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.04em',
                fontSize: 13,
                textTransform: 'uppercase',
                borderRadius: 4,
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
