import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jrgtqmuxdbmoqzybueos.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ3RxbXV4ZGJtb3F6eWJ1ZW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwODM1NzIsImV4cCI6MjA5MjY1OTU3Mn0.3dnotNbUf7wnimJqpyxT00JRAoheEh27PkvkDntMn1w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)