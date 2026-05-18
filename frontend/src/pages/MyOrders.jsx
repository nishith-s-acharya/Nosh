import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaArrowLeft } from 'react-icons/fa'
import { FiPackage } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import AdminOrderCard from '../components/AdminOrderCard';
import { setMyOrders, updateOrderStatus, updateRealtimeOrderStatus } from '../redux/userSlice';

function MyOrders() {
  const { userData, myOrders, socket } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    socket?.on('newOrder', (data) => {
      if (userData.role === 'admin' || data.shopOrders?.owner?._id == userData._id) {
        dispatch(setMyOrders([data, ...myOrders]))
      }
    })
    socket?.on('update-status', ({ orderId, shopId, status, userId }) => {
      if (userId == userData._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
      }
    })
    return () => {
      socket?.off('newOrder')
      socket?.off('update-status')
    }
  }, [socket])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f1f6',
      fontFamily: 'var(--font-main)',
    }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'white',
        padding: '14px 16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <FaArrowLeft size={16} />
          </button>
          <h1 style={{
            fontSize: '18px', fontWeight: 800,
            color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
            margin: 0,
          }}>{userData.role === 'admin' ? 'All Orders' : 'My Orders'}</h1>
        </div>
      </div>

      {/* Orders list */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 16px 40px' }}>
        {!myOrders || myOrders.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: '20px',
            padding: '60px 20px', textAlign: 'center',
            marginTop: '20px',
          }}>
            <FiPackage size={56} style={{ color: '#d4d5d9', margin: '0 auto 16px' }} />
            <h2 style={{
              fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)', margin: '0 0 6px',
            }}>No orders yet</h2>
            <p style={{
              fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px',
            }}>Your order history will appear here</p>
            <button onClick={() => navigate("/")} style={{
              background: '#fc8019', color: 'white',
              border: 'none', borderRadius: '12px',
              padding: '14px 28px', fontSize: '15px',
              fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}>
              EXPLORE RESTAURANTS
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {myOrders.map((order, index) => (
              userData.role == "user" ? (
                <UserOrderCard data={order} key={order._id || index} />
              ) : userData.role == "owner" ? (
                <OwnerOrderCard data={order} key={order._id || index} />
              ) : userData.role == "admin" ? (
                <AdminOrderCard data={order} key={order._id || index} />
              ) : null
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders
