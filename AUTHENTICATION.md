# Система аутентификации - Документация

## Обзор

Реализована полная система управления аутентификацией с сохранением токена и восстановлением сессии.

## Компоненты

### 1. **useAuth Hook** (`src/hooks/useAuth.js`)
- **AuthProvider**: Контекст провайдер для управления состоянием аутентификации
- **useAuth()**: Hook для доступа к состоянию аутентификации в любом компоненте

**Состояние:**
- `user`: Данные текущего пользователя
- `token`: JWT токен
- `loading`: Статус загрузки
- `isAuthenticated`: Булев флаг для быстрой проверки

**Методы:**
- `logout()`: Очищает сессию и локальное хранилище

### 2. **ProtectedRoute** (`src/components/ProtectedRoute.jsx`)
Компонент для защиты маршрутов от неавторизованных пользователей.
- Перенаправляет на `/login` если пользователь не авторизован
- Показывает экран загрузки во время проверки сессии

### 3. **Login Component** (`src/pages/Login/Login.jsx`)
**Функционал:**
- Валидация полей (email и пароль)
- Запрос к `/auth/login` на бэкенде
- Сохранение `token` и `user` в localStorage
- Перенаправление на `/users` после успешного входа
- Обработка ошибок с сообщениями пользователю

### 4. **Axios Interceptors** (`src/api/axios.js`)
**Request Interceptor:**
- Автоматически добавляет `Authorization: Bearer <token>` ко всем запросам

**Response Interceptor:**
- Обрабатывает ошибку 401 (токен истёк)
- Очищает локальное хранилище
- Перенаправляет на `/login`

### 5. **MyProfile Component** (`src/pages/Profile/MyProfile.jsx`)
**Функционал:**
- Отображает данные текущего пользователя из контекста
- Кнопка "Logout" для выхода из системы

## Поток аутентификации

```
1. Пользователь открывает приложение
   ↓
2. AuthProvider восстанавливает сессию из localStorage
   ↓
3. Если token есть - пользователь авторизован
   ↓
4. При доступе к защищённому маршруту проверяется isAuthenticated
   ↓
5. Если не авторизован → перенаправляет на /login
```

## Логин

```
1. Пользователь вводит email и пароль
   ↓
2. POST /auth/login с учётными данными
   ↓
3. Backend возвращает { token, user }
   ↓
4. Фронтенд сохраняет в localStorage
   ↓
5. Перенаправляет на /users
```

## Логаут

```
1. Пользователь нажимает "Logout"
   ↓
2. logout() удаляет token и user из localStorage
   ↓
3. Перенаправляет на /login
```

## Истечение токена

```
1. Запрос на защищённый endpoint возвращает 401
   ↓
2. Response interceptor удаляет token из localStorage
   ↓
3. Автоматический редирект на /login
```

## Использование useAuth в компонентах

```javascript
import { useAuth } from '../../hooks/useAuth'

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth()
  
  return (
    <div>
      <p>Привет, {user?.first_name}</p>
      {isAuthenticated && <button onClick={logout}>Выход</button>}
    </div>
  )
}
```

## Защита маршрутов в App.jsx

```javascript
<Route path="/" element={<ProtectedRoute element={<AdminLayout />} />}>
  <Route path="users" element={<Users />} />
  {/* ... другие маршруты */}
</Route>
```

## Локальное хранилище

**Ключи в localStorage:**
- `token`: JWT токен для авторизации
- `user`: JSON объект с данными пользователя

```json
{
  "id": 1,
  "first_name": "Иван",
  "last_name": "Петров",
  "email": "ivan@example.com",
  "role": "admin"
}
```

## Backend требования

**POST /auth/login** должен возвращать:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "role": "string"
  }
}
```

**JWT токен** должен содержать:
- `id`: ID пользователя
- `role`: Роль пользователя
- `expiresIn`: 7 дней (в примере)
