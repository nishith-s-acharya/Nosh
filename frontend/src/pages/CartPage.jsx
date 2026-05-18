import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { FiShoppingBag } from 'react-icons/fi'
import { MdDeliveryDining } from 'react-icons/md'
import { BiSolidOffer } from 'react-icons/bi'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CartItemCard from '../components/CartItemCard'

function CartPage() {
  const navigate = useNavigate()
  const { cartItems, totalAmount } = useSelector(state => state.user)
  const deliveryFee = totalAmount > 500 ? 0 : 40
  const platformFee = 6
  const gstCharges = Math.round(totalAmount * 0.05)
  const finalAmount = totalAmount + deliveryFee + platformFee + gstCharges

  // Group items by restaurant/shop
  const groupedItems = cartItems.reduce((groups, item) => {
    const shop = typeof item.shop === 'object' ? item.shop?.name : item.shop || 'Restaurant'
    if (!groups[shop]) groups[shop] = []
    groups[shop].push(item)
    return groups
  }, {})

  const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e9e9eb',
      fontFamily: 'var(--font-main)',
    }}>
      {/* ─── Sticky Header ─── */}
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
          <div>
            <h1 style={{
              fontSize: '16px', fontWeight: 800,
              color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
              margin: 0,
            }}>Cart</h1>
            <p style={{
              fontSize: '12px', color: 'var(--text-muted)',
              margin: 0,
            }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 16px 120px' }}>
        {cartItems?.length === 0 ? (
          /* Empty State */
          <div style={{
            background: 'white', borderRadius: '20px',
            padding: '60px 20px', textAlign: 'center',
            marginTop: '20px',
          }}>
            <FiShoppingBag size={60} style={{ color: '#d4d5d9', margin: '0 auto 16px' }} />
            <h2 style={{
              fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)', margin: '0 0 6px',
            }}>Your cart is empty</h2>
            <p style={{
              fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px',
            }}>You can go to home page to view more restaurants</p>
            <button onClick={() => navigate("/")} style={{
              background: '#fc8019', color: 'white',
              border: 'none', borderRadius: '12px',
              padding: '14px 32px', fontSize: '16px',
              fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.3px',
            }}>
              SEE RESTAURANTS NEAR YOU
            </button>
          </div>
        ) : (
          <>
            {/* ─── Cart Items grouped by restaurant ─── */}
            {Object.entries(groupedItems).map(([shopName, items]) => (
              <div key={shopName} style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px',
                marginBottom: '16px',
              }}>
                {/* Restaurant name */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  paddingBottom: '14px',
                  borderBottom: '1px solid #f2f2f3',
                }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #fc8019, #f7b731)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 700, color: 'white',
                    fontFamily: 'var(--font-display)',
                    flexShrink: 0,
                  }}>
                    {shopName.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{
                      fontSize: '16px', fontWeight: 800,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{shopName}</h2>
                  </div>
                </div>

                {/* Items */}
                {items.map((item, idx) => (
                  <div key={item.id}>
                    <CartItemCard data={item} />
                    {idx < items.length - 1 && (
                      <div style={{ height: '1px', background: '#f2f2f3' }}></div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* ─── Offers / Suggestions ─── */}
            <div style={{
              background: 'white', borderRadius: '20px',
              padding: '16px 20px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '12px',
              cursor: 'pointer',
            }}>
              <BiSolidOffer size={24} style={{ color: '#686b78', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '15px', fontWeight: 700,
                  color: 'var(--text-primary)', margin: 0,
                }}>Apply Coupon</p>
              </div>
              <span style={{
                fontSize: '14px', color: 'var(--text-muted)',
                fontWeight: 500,
              }}>›</span>
            </div>

            {/* ─── Bill Details ─── */}
            <div style={{
              background: 'white', borderRadius: '20px',
              padding: '20px',
            }}>
              <h2 style={{
                fontSize: '16px', fontWeight: 800,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                margin: '0 0 16px',
              }}>Bill Details</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Item total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Item Total</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>₹{totalAmount}</span>
                </div>

                {/* Delivery fee */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Delivery Fee</span>
                    {deliveryFee === 0 && (
                      <MdDeliveryDining size={16} style={{ color: '#60b246' }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: '14px', fontWeight: 500,
                    color: deliveryFee === 0 ? '#60b246' : 'var(--text-primary)',
                  }}>
                    {deliveryFee === 0 ? (
                      <><span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '4px' }}>₹40</span>FREE</>
                    ) : `₹${deliveryFee}`}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#f2f2f3', margin: '2px 0' }}></div>

                {/* Platform fee */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Platform fee</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>₹{platformFee}</span>
                </div>

                {/* GST */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>GST and Restaurant Charges</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>₹{gstCharges}</span>
                </div>
              </div>

              {/* Total */}
              <div style={{
                borderTop: '2px solid var(--text-primary)',
                marginTop: '14px', paddingTop: '14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontSize: '15px', fontWeight: 800,
                  color: 'var(--text-primary)',
                }}>TO PAY</span>
                <span style={{
                  fontSize: '15px', fontWeight: 800,
                  color: 'var(--text-primary)',
                }}>₹{finalAmount}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── Sticky Checkout Bar ─── */}
      {cartItems.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 40, background: 'white',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          padding: '12px 16px',
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button
              onClick={() => navigate("/checkout")}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                background: '#60b246',
                color: 'white',
                padding: '16px 20px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.3px' }}>
                PROCEED TO PAY
              </span>
              <span style={{ fontWeight: 800, fontSize: '16px' }}>
                ₹{finalAmount}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
