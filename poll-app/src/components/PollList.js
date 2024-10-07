import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function PollList() {
  const [polls, setPolls] = useState([])

  useEffect(() => {
    fetchPolls()
  }, [])

  const fetchPolls = async () => {
    const { data, error } = await supabase.from('polls').select('*')
    if (error) console.error('Error fetching polls:', error)
    else setPolls(data)
  }

  return (
    <div>
      <h2>All Polls</h2>
      {polls.map((poll) => (
        <div key={poll.id}>
          <Link to={`/poll/${poll.id}`}>{poll.title}</Link>
        </div>
      ))}
    </div>
  )
}