import React, { useState } from 'react'
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateQuantity, removeCartItem } from '../redux/userSlice'

function FoodCard({ data }) {
  const [showAdded, setShowAdded] = useState(false)
  const dispatch = useDispatch()
  const { cartItems } = useSelector(state => state.user)

  const cartItem = cartItems.find(i => i.id === data._id)
  const cartQty = cartItem?.quantity || 0

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating
          ? <FaStar key={i} className='text-amber-400 text-sm' />
          : <FaRegStar key={i} className='text-amber-400 text-sm' />
      )
    }
    return stars
  }

  const handleAdd = () => {
    dispatch(addToCart({
      id: data._id,
      name: data.name,
      price: data.price,
      image: data.image,
      shop: data.shop,
      quantity: 1,
      foodType: data.foodType
    }))
    setShowAdded(true)
    setTimeout(() => setShowAdded(false), 1200)
  }

  const handleIncrease = () => {
    dispatch(updateQuantity({ id: data._id, quantity: cartQty + 1 }))
  }

  const handleDecrease = () => {
    if (cartQty <= 1) {
      dispatch(removeCartItem(data._id))
    } else {
      dispatch(updateQuantity({ id: data._id, quantity: cartQty - 1 }))
    }
  }

  return (
    <div className='w-full rounded-2xl bg-white overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300 flex flex-col group border border-gray-100/60 relative' style={{fontFamily: 'var(--font-main)'}}>
      <div className='relative w-full h-[180px] overflow-hidden'>
        <div className='absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm'>
          {data.foodType === "veg" ? <FaLeaf className='text-green-600 text-sm' /> : <FaDrumstickBite className='text-red-500 text-sm' />}
        </div>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <h1 className='font-bold text-gray-900 text-[15px] truncate leading-tight' style={{fontFamily: 'var(--font-display)'}}>{data.name}</h1>

        <div className='flex items-center gap-0.5 mt-2'>
          {renderStars(data.rating?.average || 0)}
          <span className='text-xs text-gray-400 ml-1'>
            ({data.rating?.count || 0})
          </span>
        </div>
      </div>

      <div className='flex items-center justify-between px-4 pb-4'>
        <span className='font-bold text-gray-900 text-lg'>
          ₹{data.price}
        </span>

        <div className='relative'>
          {cartQty === 0 ? (
            <button
              className='relative bg-white text-green-600 border-2 border-gray-200 px-6 py-1 rounded-xl text-[14px] font-extrabold tracking-wide cursor-pointer transition-all duration-200 shadow-sm hover:bg-green-50 hover:border-green-500 hover:shadow-md active:scale-95'
              style={{fontFamily: 'var(--font-display)'}}
              onClick={handleAdd}
            >
              ADD
              <span className='absolute -top-[2px] right-1 text-[16px] text-green-500 font-normal'>+</span>
            </button>
          ) : (
            <div className='flex items-center bg-green-600 rounded-xl overflow-hidden shadow-md'>
              <button className='text-white px-2.5 py-[6px] hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center' onClick={handleDecrease}>
                <FaMinus size={10} />
              </button>
              <span className='text-white font-bold text-[14px] min-w-[22px] text-center'>{cartQty}</span>
              <button className='text-white px-2.5 py-[6px] hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center' onClick={handleIncrease}>
                <FaPlus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Added toast */}
      {showAdded && (
        <div className='absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap z-10 fade-in-up'>
          Added ✓
        </div>
      )}
    </div>
  )
}

export default FoodCard
