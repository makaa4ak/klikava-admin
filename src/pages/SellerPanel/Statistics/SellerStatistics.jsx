import { useEffect, useState } from 'react'
import { Spin, message } from 'antd'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import styles from './SellerStatistics.module.css'
import api from '../../../api/axios'

function groupByMonth(orders) {
  const map = {}
  orders.forEach(o => {
    if (!o.created_at) return
    const d   = new Date(o.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map[key]) map[key] = { month: key, revenue: 0, orders: 0 }
    map[key].revenue += o.total_price ?? o.total ?? 0
    map[key].orders  += 1
  })
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
}

function SellerStatistics() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const user     = JSON.parse(localStorage.getItem('user') || '{}')
    const sellerId = user?.seller_id || user?.id

    api.get('/orders', { params: { seller_id: sellerId, per_page: 1000 } })
      .then(res => setChartData(groupByMonth(res.data?.data?.items ?? [])))
      .catch(() => message.error('Failed to load statistics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className={styles.center}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Statistics</h2>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Monthly revenue & orders</p>

        {chartData.length === 0 ? (
          <div className={styles.empty}>No orders yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 13 }} />
              <YAxis yAxisId="left"  orientation="left"  tick={{ fontSize: 13 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 13 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left"  dataKey="revenue" name="Revenue (₴)" fill="#1c1c1c" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="orders"  name="Orders"      fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default SellerStatistics