import { useEffect, useState } from 'react'
import { Spin, message } from 'antd'
import styles from './SellerDashboard.module.css'
import api from '../../../api/axios'

function SellerDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const sellerId = user?.seller_id || user?.id

    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products', { params: { seller_id: sellerId, per_page: 1 } }),
          api.get('/orders',   { params: { seller_id: sellerId, per_page: 1000 } }),
        ])

        const totalProducts = productsRes.data?.meta?.pagination?.total_items ?? 0
        const orders        = ordersRes.data?.data?.items ?? []
        const totalOrders   = ordersRes.data?.meta?.pagination?.total_items ?? orders.length
        const revenue       = orders.reduce((sum, o) => sum + (o.total_price ?? o.total ?? 0), 0)

        setStats({ products: totalProducts, orders: totalOrders, revenue })
      } catch {
        message.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
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
      <h2 className={styles.title}>Dashboard</h2>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Products</h3>
          <div className={styles.number}>{stats.products}</div>
        </div>

        <div className={styles.card}>
          <h3>Orders</h3>
          <div className={styles.number}>{stats.orders}</div>
        </div>

        <div className={styles.card}>
          <h3>Revenue</h3>
          <div className={styles.number}>
            {stats.revenue.toLocaleString('uk-UA', { minimumFractionDigits: 0 })} ₴
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard