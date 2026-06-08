import { Row, Col, Card, Statistic, Alert, Table, Tag, Spin, Typography } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AlertOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { dashboardService } from '../services/dashboard';
import type { TopProduct } from '../types';

const { Title, Text } = Typography;

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const topProductCols = [
  { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName', ellipsis: true },
  { title: 'Đã bán', dataIndex: 'totalSold', key: 'totalSold', width: 90, render: (v: number) => v.toLocaleString() },
  { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', width: 140, render: (v: number) => fmt(v) },
];

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardService.getSummary,
  });

  const { data: revenueSeries = [], isLoading: loadingSeries } = useQuery({
    queryKey: ['dashboard', 'revenue', 30],
    queryFn: () => dashboardService.getRevenueSeries(30),
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: () => dashboardService.getTopProducts(),
  });

  if (loadingSummary) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  const chartData = revenueSeries.map((p) => ({
    ...p,
    date: dayjs(p.date).format('DD/MM'),
  }));

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Tổng quan</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Tổng hợp hoạt động kinh doanh VOLTA</Text>
      </div>

      {/* Alerts */}
      {summary && (summary.alerts.pendingReviews > 0 || summary.alerts.pendingReturns > 0 || summary.alerts.lowStockVariants > 0) && (
        <Alert
          icon={<AlertOutlined />}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          message={
            <span>
              {summary.alerts.pendingReviews > 0 && <span style={{ marginRight: 16 }}>{summary.alerts.pendingReviews} đánh giá chờ duyệt</span>}
              {summary.alerts.pendingReturns > 0 && <span style={{ marginRight: 16 }}>{summary.alerts.pendingReturns} yêu cầu hoàn trả</span>}
              {summary.alerts.lowStockVariants > 0 && <span>{summary.alerts.lowStockVariants} biến thể sắp hết hàng</span>}
            </span>
          }
        />
      )}

      {/* Revenue Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Doanh thu hôm nay"
              value={summary?.revenue.today ?? 0}
              formatter={(v) => fmt(Number(v))}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1a2844' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Doanh thu tuần này"
              value={summary?.revenue.thisWeek ?? 0}
              formatter={(v) => fmt(Number(v))}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#3a9456' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Doanh thu tháng này"
              value={summary?.revenue.thisMonth ?? 0}
              formatter={(v) => fmt(Number(v))}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1a2844' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Doanh thu năm nay"
              value={summary?.revenue.thisYear ?? 0}
              formatter={(v) => fmt(Number(v))}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#d4891a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Order + User Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Tổng đơn hàng" value={summary?.orders.total ?? 0} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Đang xử lý" value={summary?.orders.processing ?? 0} valueStyle={{ color: '#d4891a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Người dùng" value={summary?.users.total ?? 0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Mới tháng này" value={summary?.users.newThisMonth ?? 0} valueStyle={{ color: '#3a9456' }} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart + Top Products */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Doanh thu 30 ngày gần nhất" bordered={false}>
            {loadingSeries ? (
              <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => fmt(Number(v ?? 0))} />
                  <Line type="monotone" dataKey="revenue" stroke="#1a2844" strokeWidth={2} dot={false} name="Doanh thu" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Top sản phẩm bán chạy" bordered={false}>
            <Table<TopProduct>
              dataSource={topProducts}
              columns={topProductCols}
              rowKey="productId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Order Status Breakdown */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Trạng thái đơn hàng" bordered={false}>
            <Row gutter={[16, 8]}>
              {summary && Object.entries(summary.orders).map(([key, val]) => {
                if (key === 'total') return null;
                const colorMap: Record<string, string> = {
                  pending: 'gold',
                  processing: 'blue',
                  delivered: 'green',
                  cancelled: 'red',
                };
                const labelMap: Record<string, string> = {
                  pending: 'Chờ xác nhận',
                  processing: 'Đang xử lý',
                  delivered: 'Đã giao',
                  cancelled: 'Đã hủy',
                };
                return (
                  <Col key={key} xs={12} sm={6}>
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#1a2844' }}>{val}</div>
                      <Tag color={colorMap[key] ?? 'default'}>{labelMap[key] ?? key}</Tag>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
