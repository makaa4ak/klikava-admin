import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import ProfileLayout from './layouts/ProfileLayout'
import SellerLayout from './layouts/SellerLayout'
import SellerProfileLayout from './layouts/SellerProfileLayout'

import Users from './pages/Users/Users'
import Admins from './pages/Admins/Admins'
import Products from './pages/Products/Products'
import Categories from './pages/Categories/Categories'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import MyProfile from './pages/Profile/MyProfile'
import AccountSettings from './pages/Profile/AccountSettings'
import ProtectedRoute from './components/ProtectedRoute'

import SellerDashboard from './pages/SellerPanel/Dashboard/SellerDashboard'
import SellerProducts from './pages/SellerPanel/Products/SellerProducts'
import SellerAddProduct from './pages/SellerPanel/Products/SellerAddProduct'
import SellerOrders from './pages/SellerPanel/Orders/SellerOrders'
import SellerStatistics from './pages/SellerPanel/Statistics/SellerStatistics'
import SellerProfile from './pages/SellerPanel/Profile/SellerProfile'
import SellerAccountSettings from './pages/SellerPanel/Profile/SellerAccountSettings'

function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Адмін панель */}
      <Route path="/" element={<ProtectedRoute element={<AdminLayout />} />}>
        <Route index element={<Navigate to="/users" />} />
        <Route path="users"      element={<Users />} />
        <Route path="admins"     element={<Admins />} />
        <Route path="products"   element={<Products />} />
        <Route path="categories" element={<Categories />} />
      </Route>

      {/* Профіль адміна */}
      <Route path="/profile" element={<ProtectedRoute element={<ProfileLayout />} />}>
        <Route index element={<MyProfile />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      {/* Seller панель */}
      <Route path="/seller">
  <Route element={<ProtectedRoute />}>
    <Route element={<SellerLayout />}>
      
      <Route path="products"     element={<SellerProducts />} />
      <Route path="products/add" element={<SellerAddProduct />} />
      <Route path="orders"       element={<SellerOrders />} />
      
    </Route>

    <Route element={<SellerProfileLayout />}>
      <Route path="profile"          element={<SellerProfile />} />
      <Route path="profile/settings" element={<SellerAccountSettings />} />
      <Route path="statistics"   element={<SellerStatistics />} />
      <Route path="dashboard"    element={<SellerDashboard />} />
    </Route>
  </Route>
</Route>
    </Routes>
  )
}

export default App