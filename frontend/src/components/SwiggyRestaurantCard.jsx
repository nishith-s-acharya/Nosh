import React from 'react'
import { FaStar, FaClock } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

function SwiggyRestaurantCard({ data }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/swiggy-shop/${data.id}`)}
      style={{
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        fontFamily: 'var(--font-main)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(0.97)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '160px', overflow: 'hidden', borderRadius: '16px', margin: '0' }}>
        <img
          src={data.image}
          alt={data.name}
          loading='lazy'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={e => { e.target.src = 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Restaurant' }}
        />
        {/* Bottom gradient for discount text */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '80px',
          background: 'linear-gradient(to top, rgba(27,30,36,0.75) 0%, transparent 100%)',
          borderRadius: '0 0 16px 16px',
        }} />

        {/* Discount badge */}
        {data.discount && (
          <div style={{ position: 'absolute', bottom: '8px', left: '12px' }}>
            <p style={{
              color: 'white',
              fontWeight: 800,
              fontSize: '20px',
              lineHeight: 1,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.3px',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              margin: 0,
            }}>{data.discount}</p>
            {data.discountSubHeader && (
              <p style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '11px',
                fontWeight: 600,
                margin: 0,
                letterSpacing: '0.3px',
              }}>{data.discountSubHeader}</p>
            )}
          </div>
        )}

        {data.veg && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: '#60b246',
            color: 'white',
            fontSize: '9px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px',
            letterSpacing: '0.5px',
          }}>PURE VEG</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '10px 12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
          <h3 style={{
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontSize: '16px',
            lineHeight: 1.25,
            fontFamily: 'var(--font-display)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}>{data.name}</h3>
          {data.avgRating && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: data.avgRating >= 4 ? '#60b246' : data.avgRating >= 3 ? '#db7c38' : '#e23744',
              color: 'white',
              padding: '2px 5px',
              borderRadius: '5px',
              fontSize: '12px',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              <FaStar size={8} />
              <span>{data.avgRatingString}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {data.cuisines?.slice(0, 3).join(', ')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {data.locality}
          </span>
          {data.slaString && (
            <span style={{
              color: 'var(--text-muted)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}>
              • <FaClock size={9} /> {data.slaString}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default SwiggyRestaurantCard
