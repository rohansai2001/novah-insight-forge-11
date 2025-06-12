
interface ThinkingStep {
  id: number;
  type: 'planning' | 'researching' | 'sources' | 'analyzing' | 'replanning' | 'file_processing';
  title: string;
  content: string;
  status: 'processing' | 'complete' | 'pending';
}

interface ResearchResponse {
  thinkingSteps: ThinkingStep[];
  response: {
    content: string;
    sources: string[];
  };
  mindMap: any;
  files: any[];
}

export class AIService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateThinkingSteps(query: string, hasFiles: boolean): Promise<ThinkingStep[]> {
    const baseSteps: ThinkingStep[] = [
      {
        id: 1,
        type: 'planning',
        title: 'Research Planning',
        content: `Analyzing the query: "${query}" and determining research strategy.`,
        status: 'pending'
      },
      {
        id: 2,
        type: 'researching',
        title: 'Information Gathering',
        content: 'Collecting relevant information from multiple sources and databases.',
        status: 'pending'
      },
      {
        id: 3,
        type: 'sources',
        title: 'Source Verification',
        content: 'Validating and cross-referencing information from reliable sources.',
        status: 'pending'
      },
      {
        id: 4,
        type: 'analyzing',
        title: 'Data Analysis',
        content: 'Processing and analyzing collected data to extract insights.',
        status: 'pending'
      }
    ];

    if (hasFiles) {
      baseSteps.unshift({
        id: 0,
        type: 'file_processing',
        title: 'File Processing',
        content: 'Extracting and analyzing content from uploaded files.',
        status: 'pending'
      });
    }

    return baseSteps;
  }

  async generateResponse(query: string, context: string, files: any[]): Promise<{ content: string; sources: string[] }> {
    await this.delay(2000);

    const content = `# Research Analysis: ${query}

## Executive Summary
Based on comprehensive research and analysis, here are the key findings regarding your query about ${query}.

## Key Insights
1. **Primary Analysis**: The research reveals several important trends and patterns that are directly relevant to your inquiry.

2. **Market Dynamics**: Current market conditions show significant opportunities and challenges that should be considered.

3. **Technical Considerations**: Implementation aspects require careful attention to best practices and emerging technologies.

4. **Future Outlook**: Projected developments suggest continued evolution in this area with promising prospects.

## Detailed Findings
The analysis indicates that ${query.toLowerCase()} represents a significant area of interest with multiple factors influencing its development. Key stakeholders should consider both immediate implementation strategies and long-term planning approaches.

## Recommendations
- Prioritize systematic implementation based on research findings
- Monitor emerging trends and adapt strategies accordingly
- Consider stakeholder perspectives and market dynamics
- Maintain flexibility for future developments

## Conclusion
The research provides a comprehensive foundation for understanding ${query} and its implications. Further investigation may be warranted for specific implementation details.`;

    const sources = [
      "https://example.com/research-source-1",
      "https://example.com/academic-paper-2",
      "https://example.com/industry-report-3",
      "https://example.com/expert-analysis-4"
    ];

    return { content, sources };
  }

  async generateMindMap(query: string, files: any[]): Promise<any> {
    await this.delay(1500);

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
          label: 'Analysis',
          type: 'main',
          level: 1,
          parentId: 'center',
          expanded: false,
          hasChildren: true
        },
        {
          id: 'trends',
          label: 'Market Trends',
          type: 'main',
          level: 1,
          parentId: 'center',
          expanded: false,
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
        }
      ],
      edges: [
        { source: 'center', target: 'analysis' },
        { source: 'center', target: 'trends' },
        { source: 'center', target: 'implementation' },
        { source: 'center', target: 'future' }
      ]
    };
  }

  async processResearch(query: string, files: any[], deepResearch: boolean): Promise<ResearchResponse> {
    const thinkingSteps = await this.generateThinkingSteps(query, files.length > 0);
    
    const [response, mindMap] = await Promise.all([
      this.generateResponse(query, '', files),
      this.generateMindMap(query, files)
    ]);

    return {
      thinkingSteps,
      response,
      mindMap,
      files
    };
  }

  async processFollowUp(query: string, context: string, files: any[]): Promise<{ thinkingSteps: ThinkingStep[]; response: { content: string; sources: string[] } }> {
    const thinkingSteps = await this.generateThinkingSteps(query, files && files.length > 0);
    const response = await this.generateResponse(query, context, files || []);
    
    return {
      thinkingSteps,
      response
    };
  }

  async expandMindMapNode(nodeId: string, currentMindMap: any, query: string): Promise<any> {
    await this.delay(1000);
    
    const newNodes = [
      {
        id: `${nodeId}_sub1`,
        label: 'Key Factor 1',
        type: 'sub',
        level: 2,
        parentId: nodeId,
        expanded: false,
        hasChildren: false
      },
      {
        id: `${nodeId}_sub2`,
        label: 'Key Factor 2',
        type: 'sub',
        level: 2,
        parentId: nodeId,
        expanded: false,
        hasChildren: false
      }
    ];

    const newEdges = [
      { source: nodeId, target: `${nodeId}_sub1` },
      { source: nodeId, target: `${nodeId}_sub2` }
    ];

    return {
      nodes: [...currentMindMap.nodes, ...newNodes],
      edges: [...currentMindMap.edges, ...newEdges]
    };
  }
}

export const aiService = new AIService();
