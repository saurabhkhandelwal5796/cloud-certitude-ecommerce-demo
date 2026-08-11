import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim()?.replace(/["']/g, '');
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim()?.replace(/["']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: allNodes } = await supabase.from('navigation_nodes').select('*');
  const { data: allGroups } = await supabase.from('attribute_groups').select('*');
  
  if (!allNodes || !allGroups) return;
  
  // Find leaf nodes
  const parentIds = new Set(allNodes.filter(n => n.parent_id).map(n => n.parent_id));
  const leafNodes = allNodes.filter(n => !parentIds.has(n.id));

  // Determine standard sets
  const size = allGroups.find(g => g.name === 'Size')?.id;
  const color = allGroups.find(g => g.name === 'Color')?.id;
  const fit = allGroups.find(g => g.name === 'Fit')?.id;
  const sleeve = allGroups.find(g => g.name === 'Sleeve')?.id;
  const fabric = allGroups.find(g => g.name === 'Fabric')?.id;
  const occasion = allGroups.find(g => g.name === 'Occasion')?.id;
  const pattern = allGroups.find(g => g.name === 'Pattern')?.id;
  const neck = allGroups.find(g => g.name === 'Neck')?.id;
  const rise = allGroups.find(g => g.name === 'Rise')?.id;
  const wash = allGroups.find(g => g.name === 'Wash')?.id;
  const shoeMaterial = allGroups.find(g => g.name === 'Shoe Material')?.id;
  const closure = allGroups.find(g => g.name === 'Closure')?.id;
  const shoeSize = allGroups.find(g => g.name === 'Shoe Size')?.id;

  const apparelTop = [size, color, fit, sleeve, fabric, occasion, pattern, neck].filter(Boolean);
  const apparelBottom = [size, color, fit, fabric, occasion, pattern, rise, wash].filter(Boolean);
  const footwear = [shoeSize, color, shoeMaterial, closure, occasion].filter(Boolean);
  const accessories = [size, color, fabric, pattern].filter(Boolean);

  let migrationSQL = `-- Migration: Automate Navigation Attribute Group Mappings
-- Ensures every leaf node has correct attribute groups mapped to it based on taxonomy.
-- First, clean out existing mappings for leaf nodes to ensure clean state and idempotency
`;

  // Only delete mappings for leaf nodes so we don't break parents if they have any (though usually leaf nodes have them)
  const leafNodeIds = leafNodes.map(n => n.id).map(id => `'${id}'`).join(',');
  migrationSQL += `DELETE FROM public.navigation_attribute_groups WHERE nav_node_id IN (${leafNodeIds});\n\n`;

  migrationSQL += `INSERT INTO public.navigation_attribute_groups (nav_node_id, attribute_group_id)\nVALUES\n`;
  
  const values: string[] = [];

  for (const node of leafNodes) {
    let groupsToMap: any[] = [];
    
    const pathLower = node.full_path.toLowerCase();
    
    if (pathLower.includes('footwear')) {
      groupsToMap = footwear;
    } else if (pathLower.includes('accessories') || pathLower.includes('bags') || pathLower.includes('belts') || pathLower.includes('watches') || pathLower.includes('sunglasses') || pathLower.includes('jewellery')) {
      groupsToMap = accessories;
    } else if (pathLower.includes('bottom')) {
      groupsToMap = apparelBottom;
    } else {
      // Default to apparel top (T-shirts, shirts, dresses, etc)
      groupsToMap = apparelTop;
    }

    for (const gid of groupsToMap) {
      values.push(`('${node.id}', '${gid}')`);
    }
  }

  migrationSQL += values.join(',\n') + ';\n';
  
  fs.writeFileSync('supabase/migrations/20260804000000_automate_nav_attribute_mappings.sql', migrationSQL);
  console.log("Migration created with proper attribute mappings!");
}

main().catch(console.error);
