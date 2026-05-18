import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function OrderPlaced() {
  const navigate = useNavigate()
  const [showCheck, setShowCheck] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowCheck(true), 300)
    setTimeout(() => setShowText(true), 800)
    setTimeout(() => setShowButtons(true), 1200)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'var(--font-main)',
      overflow: 'hidden',
    }}>

      {/* Animated check circle */}
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: '#60b246',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '28px',
        transform: showCheck ? 'scale(1)' : 'scale(0)',
        opacity: showCheck ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: '0 8px 30px rgba(96,178,70,0.25)',
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Text */}
      <div style={{
        opacity: showText ? 1 : 0,
        transform: showText ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease',
      }}>
        <h1 style={{
          fontSize: '26px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          margin: '0 0 8px',
        }}>Order placed successfully!</h1>

        <p style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          maxWidth: '340px',
          lineHeight: 1.6,
          margin: '0 auto',
        }}>
          Your order is being prepared and will be delivered soon. You can track your order in My Orders.
        </p>
      </div>

      {/* Buttons */}
      <div style={{
        marginTop: '36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '320px',
        opacity: showButtons ? 1 : 0,
        transform: showButtons ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease',
      }}>
        <button
          onClick={() => navigate("/my-orders")}
          style={{
            width: '100%',
            background: '#60b246',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            cursor: 'pointer',
            letterSpacing: '0.3px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#4a9a32'}
          onMouseLeave={e => e.currentTarget.style.background = '#60b246'}
        >
          VIEW MY ORDERS
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            width: '100%',
            background: 'white',
            color: '#fc8019',
            border: '2px solid #fc8019',
            borderRadius: '14px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            cursor: 'pointer',
            letterSpacing: '0.3px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fff8f0'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'white'
          }}
        >
          BROWSE RESTAURANTS
        </button>
      </div>
    </div>
  )
}

export default OrderPlaced
