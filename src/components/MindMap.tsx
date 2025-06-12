import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Download, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Node {
  id: string;
  label: string;
  type: 'center' | 'main' | 'sub';
}

interface Edge {
  source: string;
  target: string;
}

interface MindMapProps {
  data?: {
    nodes: Node[];
    edges: Edge[];
  };
}

const MindMap = ({ data }: MindMapProps) => {
  const cyRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<any>(null);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically import Cytoscape to avoid SSR issues
      import('cytoscape').then((cytoscapeModule) => {
        const cytoscape = cytoscapeModule.default;
        
        if (cyRef.current && !cy) {
          const cytoscapeInstance = cytoscape({
            container: cyRef.current,
            elements: data ? [
              ...data.nodes.map(node => ({
                data: { 
                  id: node.id, 
                  label: node.label,
                  type: node.type
                }
              })),
              ...data.edges.map(edge => ({
                data: { 
                  source: edge.source, 
                  target: edge.target 
                }
              }))
            ] : [],
            style: [
              {
                selector: 'node',
                style: {
                  'background-color': '#3b82f6',
                  'label': 'data(label)',
                  'color': '#ffffff',
                  'text-valign': 'center',
                  'text-halign': 'center',
                  'font-size': '12px',
                  'width': 80,
                  'height': 80,
                  'border-width': 2,
                  'border-color': '#1e40af'
                }
              },
              {
                selector: 'node[type="center"]',
                style: {
                  'background-color': '#dc2626',
                  'border-color': '#991b1b',
                  'width': 100,
                  'height': 100,
                  'font-size': '14px',
                  'font-weight': 'bold'
                }
              },
              {
                selector: 'node[type="main"]',
                style: {
                  'background-color': '#7c3aed',
                  'border-color': '#5b21b6',
                  'width': 90,
                  'height': 90
                }
              },
              {
                selector: 'edge',
                style: {
                  'width': 3,
                  'line-color': '#64748b',
                  'target-arrow-color': '#64748b',
                  'target-arrow-shape': 'triangle',
                  'curve-style': 'bezier'
                }
              },
              {
                selector: 'node:selected',
                style: {
                  'border-color': '#fbbf24',
                  'border-width': 4
                }
              }
            ],
            layout: {
              name: 'cose',
              fit: true,
              padding: 30,
              randomize: false
            }
          });

          // Add event listeners
          cytoscapeInstance.on('select', 'node', (evt) => {
            setSelectedNode(evt.target.id());
          });

          cytoscapeInstance.on('unselect', 'node', () => {
            setSelectedNode(null);
          });

          setCy(cytoscapeInstance);
        }
      });
    }
  }, [data]);

  const addNode = () => {
    if (!newNodeLabel.trim() || !cy) {
      toast({
        title: "Invalid Input",
        description: "Please enter a label for the new node.",
        variant: "destructive"
      });
      return;
    }

    const newId = `node_${Date.now()}`;
    cy.add({
      data: { 
        id: newId, 
        label: newNodeLabel,
        type: 'sub'
      }
    });

    // Connect to selected node or center node
    const targetId = selectedNode || cy.nodes('[type="center"]').id();
    if (targetId) {
      cy.add({
        data: { 
          source: targetId, 
          target: newId 
        }
      });
    }

    cy.layout({ name: 'cose' }).run();
    setNewNodeLabel('');
    
    toast({
      title: "Node Added",
      description: "New node has been added to the mind map."
    });
  };

  const deleteNode = () => {
    if (!selectedNode || !cy) {
      toast({
        title: "No Selection",
        description: "Please select a node to delete.",
        variant: "destructive"
      });
      return;
    }

    const selectedNodeData = cy.getElementById(selectedNode);
    if (selectedNodeData.data('type') === 'center') {
      toast({
        title: "Cannot Delete",
        description: "The center node cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    cy.remove(selectedNodeData);
    setSelectedNode(null);
    
    toast({
      title: "Node Deleted",
      description: "Selected node has been removed from the mind map."
    });
  };

  const exportAsPng = () => {
    if (!cy) return;

    const png64 = cy.png({
      output: 'blob',
      bg: '#0f172a',
      full: true,
      scale: 2
    });

    // Create download link
    const url = URL.createObjectURL(png64);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Mind map has been exported as PNG."
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Controls */}
      <Card className="m-4 p-4 bg-slate-800 border-slate-600">
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="Add new node..."
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNode()}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Button onClick={addNode} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={deleteNode} 
              size="sm" 
              variant="destructive"
              disabled={!selectedNode}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button onClick={exportAsPng} size="sm" variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <Download className="h-4 w-4 mr-1" />
              Export PNG
            </Button>
          </div>

          {selectedNode && (
            <div className="text-sm text-slate-300">
              Selected: {cy?.getElementById(selectedNode).data('label')}
            </div>
          )}
        </div>
      </Card>

      {/* Mind Map Canvas */}
      <div ref={cyRef} className="flex-1 bg-slate-900" />
    </div>
  );
};

export default MindMap;
