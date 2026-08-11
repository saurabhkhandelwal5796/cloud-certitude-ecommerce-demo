import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim()?.replace(/["']/g, '');
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim()?.replace(/["']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: groups } = await supabase.from('attribute_groups').select('*');
  console.log("All groups in DB:");
  groups?.forEach(g => console.log(`- ${g.name} (${g.id})`));

  const { data: tshirts } = await supabase.from('navigation_nodes').select('*').eq('name', 'T-Shirts').limit(1).maybeSingle();
  if (tshirts) {
    const { data: tshirtsMappings } = await supabase.from('navigation_attribute_groups').select('*').eq('nav_node_id', tshirts.id);
    console.log("\nT-Shirts Mappings:");
    tshirtsMappings?.forEach(m => {
      const g = groups?.find(g => g.id === m.attribute_group_id);
      console.log(`- Maps to: ${g?.name} (${m.attribute_group_id})`);
    });
  }
}

check().catch(console.error);
