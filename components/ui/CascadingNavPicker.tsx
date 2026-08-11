import React, { useState, useEffect, useMemo } from 'react';

interface RawNode {
  id: string;
  name: string;
  full_path: string;
  level: number;
  parent_id: string | null;
  children?: RawNode[];
}

interface CascadingNavPickerProps {
  nodes: RawNode[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function CascadingNavPicker({ nodes, selectedId, onChange }: CascadingNavPickerProps) {
  // We maintain a list of selected node IDs for each level.
  const [selections, setSelections] = useState<string[]>([]);

  // Rebuild the selections path when selectedId changes from outside (e.g. edit mode)
  useEffect(() => {
    if (!selectedId) {
      if (selections.length > 0) {
        setSelections([]);
      }
      return;
    }
    
    // Only rebuild if the current last selection is not already this ID
    if (selections[selections.length - 1] === selectedId) {
      return;
    }

    const path: string[] = [];
    let currentId: string | null = selectedId;
    
    while (currentId) {
      const node = nodes.find(n => n.id === currentId);
      if (node) {
        path.unshift(node.id);
        currentId = node.parent_id;
      } else {
        break;
      }
    }
    setSelections(path);
  }, [selectedId, nodes]);

  // Handle a change in a specific dropdown level
  const handleSelect = (level: number, nodeId: string) => {
    const newSelections = selections.slice(0, level); // Keep everything up to this level
    if (nodeId) {
      newSelections.push(nodeId);
      onChange(nodeId);
    } else {
      // If "Select" is chosen and it's not the top level,
      // the new "selected" node is the parent of this level
      if (newSelections.length > 0) {
        onChange(newSelections[newSelections.length - 1]);
      } else {
        onChange(""); // Top level cleared
      }
    }
    setSelections(newSelections);
  };

  // Dynamically compute the dropdowns to render based on the current selections
  const dropdownsToRender = useMemo(() => {
    const dropdowns: { level: number; options: RawNode[]; selectedValue: string }[] = [];
    
    // Level 0: Roots
    let currentOptions = nodes.filter(n => !n.parent_id);
    
    let level = 0;
    while (currentOptions.length > 0) {
      const selectedValue = selections[level] || "";
      
      dropdowns.push({
        level,
        options: currentOptions,
        selectedValue
      });
      
      // If there is a selected value, fetch its children for the next level
      if (selectedValue) {
        currentOptions = nodes.filter(n => n.parent_id === selectedValue);
        if (currentOptions.length > 0) {
          level++;
        } else {
          break; // Reached a leaf node
        }
      } else {
        break; // Stop rendering further levels until this one is selected
      }
    }
    
    return dropdowns;
  }, [nodes, selections]);

  return (
    <div className="flex flex-col gap-3">
      {dropdownsToRender.map(dropdown => (
        <select
          key={`nav-level-${dropdown.level}`}
          value={dropdown.selectedValue}
          onChange={(e) => handleSelect(dropdown.level, e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
        >
          <option value="">— Select Navigation Level {dropdown.level + 1} —</option>
          {dropdown.options.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
