import React, { useState } from 'react'
import { FaStar, FaMinus, FaPlus } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateQuantity, removeCartItem } from '../redux/userSlice'

function SwiggyMenuCard({ data, restaurantName }) {
  const [showAdded, setShowAdded] = useState(false)
  const dispatch = useDispatch()
  const { cartItems } = useSelector(state => state.user)

  const cartItemId = `swiggy_${data.id}`
  const cartItem = cartItems.find(i => i.id === cartItemId)
  const cartQty = cartItem?.quantity || 0

  const handleAdd = () => {
    dispatch(addToCart({
      id: cartItemId,
      name: data.name,
      price: data.price,
      image: data.image || '',
      shop: restaurantName,
      quantity: 1,
      foodType: data.foodType
    }))
    setShowAdded(true)
    setTimeout(() => setShowAdded(false), 1200)
  }

  const handleIncrease = () => {
    dispatch(updateQuantity({ id: cartItemId, quantity: cartQty + 1 }))
  }

  const handleDecrease = () => {
    if (cartQty <= 1) {
      dispatch(removeCartItem(cartItemId))
    } else {
      dispatch(updateQuantity({ id: cartItemId, quantity: cartQty - 1 }))
    }
  }

  const isVeg = data.foodType === 'veg'

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '24px 0',
      fontFamily: 'var(--font-main)',
    }}>
      {/* Left — Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Veg/Non-veg icon */}
        <div style={{
          width: '18px',
          height: '18px',
          border: `2px solid ${isVeg ? '#0f8a65' : '#e43b4f'}`,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: isVeg ? '#0f8a65' : '#e43b4f',
          }} />
        </div>

        {/* Name */}
        <h3 style={{
          fontWeight: 700,
          fontSize: '17px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          lineHeight: 1.3,
          margin: 0,
        }}>{data.name}</h3>

        {/* Price */}
        <p style={{
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontSize: '15px',
          margin: '4px 0 0',
        }}>₹{data.price}</p>

        {/* Rating */}
        {data.rating && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '8px',
          }}>
            <FaStar size={12} style={{ color: '#ff9f0a' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{data.rating}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({data.ratingCount})</span>
          </div>
        )}

        {/* Description */}
        {data.description && (
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginTop: '10px',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{data.description}</p>
        )}
      </div>

      {/* Right — Image + ADD */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        position: 'relative',
        width: '156px',
      }}>
        {data.image ? (
          <img
            src={data.image}
            alt={data.name}
            loading='lazy'
            style={{
              width: '156px',
              height: '144px',
              objectFit: 'cover',
              borderRadius: '16px',
            }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div style={{
            width: '156px',
            height: '144px',
            background: 'var(--bg)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '32px' }}>🍽️</span>
          </div>
        )}

        {/* ADD / Stepper */}
        <div style={{ position: 'relative', marginTop: '-22px', zIndex: 2 }}>
          {cartQty === 0 ? (
            <button
              onClick={handleAdd}
              style={{
                background: '#ffffff',
                color: '#60b246',
                border: '2px solid #d4d5d9',
                borderRadius: '12px',
                padding: '8px 36px',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f0fdf4'
                e.currentTarget.style.borderColor = '#60b246'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.borderColor = '#d4d5d9'
              }}
            >
              ADD
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '10px',
                fontSize: '18px',
                color: '#60b246',
                fontWeight: 400,
                lineHeight: 1,
              }}>+</span>
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#60b246',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(96,178,70,0.3)',
              overflow: 'hidden',
            }}>
              <button onClick={handleDecrease} style={{
                background: 'none',
                border: 'none',
                color: 'white',
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}>
                <FaMinus size={11} />
              </button>
              <span style={{
                color: 'white',
                fontWeight: 800,
                fontSize: '15px',
                minWidth: '22px',
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
              }}>{cartQty}</span>
              <button onClick={handleIncrease} style={{
                background: 'none',
                border: 'none',
                color: 'white',
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}>
                <FaPlus size={11} />
              </button>
            </div>
          )}
        </div>

        {showAdded && (
          <p className='fade-in-up' style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontWeight: 500,
            marginTop: '6px',
            textAlign: 'center',
          }}>Added to cart ✓</p>
        )}

        {data.inStock === false && (
          <p style={{
            fontSize: '11px',
            color: '#e23744',
            fontWeight: 500,
            marginTop: '6px',
          }}>Currently unavailable</p>
        )}
      </div>
    </div>
  )
}

export default SwiggyMenuCard
