import { useState } from 'react';
import {
  Table, Card, Select, Button, Tag, Space, Modal, Typography, Descriptions, InputNumber, message, Popconfirm,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { returnsService } from '../services/returns';
import type { ReturnRequest } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLOR: Record<string, string> = {
  REQUESTED: 'gold',
  APPROVED: 'blue',
  REJECTED: 'error',
  RECEIVED: 'processing',
  REFUNDED: 'success',
};

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: 'Đã yêu cầu',
  APPROVED: 'Đã chấp nhận',
  REJECTED: 'Từ chối',
  RECEIVED: 'Đã nhận hàng',
  REFUNDED: 'Đã hoàn tiền',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export default function Returns() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>('REQUESTED');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [refundModal, setRefundModal] = useState<{ open: boolean; returnId?: string; maxAmount?: number }>({ open: false });
  const [refundAmount, setRefundAmount] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-returns', page, statusFilter],
    queryFn: () => returnsService.list({ page, limit: 20, status: statusFilter }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => returnsService.approve(id),
    onSuccess: () => { message.success('Đã chấp nhận yêu cầu hoàn trả'); qc.invalidateQueries({ queryKey: ['admin-returns'] }); },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => returnsService.reject(id, reason),
    onSuccess: () => { message.success('Đã từ chối yêu cầu'); qc.invalidateQueries({ queryKey: ['admin-returns'] }); },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const receivedMutation = useMutation({
    mutationFn: returnsService.markReceived,
    onSuccess: () => { message.success('Đã xác nhận nhận hàng'); qc.invalidateQueries({ queryKey: ['admin-returns'] }); },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => returnsService.processRefund(id, amount),
    onSuccess: () => {
      message.success('Đã xử lý hoàn tiền');
      setRefundModal({ open: false });
      setRefundAmount(null);
      qc.invalidateQueries({ queryKey: ['admin-returns'] });
    },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const columns = [
    {
      title: 'Mã đơn',
      key: 'orderCode',
      width: 130,
      render: (_: unknown, r: ReturnRequest) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setSelectedReturn(r)}>
          {r.order?.code ?? r.orderCode}
        </Button>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: unknown, r: ReturnRequest) => r.user?.fullName ?? r.guestEmail ?? 'Khách lẻ',
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s] ?? s}</Tag>,
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 220,
      render: (_: unknown, r: ReturnRequest) => (
        <Space size={4} wrap>
          {r.status === 'REQUESTED' && (
            <>
              <Button size="small" type="primary" onClick={() => approveMutation.mutate(r.id)}>Chấp nhận</Button>
              <Popconfirm
                title="Từ chối yêu cầu này?"
                onConfirm={() => rejectMutation.mutate({ id: r.id, reason: 'Không đủ điều kiện hoàn trả' })}
                okText="Từ chối"
                cancelText="Hủy"
              >
                <Button size="small" danger>Từ chối</Button>
              </Popconfirm>
            </>
          )}
          {r.status === 'APPROVED' && (
            <Button size="small" onClick={() => receivedMutation.mutate(r.id)}>Đã nhận hàng</Button>
          )}
          {r.status === 'RECEIVED' && (
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setRefundModal({ open: true, returnId: r.id, maxAmount: r.order?.totalAmount });
                setRefundAmount(r.refundAmount ?? r.order?.totalAmount ?? 0);
              }}
            >
              Hoàn tiền
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Quản lý hoàn trả</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Xử lý yêu cầu đổi trả và hoàn tiền từ khách hàng</Text>
      </div>
      <Card bordered={false}>
        <Space style={{ marginBottom: 16 }} wrap>
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

        <Table<ReturnRequest>
          dataSource={data?.data}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.meta.total,
            showTotal: (t) => `Tổng ${t} yêu cầu`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu hoàn trả"
        open={!!selectedReturn}
        onCancel={() => setSelectedReturn(null)}
        footer={null}
        width={600}
      >
        {selectedReturn && (
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label="Mã đơn">{selectedReturn.order?.code}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={STATUS_COLOR[selectedReturn.status]}>{STATUS_LABEL[selectedReturn.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{selectedReturn.user?.fullName ?? selectedReturn.guestEmail}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedReturn.user?.email ?? selectedReturn.guestEmail ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Lý do" span={2}>{selectedReturn.reason}</Descriptions.Item>
            {selectedReturn.description && (
              <Descriptions.Item label="Mô tả" span={2}>{selectedReturn.description}</Descriptions.Item>
            )}
            {selectedReturn.refundAmount != null && (
              <Descriptions.Item label="Số tiền hoàn">{fmt(selectedReturn.refundAmount)}</Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày yêu cầu">{dayjs(selectedReturn.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        title="Xử lý hoàn tiền"
        open={refundModal.open}
        onCancel={() => { setRefundModal({ open: false }); setRefundAmount(null); }}
        onOk={() => {
          if (!refundModal.returnId || !refundAmount) return;
          refundMutation.mutate({ id: refundModal.returnId, amount: refundAmount });
        }}
        confirmLoading={refundMutation.isPending}
        okText="Xác nhận hoàn tiền"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Số tiền hoàn trả (tối đa {fmt(refundModal.maxAmount ?? 0)}):</Text>
          <InputNumber
            style={{ width: '100%' }}
            value={refundAmount}
            onChange={setRefundAmount}
            min={1}
            max={refundModal.maxAmount}
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            addonAfter="₫"
          />
        </Space>
      </Modal>
    </div>
  );
}
