import { Layout, Menu } from 'antd'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import {
  AppstoreOutlined,
  PlusOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import styles from './UserLayout.module.css'
import logo from '../assets/logo.svg'

const { Sider, Content, Header } = Layout

function UserLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/user/products',     icon: <AppstoreOutlined />, label: 'All products' },
    { key: '/user/products/add', icon: <PlusOutlined />,     label: 'Add products' },
    { key: '/user/orders',       icon: <ShoppingOutlined />, label: 'Orders' },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={249} breakpoint="md" collapsedWidth="0" className={styles.sider}>
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
        <Header className={styles.header}>
          <div
            className={styles.userIcon}
            onClick={() => navigate('/user/profile')}
          >
            <UserOutlined style={{ fontSize: 22, color: '#555' }} />
          </div>
        </Header>

        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default UserLayout