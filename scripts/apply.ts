import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim()?.replace(/["']/g, '');
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']?.trim()?.replace(/["']/g, ''); // Use service role for inserts
const supabase = createClient(supabaseUrl, supabaseKey);

async function apply() {
  const { data: allNodes } = await supabase.from('navigation_nodes').select('*');
  const { data: allGroups } = await supabase.from('attribute_groups').select('*');
  
  if (!allNodes || !allGroups) return;
  
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

  const leafNodeIds = leafNodes.map(n => n.id);
  
  console.log("Deleting existing mappings for leaf nodes...");
  // Supabase JS doesn't support WHERE IN natively for large arrays easily, so we delete in chunks or by ID
  for (const id of leafNodeIds) {
    await supabase.from('navigation_attribute_groups').delete().eq('nav_node_id', id);
  }

  const inserts: {nav_node_id: string, attribute_group_id: string}[] = [];

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
      groupsToMap = apparelTop;
    }

    for (const gid of groupsToMap) {
      inserts.push({ nav_node_id: node.id, attribute_group_id: gid });
    }
  }

  console.log(`Inserting ${inserts.length} mappings...`);
  
  // Insert in batches of 100
  for (let i = 0; i < inserts.length; i += 100) {
    const batch = inserts.slice(i, i + 100);
    const { error } = await supabase.from('navigation_attribute_groups').insert(batch);
    if (error) console.error("Error inserting batch:", error);
  }

  console.log("Done!");
}

apply().catch(console.error);
