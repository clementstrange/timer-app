import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oyyffnceyvtzbwfvhkwf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95eWZmbmNleXZ0emJ3ZnZoa3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjA0ODEsImV4cCI6MjA2ODEzNjQ4MX0.NFKEHPMAjSNsBH2lIzsL8a822edTLDCgevJ3KiK6GkQ'

export const supabase = createClient(supabaseUrl, supabaseKey)