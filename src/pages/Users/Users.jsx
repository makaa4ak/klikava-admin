import { Table, Input, Button, Modal, Select, message } from 'antd'
import { SearchOutlined, EditOutlined, CloseOutlined, ControlOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import styles from './Users.module.css'
import api from '../../api/axios'

function Users() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterRole, setFilterRole] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [editRoles, setEditRoles] = useState([])
  const [addOpen, setAddOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', phone_number: '', login: ''
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users?per_page=100&page=1')
      const items = res.data.data.items
      setData(items
        .filter(u => !(u.roles || []).some(r => r.name === 'ADMIN' || r.name === 'MODERATOR'))
        .map(u => ({
          ...u,
          key: u.id,
          rolesStr: (u.roles || []).map(r => r.name).join(', ')
        })))
    } catch (err) {
      message.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const filteredData = data.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.rolesStr || '').toLowerCase().includes(q) ||
      (u.phone_number || '').toLowerCase().includes(q)
    )
    const matchRole = filterRole
      ? (u.roles || []).some(r => r.name === filterRole)
      : true
    return matchSearch && matchRole
  })

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize)

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/users/${id}`)
      message.success('User deleted')
      fetchUsers()
    } catch (err) {
      message.error('Failed to delete')
    }
  }

  const handleTrashSelected = async () => {
    if (!selectedKeys.length) return message.warning('No users selected')
    if (!window.confirm(`Delete ${selectedKeys.length} selected users?`)) return
    try {
      await Promise.all(selectedKeys.map(id => api.delete(`/users/${id}`)))
      message.success(`Deleted ${selectedKeys.length} users`)
      setSelectedKeys([])
      fetchUsers()
    } catch (err) {
      message.error('Failed to delete selected users')
    }
  }

  const handleEditOpen = (record) => {
    setEditUser(record)
    setEditRoles((record.roles || []).map(r => r.name))
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    try {
      await api.patch(`/users/${editUser.id}`, { roles: editRoles })
      message.success('User updated')
      setEditOpen(false)
      fetchUsers()
    } catch (err) {
      message.error('Failed to update')
    }
  }

  const handleAddSave = async () => {
    if (!newUser.email || !newUser.password || !newUser.login) {
      message.error('Email, login and password are required')
      return
    }
    try {
      await api.post('/users/register', {
        login: newUser.login,
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        phone_number: newUser.phone_number,
      })
      message.success('User created!')
      setAddOpen(false)
      setNewUser({ name: '', email: '', password: '', phone_number: '', login: '' })
      fetchUsers()
    } catch (err) {
      message.error(err.response?.data?.detail || 'Failed to create user')
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
          <EditOutlined style={{ color: '#555', cursor: 'pointer' }} onClick={() => handleEditOpen(record)} />
          <CloseOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} onClick={() => handleDelete(record.id)} />
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
          <Button
            className={styles.trashBtn}
            onClick={handleTrashSelected}
            disabled={!selectedKeys.length}
          >
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

      {/* Filter */}
      <Modal open={filterOpen} onCancel={() => setFilterOpen(false)} footer={null} title="Filter" width={280} centered>
        <div className={styles.filterModal}>
          <p className={styles.filterLabel}>Role</p>
          {['SELLER', 'BUYER'].map(role => (
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

      {/* Edit */}
      <Modal open={editOpen} onCancel={() => setEditOpen(false)} footer={null} title="Edit user" width={280} centered>
        <div className={styles.filterModal}>
          <p className={styles.filterLabel}>Role</p>
          {['SELLER', 'BUYER'].map(role => (
            <div
              key={role}
              className={`${styles.filterOption} ${editRoles.includes(role) ? styles.filterOptionActive : ''}`}
              onClick={() => {
                setEditRoles(prev =>
                  prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                )
              }}
            >
              {role}
              {editRoles.includes(role) && <span className={styles.check}>✓</span>}
            </div>
          ))}
          <Button className={styles.selectBtn} onClick={handleEditSave}>Save</Button>
        </div>
      </Modal>

      {/* Add New User */}
      <Modal open={addOpen} onCancel={() => setAddOpen(false)} footer={null} title="Add New User" width={320} centered>
        <div className={styles.filterModal}>
          <p className={styles.filterLabel}>Name</p>
          <Input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
          <p className={styles.filterLabel}>Login</p>
          <Input value={newUser.login} onChange={e => setNewUser(p => ({ ...p, login: e.target.value }))} />
          <p className={styles.filterLabel}>Email</p>
          <Input value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
          <p className={styles.filterLabel}>Password</p>
          <Input.Password value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
          <p className={styles.filterLabel}>Phone</p>
          <Input value={newUser.phone_number} onChange={e => setNewUser(p => ({ ...p, phone_number: e.target.value }))} />
          <Button className={styles.selectBtn} onClick={handleAddSave}>Create</Button>
        </div>
      </Modal>
    </div>
  )
}

export default Users