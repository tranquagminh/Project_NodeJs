import { useState } from 'react';
import {
  Table, Card, Select, Input, Button, Tag, Space, Modal, Typography, Descriptions, Divider, message,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ordersService } from '../services/orders';
import type { Order, OrderStatus } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  PROCESSING: 'processing',
  SHIPPED: 'cyan',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUNDED: 'purple',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Hoàn tiền',
};

const NEXT_STATUSES: Record<string, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export default function Orders() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModal, setStatusModal] = useState<{ open: boolean; order?: Order }>({ open: false });
  const [newStatus, setNewStatus] = useState<OrderStatus | undefined>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders', page, statusFilter, search],
    queryFn: () => ordersService.list({ page, limit: 20, status: statusFilter as OrderStatus, search }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateStatus(id, status),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công');
      setStatusModal({ open: false });
      setNewStatus(undefined);
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (code: string, record: Order) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setSelectedOrder(record)}>
          {code}
        </Button>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: unknown, r: Order) => (
        <span>{r.user?.fullName ?? r.guestName ?? r.guestEmail ?? 'Khách lẻ'}</span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      render: (v: number) => fmt(v),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s] ?? s}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_: unknown, r: Order) => (
        <Button
          size="small"
          onClick={() => {
            setStatusModal({ open: true, order: r });
            setNewStatus(NEXT_STATUSES[r.status]?.[0]);
          }}
          disabled={NEXT_STATUSES[r.status]?.length === 0}
        >
          Cập nhật
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Quản lý đơn hàng</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Theo dõi và cập nhật trạng thái đơn hàng</Text>
      </div>
      <Card bordered={false}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm mã đơn, email..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={() => { setSearch(searchInput); setPage(1); }}
            style={{ width: 240 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <Option key={k} value={k}>{v}</Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
        </Space>

        <Table<Order>
          dataSource={data?.data}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.meta.total,
            showTotal: (t) => `Tổng ${t} đơn`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng ${selectedOrder?.code}`}
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={null}
        width={640}
      >
        {selectedOrder && (
          <>
            <Descriptions size="small" column={2} bordered>
              <Descriptions.Item label="Mã đơn">{selectedOrder.code}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={STATUS_COLOR[selectedOrder.status]}>{STATUS_LABEL[selectedOrder.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.user?.fullName ?? selectedOrder.guestName ?? 'Khách lẻ'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user?.email ?? selectedOrder.guestEmail ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">{fmt(selectedOrder.totalAmount)}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
            </Descriptions>
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <>
                <Divider plain style={{ textAlign: 'left' }}>Sản phẩm</Divider>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>{item.productName} — {item.variantName} × {item.quantity}</Text>
                    <Text strong>{fmt(item.price * item.quantity)}</Text>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={statusModal.open}
        onCancel={() => setStatusModal({ open: false })}
        onOk={() => {
          if (!statusModal.order || !newStatus) return;
          updateStatusMutation.mutate({ id: statusModal.order.id, status: newStatus });
        }}
        confirmLoading={updateStatusMutation.isPending}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Đơn hàng: <Text strong>{statusModal.order?.code}</Text></Text>
          <Text>Trạng thái hiện tại: <Tag color={STATUS_COLOR[statusModal.order?.status ?? '']}>{STATUS_LABEL[statusModal.order?.status ?? ''] ?? statusModal.order?.status}</Tag></Text>
          <Select
            value={newStatus}
            onChange={setNewStatus}
            style={{ width: '100%' }}
            placeholder="Chọn trạng thái mới"
          >
            {(NEXT_STATUSES[statusModal.order?.status ?? ''] ?? []).map((s) => (
              <Option key={s} value={s}>{STATUS_LABEL[s]}</Option>
            ))}
          </Select>
        </Space>
      </Modal>
    </div>
  );
}
