import React, { useEffect, useState } from 'react'
import Nav from './NaV.JSX'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FiMapPin, FiPackage, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi'

function DeliveryBoy() {
  const { userData, socket } = useSelector(state => state.user)
  const [currentOrder, setCurrentOrder] = useState()
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [availableAssignments, setAvailableAssignments] = useState(null)
  const [otp, setOtp] = useState("")
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return
    let watchId
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        setDeliveryBoyLocation({ lat: latitude, lon: longitude })
        socket.emit('updateLocation', {
          latitude,
          longitude,
          userId: userData._id
        })
      },
      (error) => console.log(error),
      { enableHighAccuracy: true })
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [socket, userData])

  const ratePerDelivery = 50
  const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)
  const totalDeliveriesCount = todayDeliveries.reduce((sum, d) => sum + d.count, 0)

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true })
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true })
      setCurrentOrder(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const acceptOrder = async (assignmentId) => {
    try {
      await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true })
      await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!socket) return
    socket.on('newAssignment', (data) => {
      setAvailableAssignments(prev => ([...(prev || []), data]))
    })
    return () => socket.off('newAssignment')
  }, [socket])
  
  const sendOtp = async () => {
    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
        orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id
      }, { withCredentials: true })
      setShowOtpBox(true)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setMessage("")
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
        orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp
      }, { withCredentials: true })
      setMessage(result.data.message)
      setTimeout(() => location.reload(), 1500)
    } catch (error) {
      console.log(error)
      setMessage("Invalid OTP. Try again.")
    }
  }

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true })
      setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }
 
  useEffect(() => {
    getAssignments()
    getCurrentOrder()
    handleTodayDeliveries()
  }, [userData])

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#fff9f6', fontFamily: 'var(--font-main)' }}>
      <Nav />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 16px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header / Profile Card */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f5f5f6' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: '0 0 4px' }}>
              Hi, {userData.fullName}! 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#60b246' }}></span>
              Online & Ready to Deliver
            </p>
          </div>
          {deliveryBoyLocation && (
            <div style={{ textAlign: 'right', background: '#f8f9fa', padding: '10px 14px', borderRadius: '12px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Current Location</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiMapPin size={12} color="#fc8019" /> {deliveryBoyLocation.lat.toFixed(4)}, {deliveryBoyLocation.lon.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f5f5f6' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff3e0', color: '#fc8019', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <FiPackage size={20} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>Today's Deliveries</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>{totalDeliveriesCount}</h3>
          </div>
          <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f5f5f6' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e8f5e9', color: '#60b246', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <FiDollarSign size={20} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>Today's Earnings</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>₹{totalEarning}</h3>
          </div>
        </div>

        {/* Chart */}
        {todayDeliveries.length > 0 && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f5f5f6' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiClock /> Delivery Timeline
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={todayDeliveries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 12, fill: '#93959f' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#93959f' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [`${value} orders`, 'Deliveries']} 
                  labelFormatter={label => `${label}:00`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill='#fc8019' radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Current Order OR Available Orders */}
        {currentOrder ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 8px 30px rgba(252,128,25,0.08)', border: '2px solid #fc8019' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: '#fc8019', color: 'white', borderRadius: '50%' }}>
                  <FiPackage size={14} />
                </span>
                Active Delivery
              </h2>
              <span style={{ background: '#fff3e0', color: '#fc8019', fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '8px' }}>
                In Progress
              </span>
            </div>
            
            <div style={{ background: '#f8f9fa', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>
                {currentOrder?.shopOrder.shop.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '10px 0' }}>
                <FiMapPin size={14} color="#1e88e5" style={{ marginTop: '3px', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Deliver to:</span><br/>
                  {currentOrder.deliveryAddress.text}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentOrder.shopOrder.shopOrderItems.length}</span> items</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{currentOrder.shopOrder.subtotal}</span> value</p>
              </div>
            </div>

            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0', marginBottom: '20px', height: '250px' }}>
              <DeliveryBoyTracking data={{ 
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData.location.coordinates[1],
                  lon: userData.location.coordinates[0]
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude
                }
              }} />
            </div>

            {!showOtpBox ? (
              <button 
                onClick={sendOtp} 
                disabled={loading}
                style={{ 
                  width: '100%', background: '#60b246', color: 'white', border: 'none', 
                  borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: 800, 
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 12px rgba(96, 178, 70, 0.2)', transition: 'all 0.2s'
                }}
              >
                {loading ? <ClipLoader size={20} color='white' /> : <><FiCheckCircle size={18} /> Mark As Delivered</>}
              </button>
            ) : (
              <div style={{ background: '#fff9f6', padding: '20px', borderRadius: '16px', border: '1px solid #fce8da' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px', textAlign: 'center' }}>
                  Ask <span style={{ color: '#fc8019', fontWeight: 800 }}>{currentOrder.user.fullName}</span> for the Delivery OTP
                </p>
                <input 
                  type="text" 
                  placeholder='Enter 4-digit OTP' 
                  onChange={(e) => setOtp(e.target.value)} 
                  value={otp}
                  style={{ 
                    width: '100%', border: '2px solid #f0f0f0', padding: '14px', borderRadius: '12px', 
                    fontSize: '18px', fontWeight: 700, textAlign: 'center', letterSpacing: '4px',
                    outline: 'none', transition: 'border 0.2s', marginBottom: '16px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#fc8019'}
                  onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                  maxLength={4}
                />
                
                {message && (
                  <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, color: message.includes('Success') ? '#60b246' : '#e23744', margin: '0 0 16px' }}>
                    {message}
                  </p>
                )}

                <button 
                  onClick={verifyOtp}
                  style={{ 
                    width: '100%', background: '#fc8019', color: 'white', border: 'none', 
                    borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 800, 
                    cursor: 'pointer', fontFamily: 'var(--font-display)'
                  }}
                >
                  Verify & Complete Delivery
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f5f5f6' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiPackage /> Available Orders ({availableAssignments?.length || 0})
            </h2>

            {availableAssignments?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {availableAssignments.map((a, index) => (
                  <div key={index} style={{ border: '1px solid #f0f0f0', borderRadius: '16px', padding: '16px', background: '#fafafa', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
                          {a?.shopName}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', margin: '0 0 8px' }}>
                          <FiMapPin size={12} color="#fc8019" style={{ marginTop: '3px', flexShrink: 0 }} />
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {a?.deliveryAddress.text}
                          </p>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                          {a.items.length} items • ₹{a.subtotal}
                        </p>
                      </div>
                      <button 
                        onClick={() => acceptOrder(a.assignmentId)}
                        style={{ 
                          background: '#fc8019', color: 'white', border: 'none', borderRadius: '10px', 
                          padding: '10px 16px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', 
                          fontFamily: 'var(--font-display)', flexShrink: 0, marginLeft: '12px'
                        }}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f5f5f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#d4d5d9' }}>
                  <FiPackage size={32} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>No new orders right now</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Stay online to receive new delivery requests in your area.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoy
