import { Table, Input, Button, Modal, Select, message } from 'antd'
import { SearchOutlined, EditOutlined, CloseOutlined, ControlOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import styles from './Admins.module.css'
import api from '../../api/axios'

const ROLE_IDS = { ADMIN: 1, MODERATOR: 2, SELLER: 3, BUYER: 4 }

function Admins() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editAdmin, setEditAdmin] = useState(null)
  const [editRole, setEditRole] = useState('ADMIN')
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('ADMIN')
  const [saving, setSaving] = useState(false)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users?per_page=100&page=1')
      const items = res.data.data.items
      const admins = items
        .filter(u => (u.roles || []).some(r => r.name === 'ADMIN' || r.name === 'MODERATOR'))
        .map(u => ({
          ...u,
          key: u.id,
          rolesStr: (u.roles || []).map(r => r.name).join(', ')
        }))
      setData(admins)
    } catch {
      message.error('Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?per_page=100&page=1')
      const items = res.data.data.items
      const nonAdmins = items.filter(u =>
        !(u.roles || []).some(r => r.name === 'ADMIN' || r.name === 'MODERATOR')
      )
      setUsers(nonAdmins.map(u => ({ value: u.id, label: `${u.name || ''} (${u.email})`, login: u.login })))
    } catch {}
  }

  useEffect(() => {
    fetchAdmins()
    fetchUsers()
  }, [])

  const filteredData = data.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = (
      (a.name || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.rolesStr || '').toLowerCase().includes(q)
    )
    const matchRole = filterRole
      ? (a.roles || []).some(r => r.name === filterRole)
      : true
    return matchSearch && matchRole
  })

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize)

  const handleDelete = async (record) => {
    if (!window.confirm('Remove admin role? User will become a Buyer.')) return
    try {
      await api.patch(`/users/${record.id}/role`, {
        login: record.login,
        role_id: ROLE_IDS.BUYER
      })
      message.success('Admin removed')
      fetchAdmins()
      fetchUsers()
    } catch {
      message.error('Failed to remove admin')
    }
  }

  const handleTrashSelected = async () => {
    if (!selectedKeys.length) return message.warning('No admins selected')
    if (!window.confirm(`Remove admin role from ${selectedKeys.length} users?`)) return
    try {
      const selected = data.filter(u => selectedKeys.includes(u.id))
      await Promise.all(selected.map(u =>
        api.patch(`/users/${u.id}/role`, { login: u.login, role_id: ROLE_IDS.BUYER })
      ))
      message.success('Admins removed')
      setSelectedKeys([])
      fetchAdmins()
      fetchUsers()
    } catch {
      message.error('Failed to remove selected')
    }
  }

  const handleAddSave = async () => {
    if (!selectedUser) return message.warning('Select a user')
    const user = users.find(u => u.value === selectedUser)
    if (!user) return
    setSaving(true)
    try {
      await api.patch(`/users/${selectedUser}/role`, {
        login: user.login,
        role_id: ROLE_IDS[newRole]
      })
      message.success('Admin added')
      setAddOpen(false)
      setSelectedUser(null)
      setNewRole('ADMIN')
      fetchAdmins()
      fetchUsers()
    } catch {
      message.error('Failed to add admin')
    } finally {
      setSaving(false)
    }
  }

  const handleEditSave = async () => {
    if (!editAdmin) return
    setSaving(true)
    try {
      await api.patch(`/users/${editAdmin.id}/role`, {
        login: editAdmin.login,
        role_id: ROLE_IDS[editRole]
      })
      message.success('Role updated')
      setEditOpen(false)
      setEditAdmin(null)
      fetchAdmins()
    } catch {
      message.error('Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (keys) => setSelectedKeys(keys),
  }

  const columns = [
    { title: 'Name', dataIndex: 'name', render: v => v || '-' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone_number', render: v => v || '-' },
    { title: 'Roles', dataIndex: 'rolesStr' },
    {
      title: '',
      width: 80,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <EditOutlined
            style={{ color: '#555', cursor: 'pointer' }}
            onClick={() => {
              setEditAdmin(record)
              setEditRole((record.roles || [])[0]?.name || 'ADMIN')
              setEditOpen(true)
            }}
          />
          <CloseOutlined
            style={{ color: '#ff4d4f', cursor: 'pointer' }}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <div className={styles.topBar}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            className={styles.search}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          <Button icon={<ControlOutlined />} className={styles.filterIcon} onClick={() => setFilterOpen(true)} />
        </div>
        <Button className={styles.addBtn} onClick={() => setAddOpen(true)}>Add New</Button>
      </div>

      <Table
        rowSelection={rowSelection}
        dataSource={pagedData}
        columns={columns}
        pagination={false}
        loading={loading}
        className={styles.table}
      />

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <Button className={styles.trashBtn} disabled={!selectedKeys.length} onClick={handleTrashSelected}>
            Trash selected
          </Button>
        </div>
        <div className={styles.footerRight}>
          <span>Rows per page</span>
          <select
            className={styles.select}
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>
            {filteredData.length === 0 ? '0' : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredData.length)} of {filteredData.length}
          </span>
          <button className={styles.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>{'|<'}</button>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{'<'}</button>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{'>'}</button>
          <button className={styles.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}>{'>|'}</button>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal open={filterOpen} onCancel={() => setFilterOpen(false)} footer={null} title="Filter" width={280} centered>
        <div className={styles.filterModal}>
          <p className={styles.filterLabel}>Role</p>
          {['ADMIN', 'MODERATOR'].map(role => (
            <div
              key={role}
              className={`${styles.filterOption} ${filterRole === role ? styles.filterOptionActive : ''}`}
              onClick={() => setFilterRole(prev => prev === role ? '' : role)}
            >
              {role}
              {filterRole === role && <span className={styles.check}>✓</span>}
            </div>
          ))}
          <Button className={styles.selectBtn} onClick={() => setFilterOpen(false)}>Apply</Button>
        </div>
      </Modal>

      {/* Add New Admin Modal */}
      <Modal open={addOpen} onCancel={() => setAddOpen(false)} footer={null} title="Add admin" width={320} centered>
        <div className={styles.filterModal}>
          <p className={styles.filterLabel}>Select user</p>
          <Select
            placeholder="Select user..."
            style={{ width: '100%' }}
            options={users}
            value={selectedUser}
            onChange={setSelectedUser}
            showSearch
            filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
          />
          <p className={styles.filterLabel}>Assign role</p>
          <Select
            value={newRole}
            onChange={setNewRole}
            style={{ width: '100%' }}
            options={[
              { value: 'ADMIN', label: 'Admin' },
              { value: 'MODERATOR', label: 'Moderator' },
            ]}
          />
          <Button className={styles.selectBtn} onClick={handleAddSave} loading={saving}>Add</Button>
        </div>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal open={editOpen} onCancel={() => setEditOpen(false)} footer={null} title="Edit role" width={280} centered>
        <div className={styles.filterModal}>
          <p className={styles.filterLabel}>Role</p>
          <Select
            value={editRole}
            onChange={setEditRole}
            style={{ width: '100%' }}
            options={[
              { value: 'ADMIN', label: 'Admin' },
              { value: 'MODERATOR', label: 'Moderator' },
            ]}
          />
          <Button className={styles.selectBtn} onClick={handleEditSave} loading={saving}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}

export default Admins