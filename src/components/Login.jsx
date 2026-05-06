import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError('Credenciales incorrectas')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#2563eb', marginBottom: '1.5rem' }}>Sistema Escolar</h2>
        {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</p>}
        <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} required style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.75rem', background: isLoading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  )
}