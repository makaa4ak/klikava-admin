import { Table, Input, Button, Popconfirm, message } from 'antd'
import { SearchOutlined, EditOutlined, CloseOutlined, ControlOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SellerProducts.module.css'
import api from '../../../api/axios'

function SellerProducts() {
  const navigate = useNavigate()
  const [data, setData]             = useState([])
  const [search, setSearch]         = useState('')
  const [selectedKeys, setSelectedKeys] = useState([])
  const [loading, setLoading]       = useState(false)
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const pageSize = 10

  const user     = JSON.parse(localStorage.getItem('user') || '{}')
  const sellerId = user?.seller_id || user?.id

  const fetchProducts = async (p = 1, q = search) => {
    setLoading(true)
    try {
      const res = await api.get('/products', {
        params: { seller_id: sellerId, page: p, per_page: pageSize, q: q || undefined },
      })
      setData(res.data?.data?.items ?? [])
      setTotal(res.data?.meta?.pagination?.total_items ?? 0)
      setPage(p)
    } catch {
      message.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, []) // eslint-disable-line

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      message.success('Product deleted')
      fetchProducts(page)
    } catch {
      message.error('Failed to delete')
    }
  }

  const handleTrashSelected = async () => {
    try {
      await Promise.all(selectedKeys.map(id => api.delete(`/products/${id}`)))
      message.success(`Deleted ${selectedKeys.length} products`)
      setSelectedKeys([])
      fetchProducts(1)
    } catch {
      message.error('Failed to delete selected')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const columns = [
    { title: 'Name',       dataIndex: 'name' },
    { title: 'SKU',        dataIndex: 'sku',   render: v => v || '—' },
    {
      title: 'Stock',
      dataIndex: 'stock',
      render: v => (
        <span style={{ color: v === 0 || v === 'out of stock' ? '#ff4d4f' : '#333' }}>
          {v === 0 ? 'out of stock' : v != null ? `${v}` : '—'}
        </span>
      ),
    },
    { title: 'Price',      dataIndex: 'price',  render: v => v != null ? `${v} ₴` : '—' },
    { title: 'Categories', dataIndex: 'category', render: v => v?.name || v || '—' },
    {
      title: 'Active',
      dataIndex: 'is_active',
      render: v => <span style={{ color: v ? '#52c41a' : '#ff4d4f' }}>{v ? 'Yes' : 'No'}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      render: v => v ? new Date(v).toLocaleDateString('uk-UA') : '—',
    },
    {
      title: '',
      width: 80,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <EditOutlined
            style={{ color: '#555', cursor: 'pointer' }}
            onClick={() => navigate(`/seller/products/${record.id}/edit`)}
          />
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <CloseOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} />
          </Popconfirm>
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
            onChange={e => {
              setSearch(e.target.value)
              fetchProducts(1, e.target.value)
            }}
          />
          <Button icon={<ControlOutlined />} className={styles.filterIcon} />
        </div>
        <Button className={styles.addBtn} onClick={() => navigate('/seller/products/add')}>
          Add New
        </Button>
      </div>

      <Table
        rowKey="id"
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={false}
        className={styles.table}
      />

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <Button
            className={styles.trashBtn}
            disabled={selectedKeys.length === 0}
            onClick={handleTrashSelected}
          >
            Trash Selected
          </Button>
        </div>
        <div className={styles.footerRight}>
          <span>Rows per page</span>
          <select className={styles.select} defaultValue="10" readOnly><option>10</option></select>
          <span>
            {total === 0 ? '0' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)}`} of {total}
          </span>
          <button className={styles.pageBtn} onClick={() => fetchProducts(1)}              disabled={page === 1}>{'|<'}</button>
          <button className={styles.pageBtn} onClick={() => fetchProducts(page - 1)}       disabled={page === 1}>{'<'}</button>
          <button className={styles.pageBtn} onClick={() => fetchProducts(page + 1)}       disabled={page >= totalPages}>{'>'}</button>
          <button className={styles.pageBtn} onClick={() => fetchProducts(totalPages)}     disabled={page >= totalPages}>{'>|'}</button>
        </div>
      </div>
    </div>
  )
}

export default SellerProducts