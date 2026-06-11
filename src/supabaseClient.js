import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jsfeolrfgxjxlagnljcp.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||'sb_publishable_Ass5qkPTjuzgZisPqYTokA_9E-XFJeL'
export const supabase = createClient(supabaseUrl, supabaseKey)