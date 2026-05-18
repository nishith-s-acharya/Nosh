import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaImage, FaMapMarkerAlt, FaCity } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';

function CreateEditShop() {
    const navigate = useNavigate()
    const { myShopData } = useSelector(state => state.owner)
    const { currentCity, currentState, currentAddress } = useSelector(state => state.user)
    const [name, setName] = useState(myShopData?.name || "")
    const [address, setAddress] = useState(myShopData?.address || currentAddress)
    const [city, setCity] = useState(myShopData?.city || currentCity)
    const [state, setState] = useState(myShopData?.state || currentState)
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null)
    const [backendImage, setBackendImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (file) {
            setBackendImage(file)
            setFrontendImage(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("city", city)
            formData.append("state", state)
            formData.append("address", address)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, { withCredentials: true })
            dispatch(setMyShopData(result.data))
            setLoading(false)
            navigate("/")
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f1f1f6',
            fontFamily: 'var(--font-main)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 16px'
        }}>
            {/* Header */}
            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        background: 'white', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-primary)', width: '40px', height: '40px', borderRadius: '50%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginRight: '16px'
                    }}
                >
                    <IoIosArrowRoundBack size={24} />
                </button>
                <h1 style={{
                    fontSize: '24px', fontWeight: 800,
                    color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
                    margin: 0,
                }}>{myShopData ? "Edit Your Shop" : "Add Your Shop"}</h1>
            </div>

            <div style={{
                width: '100%', maxWidth: '600px',
                background: 'white', borderRadius: '24px',
                padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: '#fff3e0', color: '#fc8019',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <FaUtensils size={32} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Image Upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Shop Image</label>
                        <div style={{
                            position: 'relative', width: '100%', height: '200px', borderRadius: '16px',
                            background: '#f8f9fa', border: '2px dashed #d4d5d9',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', cursor: 'pointer', transition: 'border 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#fc8019'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#d4d5d9'}
                        >
                            {frontendImage ? (
                                <>
                                    <img src={frontendImage} alt="Shop Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                                         onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                         onMouseOut={(e) => e.currentTarget.style.opacity = 0}>
                                         <p style={{ color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><FaImage /> Change Image</p>
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                                    <FaImage size={32} style={{ marginBottom: '12px' }} />
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Click to upload an image</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px' }}>JPG, PNG or WEBP (Max 5MB)</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImage} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        </div>
                    </div>

                    {/* Shop Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Shop Name</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <FaUtensils size={16} />
                            </div>
                            <input 
                                type="text" placeholder="e.g. Burger King" 
                                onChange={(e) => setName(e.target.value)} value={name}
                                style={{
                                    width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px',
                                    border: '2px solid #f0f0f0', fontSize: '15px', fontWeight: 500,
                                    outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#fc8019'}
                                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                            />
                        </div>
                    </div>

                    {/* City and State */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>City</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <FaCity size={16} />
                                </div>
                                <input 
                                    type="text" placeholder="City" 
                                    onChange={(e) => setCity(e.target.value)} value={city}
                                    style={{
                                        width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px',
                                        border: '2px solid #f0f0f0', fontSize: '15px', fontWeight: 500,
                                        outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#fc8019'}
                                    onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                                />
                            </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>State</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="text" placeholder="State" 
                                    onChange={(e) => setState(e.target.value)} value={state}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: '12px',
                                        border: '2px solid #f0f0f0', fontSize: '15px', fontWeight: 500,
                                        outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#fc8019'}
                                    onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Complete Address</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '20px', color: 'var(--text-muted)' }}>
                                <FaMapMarkerAlt size={16} />
                            </div>
                            <textarea 
                                placeholder="Enter your full shop address..." 
                                onChange={(e) => setAddress(e.target.value)} value={address}
                                rows={3}
                                style={{
                                    width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px',
                                    border: '2px solid #f0f0f0', fontSize: '15px', fontWeight: 500,
                                    outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
                                    resize: 'none', fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#fc8019'}
                                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading || !name || !address || !city || !state}
                        style={{
                            width: '100%', background: '#fc8019', color: 'white',
                            border: 'none', borderRadius: '14px', padding: '18px',
                            fontSize: '16px', fontWeight: 800, cursor: (loading || !name || !address || !city || !state) ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-display)', marginTop: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: (loading || !name || !address || !city || !state) ? 0.6 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {loading ? <ClipLoader size={24} color='white' /> : "Save Shop Details"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateEditShop
