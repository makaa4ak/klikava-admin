import { Input, Button, message } from 'antd'
import { useState, useEffect } from 'react'
import styles from './Profile.module.css'
import api from '../../api/axios'

function AccountSettings() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    birthday: '',
  })
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    api.get(`/users/${user.id}`).then(res => {
      const u = res.data.data || res.data
      setForm({
        name:         u.name         || '',
        email:        u.email        || '',
        phone_number: u.phone_number || '',
        birthday:     u.birthday ? u.birthday.split('T')[0] : '',
      })
    }).catch(() => {
      setForm(prev => ({
        ...prev,
        name:  user.name  || '',
        email: user.email || '',
      }))
    })
  }, [])

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const payload = {
        name:         form.name,
        email:        form.email,
        phone_number: form.phone_number || undefined,
        birthday:     form.birthday ? new Date(form.birthday).toISOString() : undefined,
      }
      await api.patch(`/users/${user.id}`, payload)
      localStorage.setItem('user', JSON.stringify({ ...user, name: form.name, email: form.email }))
      message.success('Profile saved!')
    } catch (err) {
      message.error(err.response?.data?.detail || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword) {
      message.error('Please enter your old password')
      return
    }
    if (!newPassword || newPassword.length < 8) {
      message.error('New password must be at least 8 characters')
      return
    }

    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')

      try {
        await api.post('/users/login', {
          login_email: user.email,
          password: oldPassword,
        })
      } catch {
        message.error('Old password is incorrect')
        return
      }

      await api.patch(`/users/${user.id}`, { password: newPassword })
      setOldPassword('')
      setNewPassword('')
      message.success('Password changed!')
    } catch (err) {
      message.error(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Account details</h2>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <Input value={form.name} onChange={handleChange('name')} className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <Input value={form.email} onChange={handleChange('email')} className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Phone</label>
          <Input value={form.phone_number} onChange={handleChange('phone_number')} className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Birthday</label>
          <Input
            type="date"
            value={form.birthday}
            onChange={handleChange('birthday')}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.saveRow}>
        <Button className={styles.saveBtn} onClick={handleSaveProfile} loading={loading}>
          Save profile
        </Button>
      </div>

      <h3 className={styles.subtitle}>Change Password</h3>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Old Password</label>
          <Input.Password
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className={styles.input}
            placeholder="Enter old password"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>New Password</label>
          <Input.Password
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className={styles.input}
            placeholder="At least 8 characters"
          />
        </div>
      </div>

      <div className={styles.saveRow}>
        <Button className={styles.saveBtn} onClick={handleChangePassword} loading={loading}>
          Change password
        </Button>
      </div>
    </div>
  )
}

export default AccountSettings