import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { MdOutlineEmail, MdLockOutline } from "react-icons/md"
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { serverUrl } from '../App'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../firebase'
import { ClipLoader } from 'react-spinners'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const foodEmojis = ['🍕', '🍔', '🌮', '🍜', '🍣', '🥗', '🍩', '🧆']

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const dispatch = useDispatch()

  const handleSignIn = async () => {
    if (!email || !password) return setErr("Please fill in all fields")
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signin`, { email, password }, { withCredentials: true })
      dispatch(setUserData(result.data))
      setErr("")
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong")
    }
    setLoading(false)
  }

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
        email: result.user.email,
      }, { withCredentials: true })
      dispatch(setUserData(data))
    } catch (error) {
      console.log(error)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSignIn()
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      fontFamily: 'var(--font-main)',
      background: '#fff',
    }}>
      {/* ── Left Panel ── */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(145deg, #ff6b35 0%, #fc8019 40%, #f7b731 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
        overflow: 'hidden',
      }} className="signin-left-panel">

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-60px',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '-40px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        {/* Brand */}
        <div style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
          <div style={{
            fontSize: '52px', fontWeight: 900,
            color: 'white', fontFamily: 'var(--font-display)',
            letterSpacing: '-2px', lineHeight: 1,
            marginBottom: '8px',
            textShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>
            Nosh<span style={{ fontSize: '12px', fontWeight: 400, verticalAlign: 'super', opacity: 0.7, letterSpacing: 0 }}>®</span>
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.85)', fontSize: '15px',
            fontWeight: 500, letterSpacing: '0.5px', marginBottom: '52px',
          }}>
            Delicious food, delivered fast
          </p>

          {/* Floating food emoji grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px', marginBottom: '52px', maxWidth: '240px', margin: '0 auto 52px',
          }}>
            {foodEmojis.map((emoji, i) => (
              <div key={i} style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px',
                animation: `floatItem ${2 + (i * 0.3)}s ease-in-out infinite alternate`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}>
                {emoji}
              </div>
            ))}
          </div>

          {/* Value props */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            {[
              { icon: '⚡', text: '30-min delivery guarantee' },
              { icon: '🍽️', text: '500+ restaurants near you' },
              { icon: '💳', text: 'Secure & easy payments' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px', padding: '10px 16px',
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        background: '#fafafa',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Welcome text */}
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{
              fontSize: '30px', fontWeight: 800,
              color: '#1a1a2e', fontFamily: 'var(--font-display)',
              margin: '0 0 8px', lineHeight: 1.2,
            }}>
              Welcome back 👋
            </h1>
            <p style={{ fontSize: '15px', color: '#7e808c', margin: 0 }}>
              Sign in to continue ordering
            </p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleAuth}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '12px',
              background: 'white', border: '1.5px solid #e5e7eb',
              borderRadius: '14px', padding: '13px 20px',
              cursor: 'pointer', marginBottom: '24px',
              fontSize: '14px', fontWeight: 600, color: '#374151',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-main)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#d1d5db' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e7eb' }}
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e9e9eb' }} />
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, letterSpacing: '0.5px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e9e9eb' }} />
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px', fontWeight: 600,
              color: '#374151', marginBottom: '8px',
            }}>
              Email address
            </label>
            <div style={{
              position: 'relative',
              borderRadius: '14px',
              border: `1.5px solid ${focusedField === 'email' ? '#fc8019' : '#e5e7eb'}`,
              background: 'white',
              transition: 'all 0.2s ease',
              boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(252,128,25,0.12)' : 'none',
            }}>
              <MdOutlineEmail
                size={18}
                style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'email' ? '#fc8019' : '#9ca3af',
                  transition: 'color 0.2s',
                }}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  padding: '13px 14px 13px 42px',
                  fontSize: '14px', color: '#1a1a2e',
                  fontFamily: 'var(--font-main)', borderRadius: '14px',
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{
              display: 'block', fontSize: '13px', fontWeight: 600,
              color: '#374151', marginBottom: '8px',
            }}>
              Password
            </label>
            <div style={{
              position: 'relative',
              borderRadius: '14px',
              border: `1.5px solid ${focusedField === 'password' ? '#fc8019' : '#e5e7eb'}`,
              background: 'white',
              transition: 'all 0.2s ease',
              boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(252,128,25,0.12)' : 'none',
            }}>
              <MdLockOutline
                size={18}
                style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'password' ? '#fc8019' : '#9ca3af',
                  transition: 'color 0.2s',
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  padding: '13px 44px 13px 42px',
                  fontSize: '14px', color: '#1a1a2e',
                  fontFamily: 'var(--font-main)', borderRadius: '14px',
                }}
              />
              <button
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9ca3af', padding: '2px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <span
              onClick={() => navigate("/forgot-password")}
              style={{
                fontSize: '13px', fontWeight: 600,
                color: '#fc8019', cursor: 'pointer',
              }}
            >
              Forgot password?
            </span>
          </div>

          {/* Error */}
          {err && (
            <div style={{
              background: '#fff1f2', border: '1px solid #fecdd3',
              borderRadius: '12px', padding: '10px 14px',
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span style={{ fontSize: '13px', color: '#e11d48', fontWeight: 500 }}>{err}</span>
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #fc8019 0%, #ff6b35 100%)',
              color: 'white', border: 'none',
              borderRadius: '14px', padding: '14px',
              fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.3px',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(252,128,25,0.35)',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginBottom: '28px',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 20px rgba(252,128,25,0.45)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 16px rgba(252,128,25,0.35)' }}
          >
            {loading ? <ClipLoader size={20} color="white" /> : 'Sign In'}
          </button>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Don't have an account?{' '}
            <span
              onClick={() => navigate("/signup")}
              style={{
                color: '#fc8019', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Create one
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes floatItem {
          from { transform: translateY(0px); }
          to { transform: translateY(-8px); }
        }
        @media (max-width: 768px) {
          .signin-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default SignIn
