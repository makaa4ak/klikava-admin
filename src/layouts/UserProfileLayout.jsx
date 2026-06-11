import { Layout, Menu } from 'antd'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import styles from './UserProfileLayout.module.css'
import logo from '../assets/logo.svg'

const { Sider, Content } = Layout

function UserProfileLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/user/profile',          label: 'My profile' },
    { key: '/user/profile/settings', label: 'Account settings' },
    { key: '/user/statistics',       label: 'Statistics' },
    { key: '/user/dashboard',        label: 'Dashboard' },
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
          selectedKeys={[location.pathname]}
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

export default UserProfileLayout