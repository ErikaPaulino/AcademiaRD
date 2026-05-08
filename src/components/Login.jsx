import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, signup } = useAuth()

  //  Validación estricta de contraseña
  const validatePassword = (pass) => {
    const hasUpper = /[A-Z]/.test(pass)
    const hasNumber = /[0-9]/.test(pass)
    const hasSpecial = /[^A-Za-z0-9]/.test(pass) // @, #, $, %, etc.
    const hasMinLength = pass.length >= 8
    return { hasUpper, hasNumber, hasSpecial, hasMinLength }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (isLoading) return

    //  Validaciones solo para REGISTRO
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }
      const checks = validatePassword(password)
      if (!checks.hasUpper || !checks.hasNumber || !checks.hasSpecial || !checks.hasMinLength) {
        setError('La contraseña debe tener: mayúscula, número, carácter especial y mínimo 8 caracteres')
        return
      }
    }

    setIsLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password)
        setSuccess('✅ Cuenta creada. Ya puedes iniciar sesión.')
        setIsLogin(true)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError(err.message || 'Error en la autenticación')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ textAlign: 'center', color: '#2563eb', marginBottom: '1.5rem' }}>🎓 Colegio Molaco</h2>
        
        {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>❌ {error}</p>}
        {success && <p style={{ color: '#059669', background: '#d1fae5', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</p>}

        <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        
        {!isLogin && (
          <input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isLoading} required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        )}

        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.75rem', background: isLoading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          {isLoading ? 'Procesando...' : isLogin ? '🔐 Iniciar Sesión' : '✨ Crear Cuenta'}
        </button>

        <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} disabled={isLoading} style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </form>
    </div>
  )
}
