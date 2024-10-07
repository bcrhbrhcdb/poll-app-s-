import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: `${username}@example.com`,
      password: password,
    })
    if (error) alert(error.message)
    else {
      await supabase.from('users').insert({ id: data.user.id, username })
    }
    setLoading(false)
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: `${username}@example.com`,
      password: password,
    })
    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          Sign Up
        </button>
      </form>
      <form onSubmit={handleSignIn}>
        <button type="submit" disabled={loading}>
          Sign In
        </button>
      </form>
    </div>
  )
}