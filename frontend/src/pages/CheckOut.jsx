import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaCreditCard } from 'react-icons/fa'
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileScreenButton } from "react-icons/fa6";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder, clearCart, setTotalAmount } from '../redux/userSlice';

function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap()
    map.setView([location.lat, location.lon], 16, { animate: true })
  }
  return null
}

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData } = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY
  const deliveryFee = totalAmount > 500 ? 0 : 40
  const platformFee = 6
  const gstCharges = Math.round(totalAmount * 0.05)
  const finalAmount = totalAmount + deliveryFee + platformFee + gstCharges
  const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }

  const getCurrentLocation = () => {
    const coords = userData?.location?.coordinates
    if (!coords || coords.length < 2) {
      // Fallback: use GPS geolocation
      navigator.geolocation.getCurrentPosition((pos) => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        dispatch(setLocation({ lat: latitude, lon: longitude }))
        getAddressByLatLng(latitude, longitude)
      }, () => alert('Could not get your current location'))
      return
    }
    const latitude = coords[1]
    const longitude = coords[0]
    dispatch(setLocation({ lat: latitude, lon: longitude }))
    getAddressByLatLng(latitude, longitude)
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
      dispatch(setAddress(result?.data?.results[0].address_line2))
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlaceOrder = async () => {
    // Use addressInput, fallback to geocoded address from Redux
    const deliveryText = addressInput || address || 'Delivery Address'
    
    if (!location?.lat || !location?.lon) {
      alert('Please set a delivery location on the map')
      return
    }

    setPlacing(true)
    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod,
        deliveryAddress: {
          text: deliveryText,
          latitude: location.lat,
          longitude: location.lon
        },
        totalAmount: finalAmount,
        cartItems
      }, { withCredentials: true })

      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data))
        dispatch(clearCart())
        navigate("/order-placed")
      } else {
        const orderId = result.data.orderId
        const razorOrder = result.data.razorOrder
        openRazorpayWindow(orderId, razorOrder)
      }
    } catch (error) {
      console.log("Place order error:", error)
      const msg = error?.response?.data?.message || 'Failed to place order. Please try again.'
      alert(msg)
    }
    setPlacing(false)
  }

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: 'INR',
      name: "Vingo",
      description: "Food Delivery Website",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id,
            orderId
          }, { withCredentials: true })
          dispatch(addMyOrder(result.data))
          dispatch(clearCart())
          navigate("/order-placed")
        } catch (error) {
          console.log(error)
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  useEffect(() => {
    setAddressInput(address)
  }, [address])

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
            onClick={() => navigate("/cart")}
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
            }}>Checkout</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} • ₹{finalAmount}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 16px 120px' }}>

        {/* ═══ STEP 1: Delivery Address ═══ */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          {/* Section header */}
          <div style={{
            padding: '20px 20px 0',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#fc8019', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-display)',
              flexShrink: 0,
            }}>1</div>
            <h2 style={{
              fontSize: '17px', fontWeight: 800,
              color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
              margin: 0,
            }}>Delivery address</h2>
          </div>

          {/* Address input */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                background: '#f5f5f6', borderRadius: '12px',
                padding: '0 14px', gap: '10px',
                border: '1px solid transparent',
              }}>
                <IoLocationSharp size={18} style={{ color: '#fc8019', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder='Enter delivery address...'
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    padding: '12px 0', fontSize: '14px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-main)',
                  }}
                />
              </div>
              <button
                onClick={getLatLngByAddress}
                style={{
                  background: '#fc8019', color: 'white',
                  border: 'none', borderRadius: '12px',
                  padding: '0 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e06b00'}
                onMouseLeave={e => e.currentTarget.style.background = '#fc8019'}
              >
                <IoSearchOutline size={18} />
              </button>
            </div>

            {/* Use current location button */}
            <button
              onClick={getCurrentLocation}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none',
                cursor: 'pointer', padding: '8px 0',
                color: '#fc8019', fontSize: '14px', fontWeight: 600,
              }}
            >
              <TbCurrentLocation size={18} />
              Use current location
            </button>
          </div>

          {/* Map */}
          <div style={{
            height: '220px', width: '100%',
            borderTop: '1px solid #f2f2f3',
          }}>
            <MapContainer className={"w-full h-full"} center={[location?.lat, location?.lon]} zoom={16} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap location={location} />
              <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{ dragend: onDragEnd }} />
            </MapContainer>
          </div>

          {/* Detected address */}
          {address && (
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #f2f2f3',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
            }}>
              <IoLocationSharp size={16} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
              <p style={{
                fontSize: '13px', color: 'var(--text-secondary)',
                margin: 0, lineHeight: 1.5,
              }}>{address}</p>
            </div>
          )}
        </div>

        {/* ═══ STEP 2: Payment Method ═══ */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '18px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#fc8019', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-display)',
              flexShrink: 0,
            }}>2</div>
            <h2 style={{
              fontSize: '17px', fontWeight: 800,
              color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
              margin: 0,
            }}>Payment</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* COD */}
            <div
              onClick={() => setPaymentMethod("cod")}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px',
                borderRadius: '14px',
                border: `2px solid ${paymentMethod === 'cod' ? '#60b246' : '#e9e9eb'}`,
                background: paymentMethod === 'cod' ? '#f1f8e8' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: `2px solid ${paymentMethod === 'cod' ? '#60b246' : '#d4d5d9'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {paymentMethod === 'cod' && (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60b246' }} />
                )}
              </div>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MdDeliveryDining size={22} style={{ color: '#4caf50' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Cash on Delivery
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Pay when your food arrives
                </p>
              </div>
            </div>

            {/* Online */}
            <div
              onClick={() => setPaymentMethod("online")}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px',
                borderRadius: '14px',
                border: `2px solid ${paymentMethod === 'online' ? '#60b246' : '#e9e9eb'}`,
                background: paymentMethod === 'online' ? '#f1f8e8' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: `2px solid ${paymentMethod === 'online' ? '#60b246' : '#d4d5d9'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {paymentMethod === 'online' && (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60b246' }} />
                )}
              </div>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FaCreditCard size={18} style={{ color: '#1e88e5' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Pay Online
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  UPI, Credit / Debit Card, Net Banking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ STEP 3: Order Summary ═══ */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '18px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#fc8019', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-display)',
              flexShrink: 0,
            }}>3</div>
            <h2 style={{
              fontSize: '17px', fontWeight: 800,
              color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
              margin: 0,
            }}>Bill Details</h2>
          </div>

          {/* Line items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cartItems.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Veg/Non-veg dot */}
                  <div style={{
                    width: '14px', height: '14px',
                    border: `2px solid ${item.foodType === 'veg' ? '#0f8a65' : '#e43b4f'}`,
                    borderRadius: '3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: item.foodType === 'veg' ? '#0f8a65' : '#e43b4f',
                    }} />
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {item.name} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span>
                  </span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}

            <div style={{ height: '1px', background: '#f2f2f3', margin: '4px 0' }}></div>

            {/* Item total */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Item Total</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>₹{totalAmount}</span>
            </div>

            {/* Delivery */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Delivery Fee</span>
              <span style={{
                fontSize: '14px', fontWeight: 500,
                color: deliveryFee === 0 ? '#60b246' : 'var(--text-primary)',
              }}>
                {deliveryFee === 0 ? (
                  <><span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '4px' }}>₹40</span>FREE</>
                ) : `₹${deliveryFee}`}
              </span>
            </div>

            {/* Platform */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Platform fee</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>₹{platformFee}</span>
            </div>

            {/* GST */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>GST and Restaurant Charges</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>₹{gstCharges}</span>
            </div>

            {/* Total */}
            <div style={{
              borderTop: '2px solid var(--text-primary)',
              marginTop: '6px', paddingTop: '14px',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>TO PAY</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{finalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky Place Order Bar ─── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 40, background: 'white',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        padding: '12px 16px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: placing ? '#93959f' : '#60b246',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '14px',
              border: 'none',
              cursor: placing ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-display)',
              transition: 'background 0.15s',
              opacity: placing ? 0.8 : 1,
            }}
          >
            {placing ? (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.5px' }}>
                  PLACING ORDER...
                </span>
              </div>
            ) : (
              <>
                <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.3px' }}>
                  {paymentMethod === "cod" ? "PLACE ORDER" : "PAY & PLACE ORDER"}
                </span>
                <span style={{ fontWeight: 800, fontSize: '16px' }}>₹{finalAmount}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckOut
