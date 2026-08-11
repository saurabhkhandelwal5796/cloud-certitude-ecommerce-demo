import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim()?.replace(/["']/g, '');
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim()?.replace(/["']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSchema() {
  const { data: groups, error: gError } = await supabase.from('attribute_groups').select('*').limit(1);
  const { data: attrs, error: aError } = await supabase.from('attributes').select('*').limit(1);
  
  console.log("Attribute Groups table columns:", Object.keys(groups?.[0] || {}), gError);
  console.log("Attributes table columns:", Object.keys(attrs?.[0] || {}), aError);
}

testSchema().catch(console.error);
