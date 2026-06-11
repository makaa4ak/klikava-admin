import { Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import styles from './Register.module.css'
import logo from '../../assets/logo.svg'
import api from '../../api/axios'

function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    login: '', email: '', password: '',
    name: '', phone_number: ''
  })

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleRegister = async () => {
    if (!form.login || !form.email || !form.password) {
      message.error('Login, email and password are required')
      return
    }
    try {
      setLoading(true)
      await api.post('/users/register', form)
      message.success('Registered successfully!')
      navigate('/login')
    } catch (err) {
      message.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <img src={logo} alt="KLIKAVA" className={styles.logo} />
      <div className={styles.card}>
        <Input placeholder="Full Name"   className={styles.input} onChange={handleChange('name')} />
        <Input placeholder="Login"       className={styles.input} onChange={handleChange('login')} />
        <Input placeholder="Email"       className={styles.input} onChange={handleChange('email')} />
        <Input.Password placeholder="Password" className={styles.input} onChange={handleChange('password')} />
        <Input placeholder="Phone"       className={styles.input} onChange={handleChange('phone_number')} />
        <Button className={styles.btn} loading={loading} onClick={handleRegister}>
          Register
        </Button>
        <p className={styles.link} onClick={() => navigate('/login')}>
          Already have an account
        </p>
      </div>
    </div>
  )
}

export default Register