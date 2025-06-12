
interface MindMapNode {
  id: string;
  label: string;
  type: 'center' | 'main' | 'sub' | 'detail';
  level: number;
  parentId?: string;
  expanded: boolean;
  hasChildren: boolean;
}

interface MindMapEdge {
  source: string;
  target: string;
}

interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export class MindMapService {
  static convertChunkDataToMindMap(data: any, query: string): MindMapData {
    const nodes: MindMapNode[] = [];
    const edges: MindMapEdge[] = [];

    // Center node
    const centerNode: MindMapNode = {
      id: 'center',
      label: query.length > 40 ? query.substring(0, 40) + '...' : query,
      type: 'center',
      level: 0,
      expanded: true,
      hasChildren: true
    };
    nodes.push(centerNode);

    // Process data recursively
    this.processNode(data, nodes, edges, 'center', 1);

    return { nodes, edges };
  }

  private static processNode(
    nodeData: any, 
    nodes: MindMapNode[], 
    edges: MindMapEdge[], 
    parentId: string, 
    level: number
  ): void {
    if (!nodeData) return;

    const nodeId = `node_${nodes.length}`;
    const node: MindMapNode = {
      id: nodeId,
      label: nodeData.title || 'Untitled',
      type: level === 1 ? 'main' : level === 2 ? 'sub' : 'detail',
      level,
      parentId,
      expanded: level <= 2,
      hasChildren: nodeData.children && nodeData.children.length > 0
    };

    nodes.push(node);
    edges.push({ source: parentId, target: nodeId });

    // Process children if they exist and level is not too deep
    if (nodeData.children && level < 4) {
      nodeData.children.forEach((child: any) => {
        this.processNode(child, nodes, edges, nodeId, level + 1);
      });
    }
  }

  static async expandNode(nodeId: string, currentMap: MindMapData, newData: any[]): Promise<MindMapData> {
    const nodes = [...currentMap.nodes];
    const edges = [...currentMap.edges];

    newData.forEach((data, index) => {
      const newNodeId = `${nodeId}_expanded_${index}`;
      const node: MindMapNode = {
        id: newNodeId,
        label: data.title || `Expansion ${index + 1}`,
        type: 'detail',
        level: 3,
        parentId: nodeId,
        expanded: false,
        hasChildren: false
      };

      nodes.push(node);
      edges.push({ source: nodeId, target: newNodeId });
    });

    return { nodes, edges };
  }

  static getSampleMindMapData(query: string): MindMapData {
    return {
      nodes: [
        {
          id: 'center',
          label: query.substring(0, 30) + (query.length > 30 ? '...' : ''),
          type: 'center',
          level: 0,
          expanded: true,
          hasChildren: true
        },
        {
          id: 'analysis',
          label: 'Core Analysis',
          type: 'main',
          level: 1,
          parentId: 'center',
          expanded: true,
          hasChildren: true
        },
        {
          id: 'trends',
          label: 'Market Trends',
          type: 'main',
          level: 1,
          parentId: 'center',
          expanded: true,
          hasChildren: true
        },
        {
          id: 'implementation',
          label: 'Implementation',
          type: 'main',
          level: 1,
          parentId: 'center',
          expanded: false,
          hasChildren: true
        },
        {
          id: 'future',
          label: 'Future Outlook',
          type: 'main',
          level: 1,
          parentId: 'center',
          expanded: false,
          hasChildren: true
        },
        {
          id: 'analysis_sub1',
          label: 'Key Factors',
          type: 'sub',
          level: 2,
          parentId: 'analysis',
          expanded: false,
          hasChildren: false
        },
        {
          id: 'analysis_sub2',
          label: 'Research Methods',
          type: 'sub',
          level: 2,
          parentId: 'analysis',
          expanded: false,
          hasChildren: false
        },
        {
          id: 'trends_sub1',
          label: 'Growth Patterns',
          type: 'sub',
          level: 2,
          parentId: 'trends',
          expanded: false,
          hasChildren: false
        },
        {
          id: 'trends_sub2',
          label: 'Market Dynamics',
          type: 'sub',
          level: 2,
          parentId: 'trends',
          expanded: false,
          hasChildren: false
        }
      ],
      edges: [
        { source: 'center', target: 'analysis' },
        { source: 'center', target: 'trends' },
        { source: 'center', target: 'implementation' },
        { source: 'center', target: 'future' },
        { source: 'analysis', target: 'analysis_sub1' },
        { source: 'analysis', target: 'analysis_sub2' },
        { source: 'trends', target: 'trends_sub1' },
        { source: 'trends', target: 'trends_sub2' }
      ]
    };
  }
}
