import React, { useEffect, useRef, useState } from 'react'
import Nav from './NaV.JSX'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6"
import { useSelector } from 'react-redux'
import FoodCard from './FoodCard'
import SwiggyRestaurantCard from './SwiggyRestaurantCard'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(state => state.user)
  const { location } = useSelector(state => state.map)
  const cateScrollRef = useRef()
  const shopScrollRef = useRef()
  const navigate = useNavigate()

  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)
  const [updatedItemsList, setUpdatedItemsList] = useState([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Swiggy restaurant data
  const [swiggyTopRestaurants, setSwiggyTopRestaurants] = useState([])
  const [swiggyAllRestaurants, setSwiggyAllRestaurants] = useState([])
  const [swiggyLoading, setSwiggyLoading] = useState(false)

  // Derived flags
  const hasLocalShops = shopInMyCity && shopInMyCity.length > 0
  const hasLocalItems = updatedItemsList && updatedItemsList.length > 0

  // ── Search logic ──────────────────────────────────────────────────
  // Local mode: results come from Redux (backend query)
  // Swiggy mode: filter loaded restaurants client-side
  const swiggySearchResults = searchQuery.trim()
    ? swiggyAllRestaurants.filter(r => {
        const q = searchQuery.toLowerCase()
        return (
          r.name?.toLowerCase().includes(q) ||
          r.cuisines?.some(c => c.toLowerCase().includes(q)) ||
          r.locality?.toLowerCase().includes(q)
        )
      })
    : []

  const isSearchActive = searchQuery.trim().length > 0
  const hasLocalSearchResults = isSearchActive && searchItems && searchItems.length > 0
  const hasSwiggySearchResults = isSearchActive && !hasLocalShops && swiggySearchResults.length > 0
  const noResults = isSearchActive && !hasLocalSearchResults && !hasSwiggySearchResults

  // ── Category filter ───────────────────────────────────────────────
  const handleFilterByCategory = (category) => {
    setActiveCategory(category)
    if (category === "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      setUpdatedItemsList(itemsInMyCity?.filter(i => i.category === category))
    }
  }

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity)
  }, [itemsInMyCity])

  // ── Swiggy fetch ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchSwiggyRestaurants = async () => {
      setSwiggyLoading(true)
      try {
        const lat = location?.lat || 12.9716
        const lng = location?.lon || 77.5946
        const { data } = await axios.get(
          `${serverUrl}/api/swiggy/restaurants?lat=${lat}&lng=${lng}`,
          { withCredentials: true }
        )
        setSwiggyTopRestaurants(data.topRestaurants || [])
        setSwiggyAllRestaurants(data.allRestaurants || [])
      } catch (err) {
        console.log('Swiggy fetch error:', err)
      }
      setSwiggyLoading(false)
    }
    fetchSwiggyRestaurants()
  }, [location?.lat, location?.lon])

  // ── Carousel scroll helpers ───────────────────────────────────────
  const updateButton = (ref, setLeft, setRight) => {
    const el = ref.current
    if (el) {
      setLeft(el.scrollLeft > 0)
      setRight(el.scrollLeft + el.clientWidth < el.scrollWidth)
    }
  }

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" })
    }
  }

  const onCateScroll = () => updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
  const onShopScroll = () => updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)

  useEffect(() => {
    updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
  }, [swiggyTopRestaurants, swiggyAllRestaurants, shopInMyCity, itemsInMyCity])

  useEffect(() => {
    const cateEl = cateScrollRef.current
    const shopEl = shopScrollRef.current
    if (cateEl) cateEl.addEventListener('scroll', onCateScroll)
    if (shopEl) shopEl.addEventListener('scroll', onShopScroll)
    return () => {
      if (cateEl) cateEl.removeEventListener('scroll', onCateScroll)
      if (shopEl) shopEl.removeEventListener('scroll', onShopScroll)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'var(--bg)', overflowY: 'auto',
      fontFamily: 'var(--font-main)',
    }}>
      <Nav onSearchChange={setSearchQuery} />

      {/* ═══ SEARCH RESULTS ════════════════════════════════════════ */}
      {isSearchActive && (
        <div style={{ width: '100%', maxWidth: '1200px', padding: '84px 20px 0' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-card)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '20px', background: '#fc8019', borderRadius: '4px' }} />
                Results for &ldquo;{searchQuery}&rdquo;
              </h2>
              {(hasLocalSearchResults || hasSwiggySearchResults) && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {hasLocalSearchResults ? searchItems.length : swiggySearchResults.length} found
                </span>
              )}
            </div>

            {/* Local food items */}
            {hasLocalSearchResults && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '16px' }}>
                {searchItems.map(item => <FoodCard data={item} key={item._id} />)}
              </div>
            )}

            {/* Swiggy restaurant results */}
            {hasSwiggySearchResults && (
              <div className="restaurant-grid">
                {swiggySearchResults.map(r => <SwiggyRestaurantCard data={r} key={r.id} />)}
              </div>
            )}

            {/* No results */}
            {noResults && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  No results for &ldquo;{searchQuery}&rdquo;
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  Try searching for a dish, cuisine or restaurant name
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT (hidden while searching) ═════════════════ */}
      {!isSearchActive && (
        <>
          {/* ─── What's on your mind? ─── */}
          <div style={{ width: '100%', maxWidth: '1200px', padding: '84px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0 }}>
                What&apos;s on your mind?
              </h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => scrollHandler(cateScrollRef, "left")} style={{ width: '32px', height: '32px', borderRadius: '50%', background: showLeftCateButton ? '#e2e2e7' : '#f2f2f3', border: 'none', cursor: showLeftCateButton ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: showLeftCateButton ? 1 : 0.4 }}>
                  <FaCircleChevronLeft size={16} style={{ color: 'var(--text-primary)' }} />
                </button>
                <button onClick={() => scrollHandler(cateScrollRef, "right")} style={{ width: '32px', height: '32px', borderRadius: '50%', background: showRightCateButton ? '#e2e2e7' : '#f2f2f3', border: 'none', cursor: showRightCateButton ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: showRightCateButton ? 1 : 0.4 }}>
                  <FaCircleChevronRight size={16} style={{ color: 'var(--text-primary)' }} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', overflow: 'auto', gap: '16px', paddingBottom: '8px' }} ref={cateScrollRef}>
              {categories.map((cate, index) => (
                <CategoryCard name={cate.category} image={cate.image} key={index} onClick={() => handleFilterByCategory(cate.category)} isActive={activeCategory === cate.category} />
              ))}
            </div>
          </div>

          {/* ─── Divider ─── */}
          <div style={{ width: '100%', maxWidth: '1200px', padding: '0 20px' }}>
            <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />
          </div>

          {/* ─── Top Restaurant Chains ─── */}
          <div style={{ width: '100%', maxWidth: '1200px', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0 }}>
                {hasLocalShops ? `Best Shop in ${currentCity}` : 'Top restaurant chains'}
              </h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => scrollHandler(shopScrollRef, "left")} style={{ width: '32px', height: '32px', borderRadius: '50%', background: showLeftShopButton ? '#e2e2e7' : '#f2f2f3', border: 'none', cursor: showLeftShopButton ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: showLeftShopButton ? 1 : 0.4 }}>
                  <FaCircleChevronLeft size={16} style={{ color: 'var(--text-primary)' }} />
                </button>
                <button onClick={() => scrollHandler(shopScrollRef, "right")} style={{ width: '32px', height: '32px', borderRadius: '50%', background: showRightShopButton ? '#e2e2e7' : '#f2f2f3', border: 'none', cursor: showRightShopButton ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: showRightShopButton ? 1 : 0.4 }}>
                  <FaCircleChevronRight size={16} style={{ color: 'var(--text-primary)' }} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', overflow: 'auto', gap: '24px', paddingBottom: '8px' }} ref={shopScrollRef}>
              {hasLocalShops ? (
                shopInMyCity?.map((shop, index) => (
                  <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
                ))
              ) : (
                swiggyTopRestaurants.map((restaurant) => (
                  <div key={restaurant.id} style={{ minWidth: '260px', maxWidth: '280px', flexShrink: 0 }}>
                    <SwiggyRestaurantCard data={restaurant} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ─── Divider ─── */}
          <div style={{ width: '100%', maxWidth: '1200px', padding: '0 20px' }}>
            <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />
          </div>

          {/* ─── All Restaurants / Food Items ─── */}
          <div style={{ width: '100%', maxWidth: '1200px', padding: '0 20px 40px' }}>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 20px' }}>
              {hasLocalItems ? 'Suggested Food Items' : `Restaurants with online food delivery in ${currentCity || 'your area'}`}
            </h1>
            <div className='restaurant-grid'>
              {hasLocalItems ? (
                updatedItemsList?.map((item, index) => <FoodCard key={index} data={item} />)
              ) : (
                swiggyAllRestaurants.map((restaurant) => <SwiggyRestaurantCard data={restaurant} key={restaurant.id} />)
              )}
            </div>
          </div>

          {/* Loading shimmer */}
          {swiggyLoading && !hasLocalShops && !hasLocalItems && (
            <div style={{ width: '100%', maxWidth: '1200px', padding: '0 20px 40px' }}>
              <div className='restaurant-grid'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', background: 'white' }}>
                    <div className='shimmer' style={{ height: '160px', width: '100%' }} />
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className='shimmer' style={{ height: '14px', width: '75%', borderRadius: '4px' }} />
                      <div className='shimmer' style={{ height: '12px', width: '50%', borderRadius: '4px' }} />
                      <div className='shimmer' style={{ height: '10px', width: '100%', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UserDashboard
