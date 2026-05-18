import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { FaStar } from 'react-icons/fa'
import { FiMapPin } from 'react-icons/fi'

function UserOrderCard({ data }) {
  const navigate = useNavigate()
  const [selectedRating, setSelectedRating] = useState({})

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleRating = async (itemId, rating) => {
    try {
      await axios.post(`${serverUrl}/api/item/rating`, { itemId, rating }, { withCredentials: true })
      setSelectedRating(prev => ({ ...prev, [itemId]: rating }))
    } catch (error) {
      console.log(error)
    }
  }

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return { color: '#60b246', bg: '#e8f5e9', label: 'Delivered' }
      case 'pending': return { color: '#db7c38', bg: '#fff3e0', label: 'Preparing' }
      case 'out of delivery': return { color: '#1e88e5', bg: '#e3f2fd', label: 'On the way' }
      case 'cancelled': return { color: '#e23744', bg: '#ffebee', label: 'Cancelled' }
      default: return { color: '#93959f', bg: '#f5f5f6', label: status || 'Processing' }
    }
  }

  // Get first shop order status for the header
  const primaryStatus = getStatusInfo(
    data.shopOrders?.[0]?.status || data.shopOrders?.status
  )

  // Collect all items from all shop orders
  const allItems = []
  if (Array.isArray(data.shopOrders)) {
    data.shopOrders.forEach(so => {
      const shopName = so.shop?.name || so.shopName || so.shopOrderItems?.[0]?.shopName || null
      so.shopOrderItems?.forEach(item => {
        allItems.push({ ...item, shopName: shopName || item.shopName || null, status: so.status })
      })
    })
  } else if (data.shopOrders?.shopOrderItems) {
    const shopName = data.shopOrders.shop?.name || data.shopOrders.shopName || null
    data.shopOrders.shopOrderItems.forEach(item => {
      allItems.push({ ...item, shopName, status: data.shopOrders.status })
    })
  }

  const itemSummary = allItems.length <= 2
    ? allItems.map(i => i.name).join(', ')
    : `${allItems[0]?.name}, ${allItems[1]?.name} +${allItems.length - 2} more`

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      fontFamily: 'var(--font-main)',
    }}>
      {/* ─── Header ─── */}
      <div style={{
        padding: '18px 20px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Restaurant name(s) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {allItems[0]?.shopName ? (
              <h3 style={{
                fontSize: '16px', fontWeight: 800,
                color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
                margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{allItems[0].shopName}</h3>
            ) : (
              <h3 style={{
                fontSize: '16px', fontWeight: 800,
                color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
                margin: 0,
              }}>Restaurant</h3>
            )}
          </div>

          {/* Order info */}
          <p style={{
            fontSize: '12px', color: 'var(--text-muted)',
            margin: '4px 0 0',
          }}>
            {formatDate(data.createdAt)} • {allItems.length} item{allItems.length !== 1 ? 's' : ''} • ₹{data.totalAmount}
          </p>
        </div>

        {/* Status badge */}
        <div style={{
          background: primaryStatus.bg,
          color: primaryStatus.color,
          fontSize: '12px',
          fontWeight: 700,
          padding: '5px 12px',
          borderRadius: '8px',
          flexShrink: 0,
          marginLeft: '12px',
        }}>
          {primaryStatus.label}
        </div>
      </div>

      {/* ─── Items ─── */}
      <div style={{
        padding: '0 20px 14px',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        {allItems.slice(0, 4).map((item, idx) => {
          const isVeg = item.foodType === 'veg'
          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                {/* Veg/Non-veg dot */}
                <div style={{
                  width: '14px', height: '14px',
                  border: `2px solid ${isVeg !== false && isVeg !== undefined ? '#0f8a65' : '#e43b4f'}`,
                  borderRadius: '3px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: isVeg !== false && isVeg !== undefined ? '#0f8a65' : '#e43b4f',
                  }} />
                </div>
                <span style={{
                  fontSize: '14px', color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{item.name}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0 }}>
                  × {item.quantity}
                </span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', flexShrink: 0, marginLeft: '8px' }}>
                ₹{item.price * item.quantity}
              </span>
            </div>
          )
        })}

        {allItems.length > 4 && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
            +{allItems.length - 4} more item{allItems.length - 4 > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ─── Rating section (only for delivered local items) ─── */}
      {allItems.some(i => i.status === 'delivered' && i.item?._id) && (
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #f2f2f3',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Rate your food
          </p>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {allItems.filter(i => i.status === 'delivered' && i.item?._id).map((item, idx) => (
              <div key={idx} style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              }}>
                <p style={{
                  fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500,
                  maxWidth: '80px', textAlign: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{item.name}</p>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(item.item._id, star)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '2px', transition: 'transform 0.15s',
                      }}
                    >
                      <FaStar
                        size={16}
                        style={{
                          color: (selectedRating[item.item._id] || 0) >= star ? '#ff9f0a' : '#d4d5d9',
                          transition: 'color 0.15s',
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Footer Actions ─── */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid #f2f2f3',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{
            fontSize: '12px', fontWeight: 600,
            color: data.paymentMethod === 'cod' ? '#60b246' : '#1e88e5',
            background: data.paymentMethod === 'cod' ? '#e8f5e9' : '#e3f2fd',
            padding: '4px 10px', borderRadius: '6px',
          }}>
            {data.paymentMethod === 'cod' ? 'CASH' : 'PAID'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {primaryStatus.label !== 'Delivered' && primaryStatus.label !== 'Cancelled' && (
            <button
              onClick={() => navigate(`/track-order/${data._id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#fc8019', color: 'white',
                border: 'none', borderRadius: '10px',
                padding: '10px 16px', fontSize: '13px',
                fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-display)',
              }}
            >
              <FiMapPin size={14} />
              TRACK ORDER
            </button>
          )}

          <button
            onClick={() => navigate(`/track-order/${data._id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'white', color: '#fc8019',
              border: '2px solid #fc8019', borderRadius: '10px',
              padding: '8px 14px', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserOrderCard
