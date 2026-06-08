import { useState } from 'react';
import {
  Table, Card, Input, Select, Button, Tag, Space, Modal, Typography, message,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { usersService } from '../services/users';
import type { User, UserRole } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const ROLE_COLOR: Record<string, string> = {
  USER: 'default',
  ADMIN: 'blue',
  SUPER_ADMIN: 'gold',
};

const ROLE_LABEL: Record<string, string> = {
  USER: 'Người dùng',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export default function Users() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [roleModal, setRoleModal] = useState<{ open: boolean; user?: User }>({ open: false });
  const [newRole, setNewRole] = useState<UserRole>('USER');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => usersService.list({ page, limit: 20, search, role: roleFilter }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersService.updateRole(id, role),
    onSuccess: () => {
      message.success('Đã cập nhật vai trò');
      setRoleModal({ open: false });
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => message.error('Có lỗi xảy ra'),
  });

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (v: string) => v ?? '-',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (r: string) => <Tag color={ROLE_COLOR[r]}>{ROLE_LABEL[r] ?? r}</Tag>,
    },
    {
      title: 'Đơn hàng',
      key: 'orders',
      width: 90,
      render: (_: unknown, r: User) => r._count?.orders ?? '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 130,
      render: (_: unknown, r: User) => (
        <Button
          size="small"
          onClick={() => {
            setRoleModal({ open: true, user: r });
            setNewRole(r.role);
          }}
        >
          Đổi vai trò
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={4}>Quản lý người dùng</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Xem và phân quyền tài khoản người dùng</Text>
      </div>
      <Card bordered={false}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm tên, email..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={() => { setSearch(searchInput); setPage(1); }}
            style={{ width: 240 }}
          />
          <Select
            placeholder="Vai trò"
            allowClear
            style={{ width: 140 }}
            value={roleFilter}
            onChange={(v) => { setRoleFilter(v); setPage(1); }}
          >
            <Option value="USER">Người dùng</Option>
            <Option value="ADMIN">Admin</Option>
            <Option value="SUPER_ADMIN">Super Admin</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
        </Space>

        <Table<User>
          dataSource={data?.data}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.meta.total,
            showTotal: (t) => `Tổng ${t} người dùng`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      {/* Role Update Modal */}
      <Modal
        title="Đổi vai trò người dùng"
        open={roleModal.open}
        onCancel={() => setRoleModal({ open: false })}
        onOk={() => {
          if (!roleModal.user) return;
          updateRoleMutation.mutate({ id: roleModal.user.id, role: newRole });
        }}
        confirmLoading={updateRoleMutation.isPending}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Người dùng: <Text strong>{roleModal.user?.fullName}</Text></Text>
          <Text>Email: {roleModal.user?.email}</Text>
          <Select value={newRole} onChange={setNewRole} style={{ width: '100%' }}>
            <Option value="USER">Người dùng</Option>
            <Option value="ADMIN">Admin</Option>
            <Option value="SUPER_ADMIN">Super Admin</Option>
          </Select>
        </Space>
      </Modal>
    </div>
  );
}
