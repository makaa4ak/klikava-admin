import { Layout, Menu } from 'antd'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import styles from './SellerProfileLayout.module.css'
import logo from '../assets/logo.svg'

const { Sider, Content } = Layout

function SellerProfileLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const profileKeys = ['/seller/profile', '/seller/profile/settings']

  const menuItems = [
    {
      key: '/seller/products',
      icon: <ArrowLeftOutlined />,
      label: 'Back to panel',
    },
    { type: 'divider' },
    { key: '/seller/profile',          label: 'My profile' },
    { key: '/seller/profile/settings', label: 'Account settings' },
    { type: 'divider' },
    { key: '/seller/statistics',       label: 'Statistics' },
    { key: '/seller/dashboard',        label: 'Dashboard' },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} className={styles.sider}>
        <div className={styles.logo}>
          <img src={logo} alt="KLIKAVA" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={profileKeys.includes(location.pathname) ? [location.pathname] : []}
          onClick={({ key }) => navigate(key)}
          className={styles.menu}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default SellerProfileLayout