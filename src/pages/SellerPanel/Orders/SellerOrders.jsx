import { Table, Input, Select, Tag } from 'antd'
import { SearchOutlined, ControlOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'
import styles from './SellerOrders.module.css'

const MOCK_DATA = [
  { id: 1001, customer: 'John Doe',    total: 1200, status: 'delivered',  date: '2026-05-01' },
  { id: 1002, customer: 'Anna Smith',  total: 450,  status: 'pending',    date: '2026-05-14' },
  { id: 1003, customer: 'Ivan Petrov', total: 890,  status: 'shipped',    date: '2026-05-20' },
  { id: 1004, customer: 'Maria Chen',  total: 3200, status: 'processing', date: '2026-06-01' },
  { id: 1005, customer: 'Alex Brown',  total: 670,  status: 'cancelled',  date: '2026-06-05' },
]

const STATUS_COLORS = {
  pending:    'orange',
  processing: 'blue',
  shipped:    'geekblue',
  delivered:  'green',
  cancelled:  'red',
}

function SellerOrders() {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState(undefined)

  const filtered = MOCK_DATA.filter(o => {
    const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const columns = [
    { title: 'Order #',  dataIndex: 'id',       width: 100 },
    { title: 'Customer', dataIndex: 'customer' },
    { title: 'Total',    dataIndex: 'total', render: v => `${v} ₴` },
    {
      title: 'Status',
      dataIndex: 'status',
      render: s => <Tag color={STATUS_COLORS[s] ?? 'default'}>{s}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: v => new Date(v).toLocaleDateString('uk-UA'),
    },
  ]

  return (
    <div className={styles.wrapper}>
      <div className={styles.banner}>
        <ClockCircleOutlined className={styles.bannerIcon} />
        <div>
          <div className={styles.bannerTitle}>Orders coming soon</div>
          <div className={styles.bannerText}>Live order management will be available once the API is ready. Below is a preview.</div>
        </div>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.topBar}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            className={styles.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <ControlOutlined style={{ color: '#aaa' }} />
        </div>
        <Select
          allowClear
          placeholder="Status"
          style={{ width: 140, height: 44 }}
          onChange={setStatus}
          options={[
            { value: 'pending',    label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped',    label: 'Shipped' },
            { value: 'delivered',  label: 'Delivered' },
            { value: 'cancelled',  label: 'Cancelled' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        pagination={false}
        className={styles.table}
      />

      <div className={styles.footer}>
        <span>{filtered.length} of {MOCK_DATA.length} orders</span>
      </div>
    </div>
  )
}

export default SellerOrders