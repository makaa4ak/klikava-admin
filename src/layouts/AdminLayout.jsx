import { Layout, Menu, Input } from 'antd'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import {
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  TagsOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import styles from './AdminLayout.module.css'
import logo from '../assets/logo.svg'

const { Sider, Content, Header } = Layout

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/users',      icon: <UserOutlined />,     label: 'Users' },
    { key: '/admins',     icon: <TeamOutlined />,     label: 'Admins' },
    { key: '/products',   icon: <AppstoreOutlined />, label: 'Products' },
    { key: '/categories', icon: <TagsOutlined />,     label: 'Categories' },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={249}
        breakpoint="md"
        collapsedWidth="0"
        className={styles.sider}
      >
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
        {/* Хедер */}
        <Header className={styles.header}>
          <Input
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            placeholder="Global search..."
            className={styles.globalSearch}
          />
          <div
            className={styles.userIcon}
            onClick={() => navigate('/profile')}
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

export default AdminLayout