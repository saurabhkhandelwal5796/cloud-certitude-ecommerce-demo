import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim()?.replace(/["']/g, '');
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim()?.replace(/["']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAttributes() {
  const { data: groups } = await supabase.from('attribute_groups').select('id, name');
  const { data: attrs } = await supabase.from('attributes').select('id, group_id, name');
  
  console.log("=== Groups ===");
  console.log(groups);
  console.log("=== Attributes (first 5) ===");
  console.log(attrs?.slice(0, 5));
}

checkAttributes().catch(console.error);
