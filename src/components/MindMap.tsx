import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Download, Plus, Trash2, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Node {
  id: string;
  label: string;
  type: 'center' | 'main' | 'sub';
  level: number;
  parentId: string | null;
  expanded: boolean;
  hasChildren: boolean;
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
  query?: string;
}

const MindMap = ({ data, query }: MindMapProps) => {
  const cyRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<any>(null);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(3);

  useEffect(() => {
    if (typeof window !== 'undefined' && cyRef.current && !isInitialized) {
      import('cytoscape').then((cytoscapeModule) => {
        const cytoscape = cytoscapeModule.default;
        
        const cytoscapeInstance = cytoscape({
          container: cyRef.current,
          elements: [],
          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#4f46e5',
                'label': 'data(label)',
                'color': '#ffffff',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '10px',
                'font-weight': 'bold',
                'width': 'mapData(chars, 5, 30, 60, 200)',
                'height': 'mapData(chars, 5, 30, 40, 80)',
                'padding': '8px',
                'shape': 'round-rectangle',
                'border-width': 2,
                'border-color': '#3730a3',
                'text-wrap': 'wrap',
                'text-max-width': 'mapData(chars, 5, 30, 50, 180)',
                'min-width': '60px',
                'min-height': '40px'
              }
            },
            {
              selector: 'node[type="center"]',
              style: {
                'background-color': '#dc2626',
                'border-color': '#991b1b',
                'font-size': '12px',
                'font-weight': 'bold',
                'width': 'mapData(chars, 5, 25, 120, 180)',
                'height': 'mapData(chars, 5, 25, 60, 90)',
                'text-max-width': 'mapData(chars, 5, 25, 100, 160)'
              }
            },
            {
              selector: 'node[type="main"]',
              style: {
                'background-color': '#7c3aed',
                'border-color': '#5b21b6',
                'font-size': '11px',
                'width': 'mapData(chars, 5, 20, 80, 140)',
                'height': 'mapData(chars, 5, 20, 50, 70)',
                'text-max-width': 'mapData(chars, 5, 20, 70, 120)'
              }
            },
            {
              selector: 'node[type="sub"]',
              style: {
                'background-color': '#059669',
                'border-color': '#047857',
                'font-size': '10px',
                'width': 'mapData(chars, 5, 15, 70, 120)',
                'height': 'mapData(chars, 5, 15, 45, 65)',
                'text-max-width': 'mapData(chars, 5, 15, 60, 100)'
              }
            },
            {
              selector: 'node[type="detail"]',
              style: {
                'background-color': '#0891b2',
                'border-color': '#0e7490',
                'font-size': '9px',
                'width': 'mapData(chars, 5, 12, 60, 100)',
                'height': 'mapData(chars, 5, 12, 35, 55)',
                'text-max-width': 'mapData(chars, 5, 12, 50, 80)'
              }
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
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
                'border-width': 4,
                'overlay-color': '#fbbf24',
                'overlay-opacity': 0.3
              }
            },
            {
              selector: 'node[hasChildren="true"]',
              style: {
                'border-style': 'double',
                'border-width': 3
              }
            }
          ],
          layout: {
            name: 'cose',
            fit: true,
            padding: 50,
            randomize: false,
            animate: true,
            animationDuration: 1000
          },
          wheelSensitivity: 0.1,
          maxZoom: 3,
          minZoom: 0.3
        });

        cytoscapeInstance.on('select', 'node', (evt) => {
          setSelectedNode(evt.target.id());
        });

        cytoscapeInstance.on('unselect', 'node', () => {
          setSelectedNode(null);
        });

        cytoscapeInstance.on('dbltap', 'node', async (evt) => {
          const node = evt.target;
          const nodeData = node.data();
          
          if (nodeData.hasChildren && nodeData.level >= currentLevel - 1) {
            await expandNode(nodeData.id);
          }
        });

        setCy(cytoscapeInstance);
        setIsInitialized(true);
      });
    }
  }, [isInitialized]);

  useEffect(() => {
    if (cy && data && isInitialized) {
      updateMindMap();
    }
  }, [data, cy, isInitialized, currentLevel]);

  const updateMindMap = () => {
    if (!cy || !data) return;

    cy.elements().remove();
    
    // Filter nodes based on current level
    const visibleNodes = data.nodes.filter(node => 
      node.level < currentLevel || (node.level === currentLevel && node.expanded)
    );
    
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleEdges = data.edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );

    const elements = [
      ...visibleNodes.map(node => ({
        data: { 
          id: node.id, 
          label: node.label,
          type: node.type,
          level: node.level,
          hasChildren: node.hasChildren,
          chars: node.label.length
        }
      })),
      ...visibleEdges.map(edge => ({
        data: { 
          source: edge.source, 
          target: edge.target 
        }
      }))
    ];

    cy.add(elements);
    
    setTimeout(() => {
      cy.layout({
        name: 'cose',
        fit: true,
        padding: 50,
        animate: true,
        animationDuration: 1000
      }).run();
    }, 100);
  };

  const expandNode = async (nodeId: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/mindmap/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nodeId,
          currentMindMap: data,
          query
        })
      });

      if (response.ok) {
        const expandedData = await response.json();
        // Add expanded nodes to current data
        // This would require updating the parent component's state
        toast({
          title: "Node Expanded",
          description: "Additional details have been loaded."
        });
      }
    } catch (error) {
      console.error('Error expanding node:', error);
    }
  };

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
        type: 'sub',
        level: 3,
        hasChildren: false
      }
    });

    const targetId = selectedNode || cy.nodes('[type="center"]').id();
    if (targetId) {
      cy.add({
        data: { 
          source: targetId, 
          target: newId 
        }
      });
    }

    cy.layout({
      name: 'cose',
      animate: true,
      animationDuration: 500,
      fit: false
    }).run();
    
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
    
    setTimeout(() => {
      cy.layout({
        name: 'cose',
        animate: true,
        animationDuration: 500,
        fit: false
      }).run();
    }, 100);
    
    toast({
      title: "Node Deleted",
      description: "Selected node has been removed."
    });
  };

  const resetView = () => {
    if (!cy) return;
    cy.fit();
    cy.center();
  };

  const exportAsPng = () => {
    if (!cy) return;

    try {
      const png64 = cy.png({
        output: 'blob',
        bg: '#0f1419',
        full: true,
        scale: 2,
        maxWidth: 2000,
        maxHeight: 2000
      });

      const url = URL.createObjectURL(png64);
      const link = document.createElement('a');
      link.href = url;
      link.download = `novah_mindmap_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Mind map exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export mind map.",
        variant: "destructive"
      });
    }
  };

  const showMoreLevels = () => {
    setCurrentLevel(prev => Math.min(prev + 2, 6));
  };

  const showLessLevels = () => {
    setCurrentLevel(prev => Math.max(prev - 2, 2));
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50">
      {/* Controls */}
      <Card className="m-4 p-4 glass-effect border-gray-700/50">
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="Add new node..."
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNode()}
              className="glass-effect border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
            />
            <Button onClick={addNode} size="sm" className="bg-blue-600 hover:bg-blue-700 shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                onClick={deleteNode} 
                size="sm" 
                variant="destructive"
                disabled={!selectedNode}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button 
                onClick={resetView} 
                size="sm" 
                variant="outline" 
                className="glass-effect border-white/20 text-white hover:bg-white/10 shrink-0"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset View
              </Button>
              <Button 
                onClick={exportAsPng} 
                size="sm" 
                variant="outline" 
                className="glass-effect border-white/20 text-white hover:bg-white/10 shrink-0"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={showLessLevels}
                size="sm"
                variant="outline"
                disabled={currentLevel <= 2}
                className="glass-effect border-white/20 text-white hover:bg-white/10"
              >
                Show Less
              </Button>
              <span className="text-white text-sm px-2 py-1">
                Level {currentLevel}
              </span>
              <Button 
                onClick={showMoreLevels}
                size="sm"
                variant="outline"
                disabled={currentLevel >= 6}
                className="glass-effect border-white/20 text-white hover:bg-white/10"
              >
                Show More
              </Button>
            </div>
          </div>

          {selectedNode && cy && (
            <div className="text-sm text-gray-300 p-2 glass-effect rounded">
              <strong>Selected:</strong> {cy.getElementById(selectedNode).data('label')}
              <br />
              <small className="text-gray-400">Double-click nodes with borders to expand</small>
            </div>
          )}
        </div>
      </Card>

      {/* Mind Map Canvas */}
      <div 
        ref={cyRef} 
        className="flex-1 bg-gray-800/50 border-t border-gray-700/50"
        style={{ 
          minHeight: '400px',
          position: 'relative'
        }}
      />
    </div>
  );
};

export default MindMap;
