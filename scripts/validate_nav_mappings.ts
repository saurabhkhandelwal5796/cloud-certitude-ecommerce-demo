import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim()?.replace(/["']/g, '');
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim()?.replace(/["']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function validate() {
  const { data: allNodes } = await supabase.from('navigation_nodes').select('*');
  const { data: allGroups } = await supabase.from('attribute_groups').select('*');
  const { data: mappings } = await supabase.from('navigation_attribute_groups').select('*');

  if (!allNodes || !allGroups || !mappings) return;

  console.log("=== Validation Report ===");
  const parentIds = new Set(allNodes.filter(n => n.parent_id).map(n => n.parent_id));
  const leafNodes = allNodes.filter(n => !parentIds.has(n.id));

  let mappedCorrectly = 0;
  const missing: string[] = [];
  const invalid: string[] = [];

  const groupIds = new Set(allGroups.map(g => g.id));

  for (const node of leafNodes) {
    const nodeMappings = mappings.filter(m => m.nav_node_id === node.id);
    
    if (nodeMappings.length === 0) {
      missing.push(node.full_path);
      continue;
    }

    const hasInvalid = nodeMappings.some(m => !groupIds.has(m.attribute_group_id));
    if (hasInvalid) {
      invalid.push(node.full_path);
      continue;
    }

    mappedCorrectly++;
  }

  console.log(`Total leaf nodes: ${leafNodes.length}`);
  console.log(`Fully mapped leaf nodes (1+ valid attributes): ${mappedCorrectly}`);
  console.log(`Missing mappings (0 attributes): ${missing.length}`);
  console.log(`Invalid mappings: ${invalid.length}`);

  if (missing.length > 0) {
    console.log("\nNodes still missing mappings:");
    missing.forEach(m => console.log(`- ${m}`));
  }
}

validate().catch(console.error);
