import { Table, Input, Button, Modal, message } from 'antd'
import { SearchOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import styles from './Categories.module.css'
import api from '../../api/axios'

function Categories() {
  const [allData, setAllData] = useState([])       // всі категорії (для пошуку)
  const [data, setData] = useState([])             // поточна сторінка
  const [loading, setLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  // Завантажуємо ВСІ категорії одразу (API max per_page=100, категорій зазвичай небагато)
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get('/categories?per_page=100&page=1')
      const items = res.data.data?.items || []
      setAllData(items.map(c => ({ ...c, key: c.id })))
    } catch (err) {
      message.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Фільтрація + пагінація на фронті
  useEffect(() => {
    const filtered = allData.filter(c =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    )
    setTotalItems(filtered.length)
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)))
    const start = (page - 1) * pageSize
    setData(filtered.slice(start, start + pageSize))
  }, [allData, search, page, pageSize])

  // Скидаємо на першу сторінку при зміні пошуку
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  // ADD
  const handleAdd = async () => {
    if (!newTitle.trim()) return message.warning('Enter category name')
    try {
      setSaving(true)
      await api.post('/categories', {
        title: newTitle.trim(),
        description: newDescription.trim() || null,
      })
      message.success('Category created')
      setAddOpen(false)
      setNewTitle('')
      setNewDescription('')
      fetchCategories()
    } catch (err) {
      message.error('Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  // EDIT OPEN
  const handleEditOpen = (record) => {
    setEditItem(record)
    setEditTitle(record.title || '')
    setEditDescription(record.description || '')
    setEditOpen(true)
  }

  // EDIT SAVE
  const handleEdit = async () => {
    if (!editTitle.trim()) return message.warning('Enter category name')
    try {
      setSaving(true)
      await api.patch(`/categories/${editItem.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      })
      message.success('Category updated')
      setEditOpen(false)
      fetchCategories()
    } catch (err) {
      message.error('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  // DELETE ONE
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      message.success('Category deleted')
      fetchCategories()
    } catch (err) {
      message.error('Failed to delete category')
    }
  }

  // DELETE SELECTED
  const handleDeleteSelected = async () => {
    if (!selectedKeys.length) return
    if (!window.confirm(`Delete ${selectedKeys.length} selected categories?`)) return
    try {
      await Promise.all(selectedKeys.map(id => api.delete(`/categories/${id}`)))
      message.success('Deleted')
      setSelectedKeys([])
      fetchCategories()
    } catch (err) {
      message.error('Failed to delete selected')
    }
  }

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (keys) => setSelectedKeys(keys),
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: v => v || '-',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: v => v || '-',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      render: v => v ? new Date(v).toLocaleDateString('uk-UA') : '-',
    },
    {
      title: '',
      width: 70,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <EditOutlined
            style={{ color: '#555', cursor: 'pointer' }}
            onClick={() => handleEditOpen(record)}
          />
          <CloseOutlined
            style={{ color: '#ff4d4f', cursor: 'pointer' }}
            onClick={() => handleDelete(record.id)}
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
            onChange={handleSearchChange}
          />
        </div>
        <Button className={styles.addBtn} onClick={() => setAddOpen(true)}>
          Add New
        </Button>
      </div>

      <Table
        rowSelection={rowSelection}
        dataSource={data}
        columns={columns}
        pagination={false}
        loading={loading}
        className={styles.table}
      />

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <Button
            className={styles.trashBtn}
            onClick={handleDeleteSelected}
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
            {totalItems === 0 ? '0' : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
          </span>
          <button className={styles.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>{'|<'}</button>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{'<'}</button>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{'>'}</button>
          <button className={styles.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}>{'>|'}</button>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        open={addOpen}
        onCancel={() => { setAddOpen(false); setNewTitle(''); setNewDescription('') }}
        footer={null}
        title="New category"
        width={320}
        centered
      >
        <div className={styles.modalBody}>
          <p className={styles.modalLabel}>Category name</p>
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className={styles.modalInput}
            placeholder="Enter name..."
          />
          <p className={styles.modalLabel}>Description</p>
          <Input
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            className={styles.modalInput}
            placeholder="Optional..."
          />
          <Button className={styles.modalBtn} onClick={handleAdd} loading={saving}>
            Add
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        title="Edit category"
        width={320}
        centered
      >
        <div className={styles.modalBody}>
          <p className={styles.modalLabel}>Category name</p>
          <Input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className={styles.modalInput}
            placeholder="Enter name..."
          />
          <p className={styles.modalLabel}>Description</p>
          <Input
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            className={styles.modalInput}
            placeholder="Optional..."
          />
          <Button className={styles.modalBtn} onClick={handleEdit} loading={saving}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Categories