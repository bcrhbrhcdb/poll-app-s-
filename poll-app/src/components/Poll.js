import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function Poll({ pollId }) {
  const [poll, setPoll] = useState(null)
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPoll()
    const subscription = supabase
      .channel(`poll_${pollId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'options' }, handleChange)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [pollId])

  const fetchPoll = async () => {
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single()

    if (pollError) {
      console.error('Error fetching poll:', pollError)
      return
    }

    const { data: optionsData, error: optionsError } = await supabase
      .from('options')
      .select('*')
      .eq('poll_id', pollId)

    if (optionsError) {
      console.error('Error fetching options:', optionsError)
      return
    }

    setPoll(pollData)
    setOptions(optionsData)
    setLoading(false)
  }

  const handleChange = (payload) => {
    console.log('Change received!', payload)
    fetchPoll()
  }

  const handleVote = async (optionId) => {
    const { error } = await supabase.rpc('increment_vote', {
      option_id: optionId,
    })

    if (error) console.error('Error voting:', error)
  }

  if (loading) return <div>Loading...</div>

  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  return (
    <div>
      <h2>{poll.title}</h2>
      {options.map((option, index) => (
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <button onClick={() => handleVote(option.id)}>{option.text}</button>
          <span>{((option.votes / totalVotes) * 100).toFixed(2)}%</span>
        </motion.div>
      ))}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={options}
            dataKey="votes"
            nameKey="text"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {options.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}