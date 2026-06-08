import { useState } from 'react';
import {
  Table, Card, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, Switch,
  Typography, Popconfirm, message, DatePicker,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { couponsService, type CreateCouponPayload } from '../services/coupons';
import type { Coupon } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export default function Coupons() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [formModal, setFormModal] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-coupons', page],
    queryFn: () => couponsService.list({ page, limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCouponPayload) => couponsService.create(payload),
    onSuccess: () => {
      message.success('Tạo mã giảm giá thành công');
      setFormModal(false);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => message.error('Có lỗi xảy ra hoặc mã đã tồn tại'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => couponsService.toggle(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: couponsService.delete,
    onSuccess: () => {
      message.success('Đã xóa mã giảm giá');
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const handleSubmit = (values: Record<string, unknown>) => {
    const dateRange = values.dateRange as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
    const payload: CreateCouponPayload = {
      code: (values.code as string).toUpperCase(),
      type: values.type as 'PERCENTAGE' | 'FIXED',
      value: values.value as number,
      minOrderValue: values.minOrderValue as number | undefined,
      maxDiscount: values.type === 'PERCENTAGE' ? (values.maxDiscount as number | undefined) : undefined,
      usageLimit: values.usageLimit as number | undefined,
      startDate: dateRange?.[0]?.toISOString(),
      endDate: dateRange?.[1]?.toISOString(),
    };
    createMutation.mutate(payload);
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (code: string) => <Text strong code>{code}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (t: string) => <Tag color={t === 'PERCENTAGE' ? 'blue' : 'green'}>{t === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}</Tag>,
    },
    {
      title: 'Giá trị',
      key: 'value',
      width: 120,
      render: (_: unknown, r: Coupon) =>
        r.type === 'PERCENTAGE' ? `${r.value}%` : fmt(r.value),
    },
    {
      title: 'Đơn tối thiểu',
      key: 'minOrderValue',
      width: 130,
      render: (_: unknown, r: Coupon) => r.minOrderValue ? fmt(r.minOrderValue) : '-',
    },
    {
      title: 'Đã dùng / Giới hạn',
      key: 'usage',
      width: 150,
      render: (_: unknown, r: Coupon) =>
        `${r.usageCount} / ${r.usageLimit ?? '∞'}`,
    },
    {
      title: 'Hiệu lực',
      key: 'dates',
      width: 200,
      render: (_: unknown, r: Coupon) => {
        if (!r.startDate && !r.endDate) return 'Không giới hạn';
        return `${r.startDate ? dayjs(r.startDate).format('DD/MM/YY') : '...'} → ${r.endDate ? dayjs(r.endDate).format('DD/MM/YY') : '...'}`;
      },
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      render: (v: boolean, r: Coupon) => (
        <Switch
          checked={v}
          size="small"
          onChange={(checked) => toggleMutation.mutate({ id: r.id, isActive: checked })}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 80,
      render: (_: unknown, r: Coupon) => (
        <Popconfirm
          title="Xóa mã giảm giá này?"
          onConfirm={() => deleteMutation.mutate(r.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button size="small" danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4}>Quản lý mã giảm giá</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Tạo và quản lý mã khuyến mãi cho khách hàng</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal(true)}>Tạo mã mới</Button>
        </Space>
      </div>

      <Card bordered={false}>
        <Table<Coupon>
          dataSource={data?.data}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.meta.total,
            showTotal: (t) => `Tổng ${t} mã`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      {/* Create Coupon Modal */}
      <Modal
        title="Tạo mã giảm giá mới"
        open={formModal}
        onCancel={() => { setFormModal(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText="Tạo"
        cancelText="Hủy"
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ type: 'PERCENTAGE' }}
        >
          <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true, message: 'Nhập mã' }]}>
            <Input placeholder="SUMMER2025" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select>
              <Option value="PERCENTAGE">Phần trăm (%)</Option>
              <Option value="FIXED">Số tiền cố định (₫)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="value" label="Giá trị" rules={[{ required: true, message: 'Nhập giá trị' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="minOrderValue" label="Đơn hàng tối thiểu (₫)">
            <InputNumber style={{ width: '100%' }} min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'PERCENTAGE' ? (
                <Form.Item name="maxDiscount" label="Giảm tối đa (₫)">
                  <InputNumber style={{ width: '100%' }} min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item name="usageLimit" label="Giới hạn sử dụng (để trống = không giới hạn)">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="dateRange" label="Thời hạn hiệu lực">
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
