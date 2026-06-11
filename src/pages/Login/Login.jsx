import { Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import styles from './Login.module.css'
import logo from '../../assets/logo.svg'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginVal, setLoginVal] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    if (!loginVal || !password) {
      message.error('Пожалуйста, введите логин и пароль')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/users/login', { login_email: loginVal, password })

      const { access_token, user } = res.data.data
      const roles = user.roles || []

      // Оновлюємо стан через useAuth — тепер ProtectedRoute одразу бачить авторизацію
      login(access_token, user)

      message.success('Успешно вошли в систему')

      const roleNames = roles.map(r => r.name)

      if (roleNames.includes('ADMIN') || roleNames.includes('MODERATOR')) {
        navigate('/users')
      } else if (roleNames.includes('SELLER')) {
        navigate('/seller/dashboard')
      } else {
        navigate('/seller/dashboard')
      }

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Ошибка входа'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className={styles.page}>
      <img src={logo} alt="KLIKAVA" className={styles.logo} />
      <div className={styles.card}>
        <Input
          placeholder="Логин или email"
          className={styles.input}
          value={loginVal}
          onChange={e => setLoginVal(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <Input.Password
          placeholder="Пароль"
          className={styles.input}
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <Button className={styles.btn} loading={loading} onClick={handleLogin}>
          Вход
        </Button>
        <p className={styles.link} onClick={() => !loading && navigate('/register')}>
          Создать аккаунт
        </p>
      </div>
    </div>
  )
}

export default Login