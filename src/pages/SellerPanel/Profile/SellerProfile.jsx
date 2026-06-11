import { Input, Button, message } from 'antd'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import styles from './SellerProfile.module.css'
import { useAuth } from '../../../hooks/useAuth.jsx'
import api from '../../../api/axios.js'

function SellerProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [avatar, setAvatar] = useState(null)
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (!user?.id) return
    api.get(`/users/${user.id}`).then(res => {
      const u = res.data.data || res.data
      setName(u.name || '')
      setEmail(u.email || '')
      if (u.avatar_url) setAvatar(u.avatar_url)
    }).catch(() => {
      setName(user.name || '')
      setEmail(user.email || '')
    })
  }, [])

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (file) setAvatar(URL.createObjectURL(file))
  }

  const handleLogout = () => {
    logout()
    message.success('Logged out')
    navigate('/login')
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await api.patch(`/users/${user.id}`, { name, email })
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, name, email }))
      message.success('Saved successfully!')
    } catch (err) {
      message.error(err.response?.data?.detail || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const roles = (user?.roles || []).map(r => r.name).join(', ') || user?.role || '—'

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.topSection}>
        <div className={styles.avatarWrap}>
          {avatar
            ? <img src={avatar} alt="avatar" className={styles.avatar} />
            : <div className={styles.avatarPlaceholder} />
          }
          <button className={styles.uploadBtn} onClick={() => fileRef.current.click()}>↑</button>
          <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handleAvatar} />
        </div>
        <div className={styles.nameFields}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Login</label>
            <Input defaultValue={user?.login || user?.login_email || '—'} className={styles.input} disabled />
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <Input value={email} onChange={e => setEmail(e.target.value)} className={styles.input} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Role</label>
        <Input value={roles} className={styles.input} disabled />
      </div>

      <div className={styles.saveRow}>
        <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Button>
        <Button className={styles.saveBtn} onClick={handleSave} loading={loading}>
          Save
        </Button>
      </div>
    </div>
  )
}

export default SellerProfile