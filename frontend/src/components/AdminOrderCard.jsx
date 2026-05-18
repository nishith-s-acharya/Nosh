import axios from 'axios'
import React, { useState } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { updateRealtimeOrderStatus } from '../redux/userSlice'

function AdminOrderCard({ data }) {
  const dispatch = useDispatch()
  const [updating, setUpdating] = useState({})

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
  }

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { color: '#db7c38', bg: '#fff3e0', label: 'Order Placed' }
      case 'preparing': return { color: '#f57c00', bg: '#fff8e1', label: 'Preparing' }
      case 'out of delivery': return { color: '#1e88e5', bg: '#e3f2fd', label: 'On the way' }
      case 'delivered': return { color: '#60b246', bg: '#e8f5e9', label: 'Delivered' }
      case 'cancelled': return { color: '#e23744', bg: '#ffebee', label: 'Cancelled' }
      default: return { color: '#93959f', bg: '#f5f5f6', label: status || 'Processing' }
    }
  }

  const handleUpdateStatus = async (orderId, shopId, status) => {
    setUpdating(prev => ({ ...prev, [shopId]: true }))
    try {
      await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${encodeURIComponent(shopId)}`,
        { status },
        { withCredentials: true }
      )
      dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
    } catch (error) {
      console.log(error)
    } finally {
      setUpdating(prev => ({ ...prev, [shopId]: false }))
    }
  }

  const shopOrders = Array.isArray(data.shopOrders) ? data.shopOrders : [data.shopOrders]

  return (
    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', fontFamily: 'var(--font-main)' }}>
      {/* Customer Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f2f2f3' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {data.user?.fullName || 'Customer'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 1px' }}>{data.user?.email}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{data.user?.mobile}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 6px' }}>{formatDate(data.createdAt)}</p>
            <span style={{
              fontSize: '11px', fontWeight: 700,
              color: data.paymentMethod === 'cod' ? '#60b246' : '#1e88e5',
              background: data.paymentMethod === 'cod' ? '#e8f5e9' : '#e3f2fd',
              padding: '3px 10px', borderRadius: '6px',
            }}>
              {data.paymentMethod === 'cod' ? 'CASH' : 'PAID ONLINE'}
            </span>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '8px 0 0' }}>📍 {data.deliveryAddress?.text}</p>
      </div>

      {/* Shop Orders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#f2f2f3' }}>
        {shopOrders.map((so, idx) => {
          if (!so) return null
          const statusInfo = getStatusInfo(so.status)
          const shopId = so.shop?._id || so.shopName || so.shop
          return (
            <div key={idx} style={{ background: 'white', padding: '14px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {so.shop?.name || so.shopName || 'Shop'}
                </h4>
                <span style={{ background: statusInfo.bg, color: statusInfo.color, fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
                  {statusInfo.label}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                {so.shopOrderItems?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-primary)' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 500 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f5f5f6' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Subtotal: ₹{so.subtotal}</span>
                <select
                  value={so.status}
                  disabled={updating[shopId]}
                  onChange={(e) => handleUpdateStatus(data._id, shopId, e.target.value)}
                  style={{ border: '2px solid #fc8019', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 600, color: '#fc8019', background: 'white', cursor: 'pointer', outline: 'none', opacity: updating[shopId] ? 0.5 : 1 }}
                >
                  <option value="pending">Order Placed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out of delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              {so.assignedDeliveryBoy && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', background: '#f5f5f6', padding: '6px 10px', borderRadius: '8px' }}>
                  🚴 {so.assignedDeliveryBoy.fullName} — {so.assignedDeliveryBoy.mobile}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Total: ₹{data.totalAmount}
        </span>
      </div>
    </div>
  )
}

export default AdminOrderCard
