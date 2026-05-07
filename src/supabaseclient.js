import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jsfeolrfgxjxlagnljcp.supabase.co'
const supabaseKey = 'sb_publishable_Ass5qkPTjuzgZisPqYTokA_9E-XFJeL'

export const supabase = createClient(supabaseUrl, supabaseKey)