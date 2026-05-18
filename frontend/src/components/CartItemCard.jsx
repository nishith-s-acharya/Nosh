import React from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { removeCartItem, updateQuantity } from '../redux/userSlice'

function CartItemCard({ data }) {
  const dispatch = useDispatch()

  const handleIncrease = () => {
    dispatch(updateQuantity({ id: data.id, quantity: data.quantity + 1 }))
  }

  const handleDecrease = () => {
    if (data.quantity > 1) {
      dispatch(updateQuantity({ id: data.id, quantity: data.quantity - 1 }))
    } else {
      dispatch(removeCartItem(data.id))
    }
  }

  const isVeg = data.foodType === 'veg'
  const lineTotal = data.price * data.quantity

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      fontFamily: 'var(--font-main)',
      gap: '12px',
    }}>
      {/* Left: Veg icon + Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
        {/* Veg/Non-veg marker */}
        <div style={{
          width: '16px',
          height: '16px',
          border: `2px solid ${isVeg !== false && isVeg !== undefined ? '#0f8a65' : '#e43b4f'}`,
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '3px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isVeg !== false && isVeg !== undefined ? '#0f8a65' : '#e43b4f',
          }} />
        </div>

        {/* Item info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontWeight: 600,
            fontSize: '15px',
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{data.name}</h3>

          <p style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            margin: '4px 0 0',
          }}>₹{lineTotal}</p>
        </div>
      </div>

      {/* Right: Quantity stepper */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #d4d5d9',
        borderRadius: '8px',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <button
          onClick={handleDecrease}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: data.quantity <= 1 ? '#d4d5d9' : '#60b246',
          }}
        >
          <FaMinus size={10} />
        </button>
        <span style={{
          fontWeight: 700,
          fontSize: '14px',
          color: '#60b246',
          minWidth: '20px',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
        }}>{data.quantity}</span>
        <button
          onClick={handleIncrease}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#60b246',
          }}
        >
          <FaPlus size={10} />
        </button>
      </div>
    </div>
  )
}

export default CartItemCard
