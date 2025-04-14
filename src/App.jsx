import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import World from './World'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])import { useState, useEffect } from 'react'
  import { supabase } from './supabaseClient'
  import Auth from './components/Auth'
  import World from './components/World'
  
  export default function App() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
  
    useEffect(() => {
      const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setLoading(false)
      }
  
      fetchSession()
  
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setLoading(false)
      })
  
      return () => subscription?.unsubscribe()
    }, [])
  
    if (loading) {
      return (
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Loading Minecraft Clone...</p>
        </div>
      )
    }
  
    return (
      <div className="app-container">
        {!session ? (
          <div className="auth-wrapper">
            <h1>Minecraft Clone</h1>
            <Auth />
          </div>
        ) : (
          <div className="game-container">
            <header className="game-header">
              <button 
                className="logout-button"
                onClick={() => supabase.auth.signOut()}
              >
                Logout
              </button>
            </header>
            <World />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container">
      {!session ? <Auth /> : <World />}
    </div>
  )
}