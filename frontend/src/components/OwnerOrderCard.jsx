import axios from 'axios'
import React, { useState } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { updateOrderStatus } from '../redux/userSlice'
import { FiPhone, FiMapPin, FiTruck } from 'react-icons/fi'

function OwnerOrderCard({ data }) {
  const dispatch = useDispatch()
  const [updating, setUpdating] = useState(false)
  const [availableBoys, setAvailableBoys] = useState([])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
  }

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { color: '#db7c38', bg: '#fff3e0', label: 'New Order' }
      case 'preparing': return { color: '#f57c00', bg: '#fff8e1', label: 'Preparing' }
      case 'out of delivery': return { color: '#1e88e5', bg: '#e3f2fd', label: 'Out for Delivery' }
      case 'delivered': return { color: '#60b246', bg: '#e8f5e9', label: 'Delivered' }
      case 'cancelled': return { color: '#e23744', bg: '#ffebee', label: 'Cancelled' }
      default: return { color: '#93959f', bg: '#f5f5f6', label: status || 'Processing' }
    }
  }

  const handleUpdateStatus = async (orderId, shopId, status) => {
    setUpdating(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      )
      dispatch(updateOrderStatus({ orderId, shopId, status }))
      if (result.data.availableBoys) {
        setAvailableBoys(result.data.availableBoys)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setUpdating(false)
    }
  }

  const shopOrder = data.shopOrders
  const statusInfo = getStatusInfo(shopOrder?.status)

  return (
    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', fontFamily: 'var(--font-main)' }}>
      {/* Customer Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f2f2f3' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 2px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {data.user?.fullName || 'Customer'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{data.user?.email}</p>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d4d5d9' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <FiPhone size={12} /> {data.user?.mobile}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 6px' }}>{formatDate(data.createdAt)}</p>
            <span style={{
              fontSize: '11px', fontWeight: 700,
              color: data.paymentMethod === 'cod' ? '#60b246' : '#1e88e5',
              background: data.paymentMethod === 'cod' ? '#e8f5e9' : '#e3f2fd',
              padding: '3px 10px', borderRadius: '6px',
            }}>
              {data.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PAID ONLINE'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '12px', background: '#f8f9fa', padding: '10px 12px', borderRadius: '10px' }}>
          <FiMapPin size={14} color="#fc8019" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{data.deliveryAddress?.text}</p>
        </div>
      </div>

      {/* Items Section */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f2f2f3' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Order Items</h4>
          <span style={{ background: statusInfo.bg, color: statusInfo.color, fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '8px' }}>
            {statusInfo.label}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shopOrder?.shopOrderItems?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={item.item?.image || item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', background: '#f5f5f6' }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>{item.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Qty: {item.quantity} × ₹{item.price}</p>
                </div>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Assignment Info */}
      {shopOrder?.status === 'out of delivery' && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f2f2f3', background: '#fff9f6' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px', color: '#fc8019', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiTruck size={14} /> Delivery Status
          </h4>
          
          {shopOrder.assignedDeliveryBoy ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #fce8da' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>{shopOrder.assignedDeliveryBoy.fullName}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Delivery Partner</p>
              </div>
              <a href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#1e88e5', textDecoration: 'none', background: '#e3f2fd', padding: '6px 12px', borderRadius: '8px' }}>
                <FiPhone size={12} /> {shopOrder.assignedDeliveryBoy.mobile}
              </a>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px' }}>Waiting for a delivery partner to accept...</p>
              {availableBoys?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notified Partners ({availableBoys.length})</p>
                  {availableBoys.map((b, index) => (
                    <div key={index} style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'white', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f5f5f6' }}>
                      {b.fullName} • {b.mobile}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Controls */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Update Status:</span>
          <select
            value={shopOrder?.status}
            disabled={updating}
            onChange={(e) => handleUpdateStatus(data._id, shopOrder?.shop?._id || shopOrder?.shop, e.target.value)}
            style={{ 
              border: '2px solid #fc8019', borderRadius: '10px', padding: '8px 12px', 
              fontSize: '13px', fontWeight: 700, color: '#fc8019', background: 'white', 
              cursor: 'pointer', outline: 'none', opacity: updating ? 0.5 : 1,
              fontFamily: 'var(--font-display)'
            }}
          >
            <option value="pending">New Order</option>
            <option value="preparing">Preparing</option>
            <option value="out of delivery">Out for Delivery</option>
            <option value="delivered" disabled>Delivered</option>
          </select>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px' }}>Total Amount</p>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            ₹{shopOrder?.subtotal}
          </span>
        </div>
      </div>
    </div>
  )
}

export default OwnerOrderCard
