
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgmchdihogjowgjsbghr.supabase.co';
const supabaseKey = 'sb_publishable_SmDleodGwF_AxWQX8pFW2A_Sn7wcUE-';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * SQL Schema for the 'game_records' table:
 * 
 * create table game_records (
 *   id uuid default uuid_generate_v4() primary key,
 *   player_name text not null,
 *   attempts integer not null,
 *   time_seconds float not null,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- Enable public access for this demo (Caution: Production should use RLS)
 * alter table game_records enable row level security;
 * create policy "Public Access" on game_records for all using (true);
 */
