import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://chqjgdlabjfkdfdbnrmn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocWpnZGxhYmpma2RmZGJucm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMjYwNTcsImV4cCI6MjA0MzkwMjA1N30.6n59_WRHktcp2nkhQQQYwWrpCMgYhk-OzrnF89mNQtI'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase