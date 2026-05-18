import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { FaArrowLeft, FaStar, FaClock, FaMapMarkerAlt, FaRedo } from 'react-icons/fa'
import { FiShoppingCart } from 'react-icons/fi'
import { IoChevronDown } from 'react-icons/io5'
import SwiggyMenuCard from '../components/SwiggyMenuCard'

function SwiggyShop() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const { location } = useSelector(state => state.map)
  const { cartItems, totalAmount } = useSelector(state => state.user)
  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({})

  const fetchMenu = useCallback(async () => {
    setLoading(true)
    setError(null)
    const lat = location?.lat || 12.9716
    const lng = location?.lon || 77.5946

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await axios.get(
          `${serverUrl}/api/swiggy/menu/${restaurantId}?lat=${lat}&lng=${lng}`,
          { withCredentials: true }
        )
        if (result.data.restaurant && result.data.categories?.length > 0) {
          setRestaurant(result.data.restaurant)
          setCategories(result.data.categories)
          const expanded = {}
          result.data.categories.slice(0, 3).forEach((_, i) => { expanded[i] = true })
          setExpandedCategories(expanded)
          setLoading(false)
          return
        }
        if (result.data.restaurant) setRestaurant(result.data.restaurant)
      } catch (err) {
        console.log(`Menu attempt ${attempt + 1} failed:`, err.message)
      }
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000))
    }
    setError("Couldn't load menu. Swiggy may be temporarily unavailable.")
    setLoading(false)
  }, [restaurantId, location?.lat, location?.lon])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  const toggleCategory = (i) => {
    setExpandedCategories(p => ({ ...p, [i]: !p[i] }))
  }

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'white', fontFamily: 'var(--font-main)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
          <div className='shimmer' style={{ height: '200px', width: '100%', borderRadius: '0 0 20px 20px' }}></div>
          <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className='shimmer' style={{ height: '22px', width: '60%', borderRadius: '6px' }}></div>
            <div className='shimmer' style={{ height: '14px', width: '40%', borderRadius: '6px' }}></div>
            <div style={{ height: '1px', background: '#e9e9eb', margin: '12px 0' }}></div>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className='shimmer' style={{ height: '14px', width: '70%', borderRadius: '4px' }}></div>
                  <div className='shimmer' style={{ height: '12px', width: '30%', borderRadius: '4px' }}></div>
                  <div className='shimmer' style={{ height: '10px', width: '90%', borderRadius: '4px' }}></div>
                </div>
                <div className='shimmer' style={{ width: '120px', height: '100px', borderRadius: '12px', flexShrink: 0 }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: 'var(--font-main)' }}>

      {/* ─── Sticky Header ─── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'white',
        borderBottom: '1px solid #e9e9eb',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={() => navigate("/")} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500,
        }}>
          <FaArrowLeft size={14} />
        </button>

        {restaurant && (
          <div style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
            <p style={{
              fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{restaurant.name}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              {restaurant.locality}
            </p>
          </div>
        )}

        <button onClick={() => navigate("/cart")} style={{
          position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
        }}>
          <FiShoppingCart size={22} style={{ color: 'var(--text-primary)' }} />
          {cartItems.length > 0 && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-8px',
              background: '#fc8019', color: 'white',
              fontSize: '10px', fontWeight: 700,
              width: '18px', height: '18px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{cartItems.length}</span>
          )}
        </button>
      </div>

      {/* ─── Restaurant Info Card ─── */}
      {restaurant && (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 16px' }}>
          <div style={{
            background: 'white',
            border: '1px solid #e9e9eb',
            borderRadius: '20px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: '22px', fontWeight: 800,
                  color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
                  margin: 0, lineHeight: 1.2,
                }}>{restaurant.name}</h1>

                <p style={{
                  fontSize: '13px', color: 'var(--text-secondary)',
                  marginTop: '4px', lineHeight: 1.4,
                }}>{restaurant.cuisines?.join(', ')}</p>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)',
                }}>
                  <FaMapMarkerAlt size={10} style={{ color: 'var(--text-muted)' }} />
                  {restaurant.locality}{restaurant.areaName ? `, ${restaurant.areaName}` : ''}
                </div>
              </div>

              {restaurant.avgRating && (
                <div style={{
                  border: '1px solid #e9e9eb',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    color: '#3d9b6d', fontWeight: 800, fontSize: '15px',
                  }}>
                    <FaStar size={10} />
                    {restaurant.avgRatingString}
                  </div>
                  <div style={{
                    borderTop: '1px solid #e9e9eb', marginTop: '4px', paddingTop: '4px',
                    fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600,
                  }}>{restaurant.totalRatingsString}</div>
                </div>
              )}
            </div>

            {/* Delivery info bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              marginTop: '16px', paddingTop: '14px',
              borderTop: '1px solid #f2f2f3',
            }}>
              {restaurant.slaString && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <FaClock size={12} style={{ color: 'var(--text-muted)' }} />
                  {restaurant.slaString}
                </div>
              )}
              {restaurant.costForTwoMessage && (
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {restaurant.costForTwoMessage}
                </div>
              )}
            </div>
          </div>

          {/* ─── MENU TITLE ─── */}
          <div style={{
            textAlign: 'center',
            padding: '28px 0 8px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '3px',
          }}>— M E N U —</div>
        </div>
      )}

      {/* ─── Menu Categories ─── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px 120px' }}>
        {error || categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 600 }}>
              {error || 'Menu is not available right now'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Swiggy's servers may be busy
            </p>
            <button className='btn-primary' onClick={fetchMenu} style={{
              marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              <FaRedo size={12} /> Try Again
            </button>
          </div>
        ) : (
          <div>
            {categories.map((cat, idx) => (
              <div key={idx} className='fade-in-up' style={{ animationDelay: `${idx * 30}ms` }}>
                {/* Category divider */}
                {idx > 0 && <div style={{ height: '8px', background: 'var(--bg)', margin: '0 -16px' }}></div>}

                {/* Category header */}
                <button
                  onClick={() => toggleCategory(idx)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '18px 0',
                    background: 'white', border: 'none', cursor: 'pointer',
                  }}
                >
                  <h2 style={{
                    fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)', margin: 0, textAlign: 'left',
                  }}>
                    {cat.title}
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px', fontSize: '15px' }}>
                      ({cat.items.length})
                    </span>
                  </h2>
                  <IoChevronDown size={20} style={{
                    color: 'var(--text-primary)',
                    transition: 'transform 0.3s',
                    transform: expandedCategories[idx] ? 'rotate(180deg)' : 'rotate(0)',
                  }} />
                </button>

                {/* Items */}
                {expandedCategories[idx] && (
                  <div>
                    {cat.items.map((item, itemIdx) => (
                      <div key={item.id}>
                        <SwiggyMenuCard data={item} restaurantName={restaurant?.name || ''} />
                        {itemIdx < cat.items.length - 1 && (
                          <div style={{ height: '1px', background: '#f2f2f3' }}></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Floating Cart ─── */}
      {cartItems.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          padding: '0 16px 16px',
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate("/cart")} style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: '#60b246', color: 'white',
              padding: '16px 24px', borderRadius: '14px',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 -2px 20px rgba(96,178,70,0.3)',
              fontFamily: 'var(--font-display)',
            }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>
                  {cartCount} item{cartCount > 1 ? 's' : ''}
                </span>
                <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>₹{totalAmount}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}>
                VIEW CART <FiShoppingCart size={16} />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SwiggyShop
