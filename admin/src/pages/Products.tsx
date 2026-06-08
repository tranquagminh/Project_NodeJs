import { useState } from 'react';
import {
  Table, Card, Input, Select, Button, Tag, Space, Typography, Alert,
} from 'antd';
import { SearchOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '../services/products';
import { dashboardService } from '../services/dashboard';
import type { Product, LowStockVariant } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  DRAFT: 'warning',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang bán',
  INACTIVE: 'Ngừng bán',
  DRAFT: 'Nháp',
};

const lowStockCols = [
  { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName', ellipsis: true },
  { title: 'Biến thể', dataIndex: 'variantName', key: 'variantName', ellipsis: true },
  { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 130 },
  {
    title: 'Tồn kho',
    dataIndex: 'stock',
    key: 'stock',
    width: 90,
    render: (v: number) => <Text type={v === 0 ? 'danger' : 'warning'} strong>{v}</Text>,
  },
];

export default function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [showLowStock, setShowLowStock] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-products', page, search, statusFilter],
    queryFn: () => productsService.list({ page, limit: 20, search, status: statusFilter }),
  });

  const { data: lowStockData = [] } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: () => dashboardService.getLowStock(5),
  });

  const productCols = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Thương hiệu',
      key: 'brand',
      width: 130,
      render: (_: unknown, r: Product) => r.brand?.name ?? '-',
    },
    {
      title: 'Danh mục',
      key: 'category',
      width: 130,
      render: (_: unknown, r: Product) => r.category?.name ?? '-',
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 110,
      render: (_: unknown, r: Product) => `${r.avgRating.toFixed(1)} ★ (${r.totalReviews})`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s] ?? s}</Tag>,
    },
    {
      title: 'Biến thể',
      key: 'variants',
      width: 90,
      render: (_: unknown, r: Product) => r.variants?.length ?? 0,
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4}>Quản lý sản phẩm</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Danh sách sản phẩm và theo dõi tồn kho</Text>
        </div>
        <Button
          icon={<WarningOutlined />}
          type={showLowStock ? 'primary' : 'default'}
          danger={showLowStock}
          onClick={() => setShowLowStock((v) => !v)}
        >
          Sắp hết hàng ({lowStockData.length})
        </Button>
      </div>

      {showLowStock && (
        <Card
          title={<><WarningOutlined style={{ color: '#d4891a' }} /> Biến thể sắp hết hàng</>}
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          {lowStockData.length === 0 ? (
            <Alert type="success" message="Không có biến thể nào sắp hết hàng" showIcon />
          ) : (
            <Table<LowStockVariant>
              dataSource={lowStockData}
              columns={lowStockCols}
              rowKey="variantId"
              pagination={false}
              size="small"
            />
          )}
        </Card>
      )}

      <Card bordered={false}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={() => { setSearch(searchInput); setPage(1); }}
            style={{ width: 240 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
          >
            <Option value="ACTIVE">Đang bán</Option>
            <Option value="INACTIVE">Ngừng bán</Option>
            <Option value="DRAFT">Nháp</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
        </Space>

        <Table<Product>
          dataSource={data?.data}
          columns={productCols}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.meta.total,
            showTotal: (t) => `Tổng ${t} sản phẩm`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>
    </div>
  );
}
