"use client";

import React, { useState, useMemo } from "react";

interface RawNode {
  id: string;
  name: string;
  full_path: string;
  level: number;
  parent_id: string | null;
  children?: RawNode[];
}

interface TreePickerProps {
  nodes: RawNode[];
  selectedId: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
}

function TreePickerNode({
  node,
  selectedId,
  onChange,
  disabled,
}: {
  node: RawNode;
  selectedId: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(node.level < 2);
  const hasChildren = node.children && node.children.length > 0;
  
  // Only leaf nodes can be selected
  const isSelectable = !hasChildren;
  const isSelected = selectedId === node.id;

  return (
    <div className="ml-4 first:ml-0 mt-1">
      <div 
        className={`flex items-center space-x-2 py-1 px-2 rounded-md ${
          isSelected ? "bg-[#FDF5F3] border border-[#E0A99E]/50" : ""
        } ${
          isSelectable && !disabled ? "cursor-pointer hover:bg-stone-50" : 
          hasChildren ? "cursor-default text-stone-600 font-semibold" : "cursor-not-allowed opacity-50"
        }`}
        onClick={() => {
          if (isSelectable && !disabled) {
            onChange(node.id);
          } else if (hasChildren) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {hasChildren && (
          <button 
            type="button"
            className="w-4 h-4 flex items-center justify-center bg-stone-200 rounded text-[10px]"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? "-" : "+"}
          </button>
        )}
        {!hasChildren && <div className="w-4 h-4" />}
        <span className={`text-sm ${isSelectable ? "text-stone-800" : "text-stone-500"}`}>
          {node.name}
        </span>
        {isSelected && <span className="text-xs text-emerald-600 font-bold ml-auto">✓</span>}
      </div>
      
      {hasChildren && isOpen && (
        <div className="border-l border-stone-200 ml-2 pl-2">
          {node.children!.map(child => (
            <TreePickerNode 
              key={child.id} 
              node={child} 
              selectedId={selectedId} 
              onChange={onChange}
              disabled={disabled} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreePicker({ nodes, selectedId, onChange, disabled = false }: TreePickerProps) {
  const tree = useMemo(() => {
    const map = new Map<string, RawNode>();
    nodes.forEach(node => map.set(node.id, { ...node, children: [] }));
    const rootNodes: RawNode[] = [];
    nodes.forEach(node => {
      if (node.parent_id && map.has(node.parent_id)) {
        map.get(node.parent_id)!.children!.push(map.get(node.id)!);
      } else {
        rootNodes.push(map.get(node.id)!);
      }
    });
    return rootNodes;
  }, [nodes]);

  return (
    <div className={`p-3 border border-stone-200 bg-white rounded-xl overflow-y-auto max-h-64 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
      {tree.length === 0 ? (
        <div className="text-sm text-stone-400 p-2">Loading navigation tree...</div>
      ) : (
        tree.map(root => (
          <TreePickerNode 
            key={root.id} 
            node={root} 
            selectedId={selectedId} 
            onChange={onChange} 
            disabled={disabled}
          />
        ))
      )}
    </div>
  );
}
