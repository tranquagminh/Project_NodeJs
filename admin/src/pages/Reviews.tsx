import { useState } from 'react';
import {
  Table, Card, Select, Button, Tag, Space, Modal, Typography, Rate, Input, message, Popconfirm,
} from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { reviewsService } from '../services/reviews';
import type { Review } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const STATUS_COLOR: Record<string, string> = {
  PENDING_APPROVAL: 'gold',
  APPROVED: 'success',
  REJECTED: 'error',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export default function Reviews() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_APPROVAL');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; reviewId?: string }>({ open: false });
  const [rejectReason, setRejectReason] = useState('');
  const [detailModal, setDetailModal] = useState<Review | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reviews', page, statusFilter],
    queryFn: () => reviewsService.list({ page, limit: 20, status: statusFilter }),
  });

  const approveMutation = useMutation({
    mutationFn: reviewsService.approve,
    onSuccess: () => {
      message.success('Đã duyệt đánh giá');
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => reviewsService.reject(id, reason),
    onSuccess: () => {
      message.success('Đã từ chối đánh giá');
      setRejectModal({ open: false });
      setRejectReason('');
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: reviewsService.delete,
    onSuccess: () => {
      message.success('Đã xóa đánh giá');
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: unknown, r: Review) => <Text ellipsis style={{ maxWidth: 180 }}>{r.product.name}</Text>,
    },
    {
      title: 'Người đánh giá',
      key: 'user',
      width: 140,
      render: (_: unknown, r: Review) => r.user.fullName,
    },
    {
      title: 'Sao',
      dataIndex: 'rating',
      key: 'rating',
      width: 130,
      render: (v: number) => <Rate disabled defaultValue={v} style={{ fontSize: 12 }} />,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, r: Review) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setDetailModal(r)}>
          {title}
        </Button>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s] ?? s}</Tag>,
    },
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      render: (_: unknown, r: Review) => (
        <Space size={4}>
          {r.status !== 'APPROVED' && (
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => approveMutation.mutate(r.id)}
              loading={approveMutation.isPending}
            >
              Duyệt
            </Button>
          )}
          {r.status !== 'REJECTED' && (
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => setRejectModal({ open: true, reviewId: r.id })}
            >
              Từ chối
            </Button>
          )}
          <Popconfirm
            title="Xóa đánh giá?"
            onConfirm={() => deleteMutation.mutate(r.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Kiểm duyệt đánh giá</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Duyệt hoặc từ chối đánh giá sản phẩm từ khách hàng</Text>
      </div>
      <Card bordered={false}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            value={statusFilter}
            style={{ width: 160 }}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
          >
            <Option value="PENDING_APPROVAL">Chờ duyệt</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Từ chối</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
        </Space>

        <Table<Review>
          dataSource={data?.data}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.meta.total,
            showTotal: (t) => `Tổng ${t} đánh giá`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      {/* Review Detail Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={560}
      >
        {detailModal && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{detailModal.user.fullName}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>{dayjs(detailModal.createdAt).format('DD/MM/YYYY')}</Text>
            </div>
            <Rate disabled value={detailModal.rating} />
            <div style={{ marginTop: 12 }}>
              <Text strong>{detailModal.title}</Text>
              <Paragraph style={{ marginTop: 8 }}>{detailModal.comment}</Paragraph>
            </div>
            {detailModal.adminNote && (
              <div style={{ background: '#fff1f0', padding: '8px 12px', borderRadius: 6, marginTop: 8 }}>
                <Text type="danger">Ghi chú admin: {detailModal.adminNote}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối đánh giá"
        open={rejectModal.open}
        onCancel={() => { setRejectModal({ open: false }); setRejectReason(''); }}
        onOk={() => {
          if (!rejectModal.reviewId || !rejectReason.trim()) {
            message.warning('Vui lòng nhập lý do từ chối');
            return;
          }
          rejectMutation.mutate({ id: rejectModal.reviewId, reason: rejectReason });
        }}
        confirmLoading={rejectMutation.isPending}
        okText="Từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
      >
        <TextArea
          placeholder="Lý do từ chối..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
}
