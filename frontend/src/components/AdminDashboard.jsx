import React from 'react'
import Nav from './NaV.JSX'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi'
import useGetMyOrders from '../hooks/useGetMyOrders'

function AdminDashboard() {
  const { myOrders } = useSelector(state => state.user)
  const navigate = useNavigate()
  useGetMyOrders()

  const totalOrders = myOrders?.length || 0
  const activeOrders = myOrders?.filter(o => {
    const orders = Array.isArray(o.shopOrders) ? o.shopOrders : [o.shopOrders]
    return orders.some(so => ['pending', 'preparing', 'out of delivery'].includes(so?.status))
  }).length || 0
  const deliveredOrders = myOrders?.filter(o => {
    const orders = Array.isArray(o.shopOrders) ? o.shopOrders : [o.shopOrders]
    return orders.every(so => so?.status === 'delivered')
  }).length || 0

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: <FiPackage size={22} />, color: '#fc8019', bg: '#fff3e0' },
    { label: 'Active Orders', value: activeOrders, icon: <FiTruck size={22} />, color: '#1e88e5', bg: '#e3f2fd' },
    { label: 'Delivered', value: deliveredOrders, icon: <FiCheckCircle size={22} />, color: '#60b246', bg: '#e8f5e9' },
  ]

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex flex-col items-center'>
      <Nav />
      <div style={{ width: '100%', maxWidth: '800px', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>
          Admin Panel
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 24px' }}>
          Manage all orders across every shop on the platform.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/my-orders')}
          style={{ width: '100%', background: '#fc8019', color: 'white', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)' }}
        >
          MANAGE ALL ORDERS
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard
