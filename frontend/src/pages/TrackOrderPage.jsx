import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useSelector } from 'react-redux'
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import { FaArrowLeft } from 'react-icons/fa'
import { FiClock, FiMapPin, FiPackage, FiPhone, FiTruck } from 'react-icons/fi'

function TrackOrderPage() {
    const { orderId } = useParams()
    const [currentOrder, setCurrentOrder] = useState() 
    const navigate = useNavigate()
    const { socket } = useSelector(state => state.user)
    const [liveLocations, setLiveLocations] = useState({})

    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
            setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (!socket) return

        const handleLocationUpdate = ({ deliveryBoyId, latitude, longitude }) => {
            setLiveLocations(prev => ({
                ...prev,
                [deliveryBoyId]: { lat: latitude, lon: longitude }
            }))
        }

        const handleStatusUpdate = ({ orderId: updatedOrderId, shopId, status }) => {
            if (updatedOrderId === orderId) {
                setCurrentOrder(prevOrder => {
                    if (!prevOrder) return prevOrder
                    const newShopOrders = prevOrder.shopOrders.map(so => {
                        const currentShopId = so.shop?._id || so.shop
                        if (currentShopId === shopId) {
                            return { ...so, status }
                        }
                        return so
                    })
                    return { ...prevOrder, shopOrders: newShopOrders }
                })
            }
        }

        socket.on('updateDeliveryLocation', handleLocationUpdate)
        socket.on('update-status', handleStatusUpdate)

        return () => {
            socket.off('updateDeliveryLocation', handleLocationUpdate)
            socket.off('update-status', handleStatusUpdate)
        }
    }, [socket, orderId])

    useEffect(() => {
        handleGetOrder()
    }, [orderId])

    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { color: '#db7c38', bg: '#fff3e0', label: 'Order Placed', step: 0 }
            case 'preparing': return { color: '#f57c00', bg: '#fff8e1', label: 'Preparing', step: 1 }
            case 'out of delivery': return { color: '#1e88e5', bg: '#e3f2fd', label: 'On the way', step: 2 }
            case 'delivered': return { color: '#60b246', bg: '#e8f5e9', label: 'Delivered', step: 3 }
            case 'cancelled': return { color: '#e23744', bg: '#ffebee', label: 'Cancelled', step: -1 }
            default: return { color: '#93959f', bg: '#f5f5f6', label: status || 'Processing', step: 0 }
        }
    }

    const STATUS_STEPS = ['Placed', 'Preparing', 'On the way', 'Delivered']

    return (
        <div style={{ minHeight: '100vh', background: '#f1f1f6', fontFamily: 'var(--font-main)' }}>
            {/* Sticky Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
                        <FaArrowLeft size={16} />
                    </button>
                    <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
                        Track Order
                    </h1>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentOrder?.shopOrders?.map((shopOrder, index) => {
                    const statusInfo = getStatusInfo(shopOrder.status)
                    
                    return (
                        <div key={index} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                            {/* Shop Header */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f2f2f3', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                                        {shopOrder.shop.name}
                                    </h2>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                                        {shopOrder.shopOrderItems?.length} items • ₹{shopOrder.subtotal}
                                    </p>
                                </div>
                                <span style={{ background: statusInfo.bg, color: statusInfo.color, fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '8px' }}>
                                    {statusInfo.label}
                                </span>
                            </div>

                            {/* Progress Tracker */}
                            {statusInfo.step >= 0 && (
                                <div style={{ padding: '24px 20px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', height: '3px', background: '#f0f0f0', zIndex: 0, borderRadius: '2px' }} />
                                        <div style={{
                                            position: 'absolute', top: '12px', left: '12px', height: '3px', background: '#fc8019', zIndex: 1, borderRadius: '2px',
                                            width: `${(statusInfo.step / (STATUS_STEPS.length - 1)) * 100}%`,
                                            transition: 'width 0.5s ease-in-out',
                                        }} />
                                        {STATUS_STEPS.map((step, idx) => {
                                            const done = idx <= statusInfo.step
                                            return (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                                                    <div style={{
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        background: done ? '#fc8019' : 'white',
                                                        border: `3px solid ${done ? '#fc8019' : '#f0f0f0'}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {done && (
                                                            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '11px', fontWeight: done ? 700 : 600, color: done ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
                                                        {step}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Delivery Info */}
                            {statusInfo.step < 3 && statusInfo.step >= 0 && (
                                <div style={{ padding: '16px 20px', background: '#fff9f6', borderTop: '1px solid #fce8da', borderBottom: '1px solid #fce8da' }}>
                                    {shopOrder.assignedDeliveryBoy ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffeadb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fc8019' }}>
                                                    <FiTruck size={20} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>{shopOrder.assignedDeliveryBoy.fullName}</p>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Delivery Partner</p>
                                                </div>
                                            </div>
                                            <a href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e88e5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                                <FiPhone size={16} />
                                            </a>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f5f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4d5d9' }}>
                                                <FiClock size={20} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>Assigning Delivery Partner</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Please wait while we assign someone nearby</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Live Tracking Map */}
                            {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" && (
                                <div style={{ height: '300px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                                    <DeliveryBoyTracking data={{
                                        deliveryBoyLocation: liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                                            lat: shopOrder.assignedDeliveryBoy.location?.coordinates?.[1] || 0,
                                            lon: shopOrder.assignedDeliveryBoy.location?.coordinates?.[0] || 0
                                        },
                                        customerLocation: {
                                            lat: currentOrder.deliveryAddress?.latitude,
                                            lon: currentOrder.deliveryAddress?.longitude
                                        }
                                    }} />
                                    {/* Overlay Gradient */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '24px', background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', zIndex: 10, pointerEvents: 'none' }} />
                                </div>
                            )}

                            {/* Delivery Address */}
                            <div style={{ padding: '16px 20px', background: '#fafafa', borderTop: '1px solid #f2f2f3' }}>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Address</p>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <FiMapPin size={14} color="#fc8019" style={{ marginTop: '3px', flexShrink: 0 }} />
                                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                                        {currentOrder.deliveryAddress?.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default TrackOrderPage
