import React from 'react'

function CategoryCard({name,image,onClick,isActive}) {
  return (
    <div className={`w-[130px] h-[140px] md:w-[160px] md:h-[170px] rounded-2xl shrink-0 overflow-hidden bg-white cursor-pointer relative group transition-all duration-300 hover:-translate-y-1 ${isActive ? 'ring-2 ring-[#ff4d2d] shadow-lg shadow-orange-100' : 'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] border border-gray-100'}`} onClick={onClick}>
     <img src={image} alt={name} className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500'/>
     <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
     <div className='absolute bottom-0 w-full left-0 px-3 py-2.5 text-center'>
       <span className='text-sm font-semibold text-white drop-shadow-md' style={{fontFamily: 'var(--font-main)'}}>{name}</span>
     </div>
    </div>
  )
}

export default CategoryCard
