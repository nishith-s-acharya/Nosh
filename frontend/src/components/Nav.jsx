import React, { useEffect, useRef, useState } from 'react'
import { FaLocationDot, FaChevronDown, FaPlus } from "react-icons/fa6"
import { IoIosSearch } from "react-icons/io"
import { FiShoppingCart, FiLogOut, FiMapPin } from "react-icons/fi"
import { RxCross2 } from "react-icons/rx"
import { TbReceipt2, TbCurrentLocation } from "react-icons/tb"
import { MdOutlineSearch, MdOutlineLocationOn, MdOutlineShoppingBag } from "react-icons/md"
import { HiOutlineUser } from "react-icons/hi2"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { setCurrentAddress, setCurrentCity, setCurrentState, setSearchItems, setUserData } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

const GEO_API_KEY = import.meta.env.VITE_GEOAPIKEY

const POPULAR_CITIES = [
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
]

const ROLE_LABEL = { user: '🍽️ Customer', owner: '🏪 Shop Owner', deliveryBoy: '🚴 Delivery' }
const ROLE_COLOR = { user: '#e8f5e9', owner: '#fff3e0', deliveryBoy: '#e3f2fd' }
const ROLE_TEXT  = { user: '#2e7d32', owner: '#e65100', deliveryBoy: '#1565c0' }

function Nav({ onSearchChange }) {
  const { userData, currentCity, cartItems } = useSelector(s => s.user)
  const { myShopData } = useSelector(s => s.owner)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [showInfo, setShowInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState('')

  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [locLoading, setLocLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)

  const locationInputRef = useRef(null)
  const debounceRef = useRef(null)
  const profileRef = useRef(null)

  // Close profile on outside click
  useEffect(() => {
    if (!showInfo) return
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowInfo(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showInfo])

  // Search
  const handleSearchItems = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true })
      dispatch(setSearchItems(data))
    } catch (e) { console.log(e) }
  }
  useEffect(() => {
    if (query) { handleSearchItems() } else { dispatch(setSearchItems(null)) }
    onSearchChange?.(query)
  }, [query])

  const handleLogOut = async () => {
    try { await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true }); dispatch(setUserData(null)) }
    catch (e) { console.log(e) }
  }

  // Location picker
  const openLocationPicker = () => {
    setShowLocationPicker(true); setLocationQuery(''); setSuggestions([])
    setTimeout(() => locationInputRef.current?.focus(), 100)
  }
  const closeLocationPicker = () => { setShowLocationPicker(false); setLocationQuery(''); setSuggestions([]) }

  const applyLocation = (lat, lon, city, state, addr) => {
    dispatch(setLocation({ lat, lon }))
    dispatch(setCurrentCity(city))
    if (state) dispatch(setCurrentState(state))
    if (addr) { dispatch(setCurrentAddress(addr)); dispatch(setAddress(addr)) }
    closeLocationPicker()
  }

  const searchLocations = (q) => {
    setLocationQuery(q)
    clearTimeout(debounceRef.current)
    if (!q.trim()) { setSuggestions([]); return }
    setLocLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&apiKey=${GEO_API_KEY}&limit=6&format=json&filter=countrycode:in`)
        setSuggestions((data.results || []).map(r => ({ label: r.formatted, city: r.city || r.county || r.state, state: r.state, lat: r.lat, lon: r.lon })).filter(r => r.city))
      } catch (e) { console.log(e) }
      setLocLoading(false)
    }, 350)
  }

  const handleSelectSuggestion = (s) => applyLocation(s.lat, s.lon, s.city, s.state, s.label)

  const handleSelectCity = async (city) => {
    try {
      const { data } = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${city.lat}&lon=${city.lon}&format=json&apiKey=${GEO_API_KEY}`)
      const r = data.results?.[0]
      applyLocation(city.lat, city.lon, r?.city || city.name, r?.state, r?.formatted)
    } catch { applyLocation(city.lat, city.lon, city.name, null, city.name) }
  }

  const handleUseCurrentLocation = () => {
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords
      try {
        const { data } = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${GEO_API_KEY}`)
        const r = data.results?.[0]
        applyLocation(lat, lon, r?.city || r?.county || 'Your Location', r?.state, r?.address_line2 || r?.formatted)
      } catch { applyLocation(lat, lon, 'Your Location', null, null) }
      setGpsLoading(false)
    }, () => { setGpsLoading(false); alert('Location access denied.') }, { enableHighAccuracy: false, timeout: 10000 })
  }

  const initial = userData?.fullName?.slice(0, 1)?.toUpperCase()

  return (
    <>
      {/* ── Navbar ── */}
      <div
        className='w-full h-[72px] flex items-center justify-between md:justify-center gap-[30px] px-5 md:px-8 fixed top-0 z-[9999]'
        style={{ fontFamily: 'var(--font-main)', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {/* Mobile search */}
        {showSearch && userData.role === 'user' && (
          <div className='w-[92%] h-[60px] bg-white/95 backdrop-blur-xl shadow-lg rounded-2xl items-center gap-3 flex fixed top-[76px] left-[4%] md:hidden border border-gray-100'>
            <div className='flex items-center w-[30%] overflow-hidden gap-2 px-3 border-r border-gray-200'>
              <FaLocationDot size={18} className="text-[#fc8019]" />
              <div className='w-[80%] truncate text-gray-600 text-sm font-medium'>{currentCity}</div>
            </div>
            <div className='w-[70%] flex items-center gap-2'>
              <IoIosSearch size={20} className='text-gray-400' />
              <input type="text" placeholder='Search food, restaurants...' className='px-2 text-sm text-gray-700 outline-0 w-full placeholder:text-gray-400' onChange={e => setQuery(e.target.value)} value={query} />
            </div>
          </div>
        )}

        {/* Logo */}
        <h1 className='text-2xl font-extrabold text-[#fc8019] cursor-pointer tracking-tight' style={{ fontFamily: 'var(--font-display)' }} onClick={() => navigate('/')}>
          Nosh<span className='text-[8px] text-gray-400 font-normal align-super ml-0.5'>®</span>
        </h1>

        {/* Desktop search */}
        {userData.role === 'user' && (
          <div className='md:w-[55%] lg:w-[40%] h-[44px] bg-gray-50/80 border border-gray-200/70 rounded-full items-center gap-3 hidden md:flex px-1 hover:border-gray-300 transition-colors duration-200'>
            <button onClick={e => { e.stopPropagation(); openLocationPicker() }} className='flex items-center gap-1.5 px-3 h-full shrink-0 hover:bg-orange-50 rounded-l-full transition-colors' style={{ background: 'none', border: 'none', borderRight: '1px solid rgba(229,231,235,0.8)', cursor: 'pointer' }}>
              <FaLocationDot size={14} className="text-[#fc8019]" />
              <span className='max-w-[110px] truncate text-gray-700 text-sm font-semibold'>{currentCity || 'Set Location'}</span>
              <FaChevronDown size={10} className='text-gray-400' />
            </button>
            <div className='flex-1 flex items-center gap-2 pr-2'>
              <IoIosSearch size={18} className='text-gray-400' />
              <input type="text" placeholder='Search food, restaurants...' className='text-sm text-gray-700 outline-0 w-full bg-transparent placeholder:text-gray-400' onChange={e => setQuery(e.target.value)} value={query} />
            </div>
          </div>
        )}

        {/* Right actions */}
        <div className='flex items-center gap-3'>
          {/* Mobile search toggle */}
          {userData.role === 'user' && (
            showSearch
              ? <RxCross2 size={22} className='text-gray-500 md:hidden cursor-pointer' onClick={() => setShowSearch(false)} />
              : <IoIosSearch size={22} className='text-gray-500 md:hidden cursor-pointer' onClick={() => setShowSearch(true)} />
          )}

          {/* Owner actions */}
          {userData.role === 'owner' ? (
            <>
              {myShopData && (
                <button className='hidden md:flex items-center gap-1.5 px-4 py-2 cursor-pointer rounded-full bg-[#fc8019] text-white text-sm font-medium shadow-sm hover:bg-[#e06b00] transition-all' onClick={() => navigate('/add-item')}>
                  <FaPlus size={14} /><span>Add Item</span>
                </button>
              )}
              <div className='flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-full text-gray-700 text-sm hover:bg-gray-100 transition-all' onClick={() => navigate('/my-orders')}>
                <TbReceipt2 size={18} /><span className='hidden md:block'>Orders</span>
              </div>
            </>
          ) : (
            <>
              {userData.role === 'user' && (
                <div className='relative cursor-pointer p-2 rounded-full hover:bg-orange-50 transition-all group' onClick={() => navigate('/cart')}>
                  <FiShoppingCart size={22} className='text-gray-700 group-hover:text-[#fc8019] transition-colors' />
                  {cartItems.length > 0 && <span className='absolute -right-0.5 -top-0.5 bg-[#fc8019] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center'>{cartItems.length}</span>}
                </div>
              )}
              <button className='hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 text-sm hover:bg-gray-100 transition-all' onClick={() => navigate('/my-orders')}>
                <TbReceipt2 size={16} />My Orders
              </button>
            </>
          )}

          {/* Avatar + dropdown */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowInfo(p => !p)}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #fc8019, #f7b731)',
                color: 'white', fontSize: '15px', fontWeight: 700,
                border: 'none', cursor: 'pointer',
                boxShadow: showInfo ? '0 0 0 3px rgba(252,128,25,0.3)' : '0 2px 8px rgba(252,128,25,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {initial}
            </button>

            {/* ── Premium Profile Dropdown ── */}
            {showInfo && (
              <div style={{
                position: 'fixed', top: '78px',
                right: userData.role === 'deliveryBoy' ? 'clamp(12px, 20%, 40%)' : 'clamp(12px, 10%, 25%)',
                width: '260px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
                border: '1px solid #f0f0f0',
                overflow: 'hidden',
                zIndex: 9999,
                animation: 'fadeInDown 0.18s ease',
                fontFamily: 'var(--font-main)',
              }}>
                {/* Header band */}
                <div style={{
                  background: 'linear-gradient(135deg, #fff8f0, #fff3e0)',
                  padding: '20px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  borderBottom: '1px solid #f5e6d3',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #fc8019, #f7b731)',
                    color: 'white', fontSize: '20px', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(252,128,25,0.35)',
                    flexShrink: 0,
                  }}>
                    {initial}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {userData.fullName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {userData.email}
                    </div>
                    <div style={{
                      display: 'inline-block', marginTop: '6px',
                      background: ROLE_COLOR[userData.role] || '#f5f5f5',
                      color: ROLE_TEXT[userData.role] || '#555',
                      fontSize: '10px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.3px',
                    }}>
                      {ROLE_LABEL[userData.role] || userData.role}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '8px 0' }}>
                  {userData.role === 'user' && (
                    <MenuItem icon={<FiMapPin size={16} />} label="Change Location" onClick={() => { setShowInfo(false); openLocationPicker() }} />
                  )}
                  <MenuItem icon={<TbReceipt2 size={16} />} label="My Orders" onClick={() => { setShowInfo(false); navigate('/my-orders') }} />
                  {userData.role === 'user' && (
                    <MenuItem icon={<MdOutlineShoppingBag size={16} />} label="My Cart" onClick={() => { setShowInfo(false); navigate('/cart') }} />
                  )}

                  {/* Divider */}
                  <div style={{ height: '1px', background: '#f2f2f3', margin: '6px 16px' }} />

                  <MenuItem
                    icon={<FiLogOut size={16} />}
                    label="Log Out"
                    onClick={handleLogOut}
                    danger
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Location Picker Modal ── */}
      {showLocationPicker && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 16px 0' }}
          onClick={closeLocationPicker}
        >
          <div style={{ width: '100%', maxWidth: '520px', background: 'white', borderRadius: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden', fontFamily: 'var(--font-main)', animation: 'slideDown 0.25s cubic-bezier(0.34,1.56,0.64,1)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f2f2f3' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e', fontFamily: 'var(--font-display)', margin: 0 }}>Choose your location</h2>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '3px 0 0' }}>Restaurants change based on your location</p>
                </div>
                <button onClick={closeLocationPicker} style={{ background: '#f5f5f6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '18px' }}>×</button>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#f5f5f6', borderRadius: '14px', border: '1.5px solid #e9e9eb' }}>
                <MdOutlineSearch size={20} style={{ position: 'absolute', left: '14px', color: '#9ca3af' }} />
                <input ref={locationInputRef} type="text" placeholder="Search city, area or street..." value={locationQuery} onChange={e => searchLocations(e.target.value)} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '13px 14px 13px 42px', fontSize: '14px', color: '#1a1a2e', fontFamily: 'var(--font-main)' }} />
                {locLoading && <div style={{ position: 'absolute', right: '14px', width: '16px', height: '16px', border: '2px solid #fc8019', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '8px 0' }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSelectSuggestion(s)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#fff8f0'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff3e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MdOutlineLocationOn size={18} style={{ color: '#fc8019' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.city}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {locationQuery && !locLoading && suggestions.length === 0 && (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No locations found for &ldquo;{locationQuery}&rdquo;</div>
            )}

            {!locationQuery && (
              <div style={{ padding: '12px 0 16px' }}>
                <button onClick={handleUseCurrentLocation} disabled={gpsLoading} style={{ width: 'calc(100% - 40px)', margin: '0 20px 16px', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#fff8f0', border: '1.5px solid #fde8d0', borderRadius: '14px', cursor: gpsLoading ? 'wait' : 'pointer' }}>
                  {gpsLoading ? <div style={{ width: '20px', height: '20px', border: '2px solid #fc8019', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} /> : <TbCurrentLocation size={20} style={{ color: '#fc8019', flexShrink: 0 }} />}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fc8019' }}>{gpsLoading ? 'Getting your location...' : 'Use my current location'}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Using GPS</div>
                  </div>
                </button>

                <div style={{ padding: '0 20px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#f2f2f3' }} />
                    <span style={{ fontSize: '11px', color: '#c0c0c0', fontWeight: 600, letterSpacing: '0.5px' }}>POPULAR CITIES</span>
                    <div style={{ flex: 1, height: '1px', background: '#f2f2f3' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '0 20px' }}>
                  {POPULAR_CITIES.map(city => (
                    <button key={city.name} onClick={() => handleSelectCity(city)} style={{ padding: '10px 6px', background: currentCity === city.name ? '#fff8f0' : '#f9fafb', border: `2px solid ${currentCity === city.name ? '#fc8019' : '#f2f2f3'}`, borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: currentCity === city.name ? '#fc8019' : '#4b5563', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#fc8019'; e.currentTarget.style.color = '#fc8019'; e.currentTarget.style.background = '#fff8f0' }} onMouseLeave={e => { e.currentTarget.style.borderColor = currentCity === city.name ? '#fc8019' : '#f2f2f3'; e.currentTarget.style.color = currentCity === city.name ? '#fc8019' : '#4b5563'; e.currentTarget.style.background = currentCity === city.name ? '#fff8f0' : '#f9fafb' }}>
                      <span style={{ fontSize: '18px' }}>🏙️</span>
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}

// Reusable menu item
function MenuItem({ icon, label, onClick, danger }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 20px', background: hovered ? (danger ? '#fff5f5' : '#fff8f0') : 'none',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        color: danger ? '#e11d48' : '#374151',
        fontSize: '14px', fontWeight: 500,
        transition: 'background 0.15s',
      }}
    >
      <span style={{ color: danger ? '#e11d48' : '#fc8019', display: 'flex' }}>{icon}</span>
      {label}
    </button>
  )
}

export default Nav
