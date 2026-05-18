import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore, FaLocationDot } from "react-icons/fa6";
import { FaUtensils, FaArrowLeft } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { useSelector } from 'react-redux';
import FoodCard from '../components/FoodCard';

function Shop() {
    const { shopId } = useParams()
    const [items, setItems] = useState([])
    const [shop, setShop] = useState(null)
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)

    const handleShop = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, { withCredentials: true })
            setShop(result.data.shop)
            setItems(result.data.items)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        handleShop()
    }, [shopId])

    return (
        <div className='min-h-screen bg-[var(--bg)]' style={{fontFamily: 'var(--font-main)'}}>
            {/* Fixed Top Bar */}
            <div className='fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100/80'>
                <button
                    className='flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm cursor-pointer'
                    onClick={() => navigate("/")}
                >
                    <FaArrowLeft size={14} />
                    <span>Back</span>
                </button>
                {shop && (
                    <h2 className='text-sm font-semibold text-gray-900 truncate max-w-[200px]' style={{fontFamily: 'var(--font-display)'}}>{shop.name}</h2>
                )}
                <button className='relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer' onClick={() => navigate("/cart")}>
                    <FiShoppingCart size={20} className='text-gray-700' />
                    {cartItems.length > 0 && (
                        <span className='absolute -top-0.5 -right-0.5 bg-[#ff4d2d] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center'>{cartItems.length}</span>
                    )}
                </button>
            </div>

            {/* Shop Header Banner */}
            {shop && (
                <div className='relative w-full h-[240px] md:h-[320px]'>
                    <img src={shop.image} alt={shop.name} className='w-full h-full object-cover' />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 flex flex-col justify-end p-5 md:p-8'>
                        <div className='flex items-center gap-3 mb-2'>
                            <FaStore className='text-white text-2xl drop-shadow-md' />
                        </div>
                        <h1 className='text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg leading-tight' style={{fontFamily: 'var(--font-display)'}}>{shop.name}</h1>
                        {shop.address && (
                            <p className='flex items-center gap-1.5 text-white/50 text-xs mt-2'>
                                <FaLocationDot size={10} />
                                {shop.address}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Menu */}
            <div className='max-w-6xl mx-auto px-4 md:px-6 py-8 pb-28'>
                <h2 className='flex items-center justify-center gap-3 text-xl md:text-2xl font-bold mb-8 text-gray-900' style={{fontFamily: 'var(--font-display)'}}>
                    <span className='w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center'>
                        <FaUtensils size={14} className='text-[#ff4d2d]' />
                    </span>
                    Our Menu
                </h2>

                {items.length > 0 ? (
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5'>
                        {items.map((item) => (
                            <FoodCard data={item} key={item._id} />
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-20'>
                        <div className='text-5xl mb-3'>🍽️</div>
                        <p className='text-gray-400 text-lg font-medium'>No items available yet</p>
                    </div>
                )}
            </div>

            {/* Floating Cart Bar */}
            {cartItems.length > 0 && (
                <div className='fixed bottom-0 left-0 right-0 z-30 px-3 pb-4 pt-2'>
                    <div className='max-w-3xl mx-auto'>
                        <button
                            className='w-full flex items-center justify-between text-white px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-200 cursor-pointer'
                            style={{
                                fontFamily: 'var(--font-display)',
                                background: '#1ba672'
                            }}
                            onClick={() => navigate("/cart")}
                        >
                            <div className='flex items-center gap-2'>
                                <span className='font-bold text-base'>{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</span>
                                <span className='text-white/50'>|</span>
                                <span className='font-bold text-base'>₹{totalAmount}</span>
                            </div>
                            <div className='flex items-center gap-2 font-semibold text-sm'>
                                <span>VIEW CART</span>
                                <FiShoppingCart size={16} />
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Shop
