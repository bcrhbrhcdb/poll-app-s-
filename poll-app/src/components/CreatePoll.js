import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CreatePoll() {
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])

  const handleCreatePoll = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('You must be logged in to create a poll')
      return
    }

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({ title, user_id: user.id })
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return
    }

    const optionsToInsert = options.filter(option => option.trim() !== '').map(option => ({
      poll_id: poll.id,
      text: option,
      votes: 0
    }))

    const { error: optionsError } = await supabase
      .from('options')
      .insert(optionsToInsert)

    if (optionsError) {
      console.error('Error creating options:', optionsError)
      return
    }

    setTitle('')
    setOptions(['', ''])
    alert('Poll created successfully!')
  }

  return (
    <form onSubmit={handleCreatePoll}>
      <input
        type="text"
        placeholder="Poll Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      {options.map((option, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Option ${index + 1}`}
          value={option}
          onChange={(e) => {
            const newOptions = [...options]
            newOptions[index] = e.target.value
            setOptions(newOptions)
          }}
          required
        />
      ))}
      <button type="button" onClick={() => setOptions([...options, ''])}>
        Add Option
      </button>
      <button type="submit">Create Poll</button>
    </form>
  )
}