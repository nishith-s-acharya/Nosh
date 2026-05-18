import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { MdOutlineEmail, MdLockOutline, MdOutlinePerson, MdOutlinePhone } from "react-icons/md"
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { serverUrl } from '../App'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../firebase'
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const roles = [
  { key: 'user', emoji: '🍽️', label: 'Customer', desc: 'Order food' },
  { key: 'owner', emoji: '🏪', label: 'Owner', desc: 'Manage shop' },
  { key: 'deliveryBoy', emoji: '🚴', label: 'Delivery', desc: 'Deliver orders' },
]

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("user")
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const dispatch = useDispatch()

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !mobile) return setErr("Please fill in all fields")
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signup`, {
        fullName, email, password, mobile, role
      }, { withCredentials: true })
      dispatch(setUserData(result.data))
      setErr("")
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong")
    }
    setLoading(false)
  }

  const handleGoogleAuth = async () => {
    if (!mobile) return setErr("Mobile number is required for Google sign up")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
        fullName: result.user.displayName,
        email: result.user.email,
        role, mobile,
      }, { withCredentials: true })
      dispatch(setUserData(data))
    } catch (error) {
      console.log(error)
    }
  }

  const inputStyle = (field) => ({
    position: 'relative',
    borderRadius: '14px',
    border: `1.5px solid ${focusedField === field ? '#fc8019' : '#e5e7eb'}`,
    background: 'white',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(252,128,25,0.12)' : 'none',
  })

  const iconStyle = (field) => ({
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)',
    color: focusedField === field ? '#fc8019' : '#9ca3af',
    transition: 'color 0.2s',
  })

  const baseInput = {
    width: '100%', background: 'none', border: 'none', outline: 'none',
    padding: '12px 14px 12px 42px',
    fontSize: '14px', color: '#1a1a2e',
    fontFamily: 'var(--font-main)', borderRadius: '14px',
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', fontFamily: 'var(--font-main)', background: '#fff',
    }}>
      {/* ── Left decorative panel ── */}
      <div style={{
        flex: '0 0 40%',
        background: 'linear-gradient(145deg, #1a1a2e 0%, #282c3f 50%, #3d3e52 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 40px', position: 'relative', overflow: 'hidden',
      }} className="signup-left-panel">

        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(252,128,25,0.12)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(252,128,25,0.08)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(252,128,25,0.06)' }} />

        <div style={{ textAlign: 'center', zIndex: 1 }}>
          {/* Brand */}
          <div style={{
            fontSize: '50px', fontWeight: 900, color: 'white',
            fontFamily: 'var(--font-display)', letterSpacing: '-2px',
            marginBottom: '6px', lineHeight: 1,
          }}>
            Nosh<span style={{ fontSize: '10px', fontWeight: 400, verticalAlign: 'super', opacity: 0.5, letterSpacing: 0 }}>®</span>
          </div>
          <div style={{
            display: 'inline-block', background: 'rgba(252,128,25,0.2)',
            color: '#fc8019', fontSize: '12px', fontWeight: 600,
            padding: '4px 14px', borderRadius: '20px',
            letterSpacing: '1px', marginBottom: '48px',
          }}>
            JOIN THE FOOD REVOLUTION
          </div>

          {/* Illustration */}
          <div style={{ fontSize: '80px', marginBottom: '36px', lineHeight: 1 }}>🍕</div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', width: '100%' }}>
            {[
              { step: '01', title: 'Create your account', desc: 'Quick and easy signup in seconds' },
              { step: '02', title: 'Browse restaurants', desc: 'Explore 500+ restaurants near you' },
              { step: '03', title: 'Order & enjoy', desc: 'Fast delivery right to your door' },
            ].map((item) => (
              <div key={item.step} style={{
                display: 'flex', gap: '16px', alignItems: 'flex-start',
              }}>
                <div style={{
                  minWidth: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(252,128,25,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, color: '#fc8019',
                  letterSpacing: '0.5px', flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 40px', background: '#fafafa', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontSize: '28px', fontWeight: 800,
              color: '#1a1a2e', fontFamily: 'var(--font-display)',
              margin: '0 0 6px', lineHeight: 1.2,
            }}>
              Create account 🎉
            </h1>
            <p style={{ fontSize: '14px', color: '#7e808c', margin: 0 }}>
              Join thousands of food lovers today
            </p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>
              I want to join as
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '14px',
                    border: `2px solid ${role === r.key ? '#fc8019' : '#e5e7eb'}`,
                    background: role === r.key ? '#fff8f0' : 'white',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: role === r.key ? '0 2px 8px rgba(252,128,25,0.2)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{r.emoji}</div>
                  <div style={{
                    fontSize: '12px', fontWeight: 700,
                    color: role === r.key ? '#fc8019' : '#374151',
                  }}>{r.label}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Full Name</label>
            <div style={inputStyle('name')}>
              <MdOutlinePerson size={18} style={iconStyle('name')} />
              <input
                type="text" placeholder="Your full name" value={fullName}
                onChange={e => setFullName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={baseInput}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Email</label>
            <div style={inputStyle('email')}>
              <MdOutlineEmail size={18} style={iconStyle('email')} />
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={baseInput}
              />
            </div>
          </div>

          {/* Mobile */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Mobile Number</label>
            <div style={inputStyle('mobile')}>
              <MdOutlinePhone size={18} style={iconStyle('mobile')} />
              <input
                type="tel" placeholder="+91 98765 43210" value={mobile}
                onChange={e => setMobile(e.target.value)}
                onFocus={() => setFocusedField('mobile')}
                onBlur={() => setFocusedField(null)}
                style={baseInput}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Password</label>
            <div style={{ ...inputStyle('password'), position: 'relative' }}>
              <MdLockOutline size={18} style={iconStyle('password')} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters" value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{ ...baseInput, paddingRight: '44px' }}
              />
              <button
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9ca3af', display: 'flex', alignItems: 'center', padding: '2px',
                }}
              >
                {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
              </button>
            </div>
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

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            {loading ? <ClipLoader size={20} color="white" /> : 'Create Account'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e9e9eb' }} />
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, letterSpacing: '0.5px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e9e9eb' }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleAuth}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '12px',
              background: 'white', border: '1.5px solid #e5e7eb',
              borderRadius: '14px', padding: '12px 20px',
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

          {/* Sign in link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate("/signin")}
              style={{ color: '#fc8019', fontWeight: 700, cursor: 'pointer' }}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .signup-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default SignUp
