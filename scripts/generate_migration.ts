import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim()?.replace(/["']/g, '');
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim()?.replace(/["']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function createMigration() {
  const { data: allNodes } = await supabase.from('navigation_nodes').select('*');
  const { data: allGroups } = await supabase.from('attribute_groups').select('*');
  
  if (!allNodes || !allGroups) return;
  
  const parentIds = new Set(allNodes.filter(n => n.parent_id).map(n => n.parent_id));
  const leafNodes = allNodes.filter(n => !parentIds.has(n.id));

  const apparel = allGroups.find(g => g.name === 'Apparel Attributes');
  const footwear = allGroups.find(g => g.name === 'Footwear Attributes');
  const accessories = allGroups.find(g => g.name === 'Accessories Attributes');

  let migrationSQL = `-- Migration: Automate Navigation Attribute Group Mappings\n-- Description: Ensures every leaf node has exactly one mapping.\n\n`;

  for (const node of leafNodes) {
    let groupId = apparel.id; // Default to Apparel
    
    const pathLower = node.full_path.toLowerCase();
    
    if (pathLower.includes('footwear')) {
      groupId = footwear.id;
    } else if (pathLower.includes('accessories') || pathLower.includes('bags') || pathLower.includes('belts') || pathLower.includes('watches') || pathLower.includes('sunglasses') || pathLower.includes('jewellery')) {
      groupId = accessories.id;
    }

    migrationSQL += `
INSERT INTO public.navigation_attribute_groups (nav_node_id, attribute_group_id)
SELECT '${node.id}', '${groupId}'
WHERE NOT EXISTS (
    SELECT 1 FROM public.navigation_attribute_groups WHERE nav_node_id = '${node.id}'
);

UPDATE public.navigation_attribute_groups
SET attribute_group_id = '${groupId}'
WHERE nav_node_id = '${node.id}';
`;
  }
  
  // To avoid duplicate mappings if there are multiple per node, we should ideally delete excess mappings
  migrationSQL = `-- Migration: Automate Navigation Attribute Group Mappings
-- Ensure idempotent insert and update to correct group.
-- Delete any duplicate mappings for the same node so that exactly 1 remains.

` + migrationSQL + `
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER(PARTITION BY nav_node_id ORDER BY created_at DESC) as rn
  FROM public.navigation_attribute_groups
)
DELETE FROM public.navigation_attribute_groups
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
`;

  fs.writeFileSync('supabase/migrations/20260804000000_automate_nav_attribute_mappings.sql', migrationSQL);
  console.log("Migration created at supabase/migrations/20260804000000_automate_nav_attribute_mappings.sql");
}

createMigration().catch(console.error);
