import { Layout, Menu } from 'antd'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import styles from './ProfileLayout.module.css'
import logo from '../assets/logo.svg'

const { Sider, Content } = Layout

function ProfileLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/profile',          label: 'My profile' },
    { key: '/profile/settings', label: 'Account settings' },
    { key: '/',                 label: 'Back to admin panel' },
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

export default ProfileLayout