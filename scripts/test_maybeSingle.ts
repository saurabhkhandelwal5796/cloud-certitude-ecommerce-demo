import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim()?.replace(/["']/g, '');
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim()?.replace(/["']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMaybeSingle() {
  const { data: tshirts } = await supabase.from('navigation_nodes').select('*').eq('name', 'T-Shirts').limit(1).maybeSingle();
  if (tshirts) {
    const { data, error } = await supabase
      .from('navigation_attribute_groups')
      .select('attribute_group_id')
      .eq('nav_node_id', tshirts.id)
      .maybeSingle();

    console.log("maybeSingle for T-Shirts result:");
    console.log("Data:", data);
    console.log("Error:", error);
  }
}

testMaybeSingle().catch(console.error);
