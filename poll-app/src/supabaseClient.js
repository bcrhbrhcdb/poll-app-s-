import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://chqjgdlabjfkdfdbnrmn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocWpnZGxhYmpma2RmZGJucm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMjYwNTcsImV4cCI6MjA0MzkwMjA1N30.6n59_WRHktcp2nkhQQQYwWrpCMgYhk-OzrnF89mNQtI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)