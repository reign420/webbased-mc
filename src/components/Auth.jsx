import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleAuth = async (type) => {
    setError('')
    try {
      const { error } = type === 'LOGIN' 
        ? await supabase.auth.signInWithPassword({ 
            email, 
            password 
          })
        : await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: window.location.origin
            }
          })

      if (error) throw error
    } catch (err) {
      setError(err.message || 'Authentication failed')
    }
  }
  
  return (
    <div className="auth-container">
      <input type="email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => handleLogin('LOGIN')}>Login</button>
      <button onClick={() => handleLogin('REGISTER')}>Register</button>
    </div>
  )
}