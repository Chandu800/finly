import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkoyvfpmrijbzvisscrx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rb3l2ZnBtcmlqYnp2aXNzY3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzgyMDgsImV4cCI6MjA2MzA1NDIwOH0.ZyNkxTBo-zi9ixV3syvYzW1On_IHGcohIRALYSSKPSc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
