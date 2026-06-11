import { Table, Input, Button, Modal, Select, message } from 'antd'
import { SearchOutlined, CloseOutlined, ControlOutlined } from '@ant-design/icons'
import { useState, useEffect, useRef } from 'react'
import styles from './Products.module.css'
import api from '../../api/axios'

function Products() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [filterCategory, setFilterCategory] = useState(null)
  const [filterStock, setFilterStock] = useState(null)
  const [filterSort, setFilterSort] = useState('created_at')
  const [filterSortDir, setFilterSortDir] = useState('desc')

  // Передаємо всі параметри явно щоб уникнути closure-проблем
  const debounceRef = useRef(null)

  const fetchProducts = async ({
    currentPage = 1,
    currentPageSize = 10,
    currentSearch = '',
    currentCategory = null,
    currentSort = 'created_at',
    currentSortDir = 'desc',
  } = {}) => {
    try {
      setLoading(true)
      let url = `/products?per_page=${currentPageSize}&page=${currentPage}&sort_by=${currentSort}&sort_dir=${currentSortDir}`
      if (currentCategory) url += `&category_id=${currentCategory}`
      if (currentSearch) url += `&q=${encodeURIComponent(currentSearch)}`
      const res = await api.get(url)
      const items = res.data.data.items
      setData(items.map(p => ({
        ...p,
        key: p.id,
        name: p.current_version?.title || '-',
        sku: p.current_version?.variants?.[0]?.sku_code || '-',
        price: p.current_version?.variants?.[0]?.final_price || '-',
        stock: p.current_version?.variants?.[0]?.stock > 0 ? 'in stock' : 'out of stock',
        category: p.current_version?.category?.title || '-',
      })))
      setTotalPages(res.data.meta.pagination.total_pages)
      setTotalItems(res.data.meta.pagination.total_items)
    } catch (err) {
      message.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?per_page=100')
      const items = res.data.data?.items || []
      setCategories(items.map(c => ({ value: c.id, label: c.title })))
    } catch (err) {}
  }

  useEffect(() => {
    fetchProducts({
      currentPage: page,
      currentPageSize: pageSize,
      currentSearch: search,
      currentCategory: filterCategory,
      currentSort: filterSort,
      currentSortDir: filterSortDir,
    })
  }, [page, pageSize])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSearchSubmit = () => {
    setPage(1)
    fetchProducts({
      currentPage: 1,
      currentPageSize: pageSize,
      currentSearch: search,
      currentCategory: filterCategory,
      currentSort: filterSort,
      currentSortDir: filterSortDir,
    })
  }

  const handleApplyFilter = () => {
    setPage(1)
    fetchProducts({
      currentPage: 1,
      currentPageSize: pageSize,
      currentSearch: search,
      currentCategory: filterCategory,
      currentSort: filterSort,
      currentSortDir: filterSortDir,
    })
    setFilterOpen(false)
  }

  const handleResetFilter = () => {
    setFilterCategory(null)
    setFilterStock(null)
    setFilterSort('created_at')
    setFilterSortDir('desc')
    setPage(1)
    fetchProducts({
      currentPage: 1,
      currentPageSize: pageSize,
      currentSearch: search,
      currentCategory: null,
      currentSort: 'created_at',
      currentSortDir: 'desc',
    })
    setFilterOpen(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      message.success('Product deleted')
      fetchProducts({
        currentPage: page,
        currentPageSize: pageSize,
        currentSearch: search,
        currentCategory: filterCategory,
        currentSort: filterSort,
        currentSortDir: filterSortDir,
      })
    } catch (err) {
      message.error('Failed to delete')
    }
  }

  const [showOnlySelected, setShowOnlySelected] = useState(false)

  const handleTrashSelected = async () => {
    if (!selectedKeys.length) return message.warning('No products selected')
    if (!window.confirm(`Delete ${selectedKeys.length} selected products?`)) return
    try {
      await Promise.all(selectedKeys.map(id => api.delete(`/products/${id}`)))
      message.success(`Deleted ${selectedKeys.length} products`)
      setSelectedKeys([])
      setShowOnlySelected(false)
      fetchProducts({
        currentPage: page,
        currentPageSize: pageSize,
        currentSearch: search,
        currentCategory: filterCategory,
        currentSort: filterSort,
        currentSortDir: filterSortDir,
      })
    } catch (err) {
      message.error('Failed to delete selected products')
    }
  }

  const handleFilterSelected = () => {
    if (!selectedKeys.length) return message.warning('No products selected')
    setShowOnlySelected(prev => !prev)
  }

  const filteredData = (() => {
    let result = data
    if (filterStock) result = result.filter(p => p.stock === filterStock)
    if (showOnlySelected) result = result.filter(p => selectedKeys.includes(p.key))
    return result
  })()

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (keys) => setSelectedKeys(keys),
  }

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'SKU', dataIndex: 'sku' },
    {
      title: 'Stock', dataIndex: 'stock',
      render: v => <span style={{ color: v === 'out of stock' ? '#ff4d4f' : '#333' }}>{v}</span>
    },
    { title: 'Price', dataIndex: 'price', render: v => v ? `${v}$` : '-' },
    { title: 'Category', dataIndex: 'category' },
    { title: 'Status', dataIndex: 'status' },
    {
      title: 'Date', dataIndex: 'created_at',
      render: v => new Date(v).toLocaleDateString('uk-UA')
    },
    {
      title: '',
      width: 40,
      render: (_, record) => (
        <CloseOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} onClick={() => handleDelete(record.id)} />
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
              const val = e.target.value
              setSearch(val)
              setPage(1)
              clearTimeout(debounceRef.current)
              debounceRef.current = setTimeout(() => {
                fetchProducts({
                  currentPage: 1,
                  currentPageSize: pageSize,
                  currentSearch: val,
                  currentCategory: filterCategory,
                  currentSort: filterSort,
                  currentSortDir: filterSortDir,
                })
              }, 400)
            }}
            allowClear
            onClear={() => {
              setSearch('')
              setPage(1)
              fetchProducts({
                currentPage: 1,
                currentPageSize: pageSize,
                currentSearch: '',
                currentCategory: filterCategory,
                currentSort: filterSort,
                currentSortDir: filterSortDir,
              })
            }}
          />
          <Button icon={<ControlOutlined />} className={styles.filterIcon} onClick={() => setFilterOpen(true)} />
        </div>
      </div>

      <Table
        rowSelection={rowSelection}
        dataSource={filteredData}
        columns={columns}
        pagination={false}
        loading={loading}
        className={styles.table}
      />

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <Button className={styles.trashBtn} onClick={handleTrashSelected} disabled={!selectedKeys.length}>Trash selected</Button>
          <Button className={styles.filterBtn} onClick={handleFilterSelected} disabled={!selectedKeys.length}>{showOnlySelected ? 'Show all' : 'Filter selected'}</Button>
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
          <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}</span>
          <button className={styles.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>{'|<'}</button>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{'<'}</button>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{'>'}</button>
          <button className={styles.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}>{'>|'}</button>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal open={filterOpen} onCancel={() => setFilterOpen(false)} footer={null} title="Filter" width={320} centered>
        <div className={styles.filterModal}>
          <div className={styles.filterRow}>
            <div className={styles.filterCol}>
              <p className={styles.filterLabel}>Stock</p>
              <Select
                placeholder="Select"
                style={{ width: '100%' }}
                value={filterStock}
                onChange={v => setFilterStock(v)}
                allowClear
                options={[
                  { value: 'in stock', label: 'In stock' },
                  { value: 'out of stock', label: 'Out of stock' }
                ]}
              />
            </div>
            <div className={styles.filterCol}>
              <p className={styles.filterLabel}>Category</p>
              <Select
                placeholder="Select"
                style={{ width: '100%' }}
                value={filterCategory}
                onChange={v => setFilterCategory(v)}
                allowClear
                options={categories}
              />
            </div>
          </div>
          <div className={styles.filterRow}>
            <div className={styles.filterCol}>
              <p className={styles.filterLabel}>Sort by</p>
              <Select
                style={{ width: '100%' }}
                value={filterSort}
                onChange={v => setFilterSort(v)}
                options={[
                  { value: 'created_at', label: 'Date' },
                  { value: 'price', label: 'Price' },
                  { value: 'popularity', label: 'Popularity' },
                  { value: 'rating', label: 'Rating' },
                ]}
              />
            </div>
            <div className={styles.filterCol}>
              <p className={styles.filterLabel}>Direction</p>
              <Select
                style={{ width: '100%' }}
                value={filterSortDir}
                onChange={v => setFilterSortDir(v)}
                options={[
                  { value: 'desc', label: 'Descending' },
                  { value: 'asc', label: 'Ascending' },
                ]}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button style={{ flex: 1 }} onClick={handleResetFilter}>Reset</Button>
            <Button className={styles.selectBtn} style={{ flex: 1, marginTop: 0 }} onClick={handleApplyFilter}>Apply</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Products