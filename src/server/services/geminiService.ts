
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ThinkingStep {
  id: number;
  type: 'file_processing' | 'planning' | 'searching' | 'learning' | 'reflection' | 'replanning' | 'answer_generation';
  title: string;
  content: string;
  status: 'processing' | 'complete' | 'pending';
  data?: any;
}

interface SearchQuery {
  query: string;
  purpose: string;
}

interface LearningResult {
  source_url: string;
  summary: string;
}

interface ReflectionResult {
  decision: 'sufficient' | 'insufficient';
  reason: string;
}

interface MindMapNode {
  id: string;
  label: string;
  type: 'center' | 'main' | 'file' | 'query' | 'sub' | 'detail';
  level: number;
  parentId?: string;
  expanded: boolean;
  hasChildren: boolean;
  relationship?: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = 'AIzaSyCTZ8K_LViHPPgiY8vwyCIpOc6jCFw41v4';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
  }

  async processFileContent(fileContent: string): Promise<{ chunks: string[], summary: string }> {
    try {
      // Semantic chunking simulation
      const chunks = this.semanticChunk(fileContent);
      
      // Generate summary of first chunk for planning
      const summaryPrompt = `
      Analyze this document excerpt and provide a concise summary in 2-3 sentences:
      
      ${chunks[0]}
      `;
      
      const result = await this.model.generateContent(summaryPrompt);
      const summary = result.response.text();
      
      return { chunks, summary };
    } catch (error) {
      console.error('File processing error:', error);
      return { 
        chunks: [fileContent], 
        summary: "Document uploaded and processed for research context." 
      };
    }
  }

  private semanticChunk(text: string): string[] {
    const sentences = text.split(/(?<=\.)\s+/);
    const chunks: string[] = [];
    let currentChunk = '';
    const targetLength = text.length > 20000 ? 1000 : 600;

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > targetLength && currentChunk) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }

  async generateSearchQueries(query: string, fileContext: string, mode: 'normal' | 'deep'): Promise<SearchQuery[]> {
    try {
      const queryCount = mode === 'deep' ? 5 : 2;
      
      const prompt = `
      Based on the user's query: "${query}"
      And this document context: "${fileContext}"
      
      Generate ${queryCount} focused search queries that will find information NOT present in the document, 
      information that needs verification, or aspects the query asks about which the document only touches briefly.
      
      Return as JSON: {"queries": [{"query": "search term", "purpose": "what this will find"}]}
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = JSON.parse(result.response.text());
      return response.queries || [];
    } catch (error) {
      console.error('Query generation error:', error);
      return mode === 'deep' ? [
        { query: `${query} recent developments`, purpose: "Find latest trends" },
        { query: `${query} market analysis`, purpose: "Get market insights" },
        { query: `${query} expert opinions`, purpose: "Gather expert views" }
      ] : [
        { query: `${query} latest updates`, purpose: "Find recent information" }
      ];
    }
  }

  async simulateWebSearch(searchQuery: SearchQuery): Promise<LearningResult[]> {
    // Simulate web search results with realistic data
    const mockResults: LearningResult[] = [
      {
        source_url: `https://example.com/research-${Date.now()}`,
        summary: `Research findings related to "${searchQuery.query}" showing current market trends and developments.`
      },
      {
        source_url: `https://academic.com/study-${Date.now()}`,
        summary: `Academic study on ${searchQuery.query} with statistical analysis and expert conclusions.`
      },
      {
        source_url: `https://industry.com/report-${Date.now()}`,
        summary: `Industry report covering ${searchQuery.query} including future projections and recommendations.`
      }
    ];
    
    return mockResults;
  }

  async performReflection(originalQuery: string, learningResults: LearningResult[], mode: 'normal' | 'deep'): Promise<ReflectionResult> {
    try {
      const targetWords = mode === 'deep' ? 500 : 200;
      
      const prompt = `
      Review the research findings for query: "${originalQuery}"
      Mode: ${mode} (target: ${targetWords} words)
      
      Findings:
      ${learningResults.map(r => `${r.source_url}: ${r.summary}`).join('\n')}
      
      Decision: Is this information sufficient to write a ${targetWords}-word ${mode} analysis?
      Return JSON: {"decision": "sufficient" or "insufficient", "reason": "explanation"}
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = JSON.parse(result.response.text());
      return response;
    } catch (error) {
      console.error('Reflection error:', error);
      return {
        decision: 'sufficient',
        reason: 'Collected adequate information for analysis.'
      };
    }
  }

  async generateFinalReport(query: string, fileContext: string, learningResults: LearningResult[], mode: 'normal' | 'deep'): Promise<string> {
    try {
      const wordLimit = mode === 'deep' ? 500 : 200;
      
      const prompt = `
      Synthesize a final research report based on:
      
      Query: "${query}"
      Source Document Context: "${fileContext}"
      
      Web Research Findings:
      ${learningResults.map(r => `${r.source_url}: ${r.summary}`).join('\n')}
      
      Write as an expert analyst. Strictly limit to ${wordLimit} words maximum.
      Format with clear sections and actionable insights.
      `;
      
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Report generation error:', error);
      return `# Research Analysis: ${query}\n\nBased on the provided documentation and research findings, here are the key insights and recommendations for your inquiry.`;
    }
  }

  async generateMindMapData(report: string, fileContext: string, queries: SearchQuery[]): Promise<{ nodes: MindMapNode[], edges: any[] }> {
    try {
      const prompt = `
      Based on this research report: "${report}"
      
      Generate a hierarchical mind map structure with:
      - Level 1: Main topic branches (3-4 nodes)
      - Level 2: File content and query categories  
      - Level 3: Detailed sub-topics
      
      Return JSON: {"nodes": [{"id": "string", "label": "string", "type": "main|file|query|sub", "level": number, "parentId": "string", "relationship": "string"}]}
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = JSON.parse(result.response.text());
      
      return this.buildMindMapStructure(response.nodes || [], fileContext, queries);
    } catch (error) {
      console.error('Mind map generation error:', error);
      return this.createDefaultMindMap(fileContext, queries);
    }
  }

  private buildMindMapStructure(aiNodes: any[], fileContext: string, queries: SearchQuery[]): { nodes: MindMapNode[], edges: any[] } {
    const nodes: MindMapNode[] = [
      {
        id: 'center',
        label: 'Research Analysis',
        type: 'center',
        level: 0,
        expanded: true,
        hasChildren: true
      }
    ];

    const edges: any[] = [];

    // Level 1: Main branches
    const mainBranches = [
      { id: 'file-branch', label: 'Document Analysis', relationship: 'contains' },
      { id: 'queries-branch', label: 'Research Queries', relationship: 'explores' },
      { id: 'insights-branch', label: 'Key Insights', relationship: 'reveals' }
    ];

    mainBranches.forEach(branch => {
      nodes.push({
        id: branch.id,
        label: branch.label,
        type: 'main',
        level: 1,
        parentId: 'center',
        expanded: false,
        hasChildren: true,
        relationship: branch.relationship
      });
      
      edges.push({
        source: 'center',
        target: branch.id,
        label: branch.relationship
      });
    });

    // Level 2: File and Query nodes
    nodes.push({
      id: 'file-content',
      label: 'File Content',
      type: 'file',
      level: 2,
      parentId: 'file-branch',
      expanded: false,
      hasChildren: true,
      relationship: 'analyzes'
    });

    edges.push({
      source: 'file-branch',
      target: 'file-content',
      label: 'analyzes'
    });

    queries.forEach((query, index) => {
      const queryId = `query-${index}`;
      nodes.push({
        id: queryId,
        label: query.query.substring(0, 30) + '...',
        type: 'query',
        level: 2,
        parentId: 'queries-branch',
        expanded: false,
        hasChildren: true,
        relationship: 'investigates'
      });

      edges.push({
        source: 'queries-branch',
        target: queryId,
        label: 'investigates'
      });
    });

    return { nodes, edges };
  }

  private createDefaultMindMap(fileContext: string, queries: SearchQuery[]): { nodes: MindMapNode[], edges: any[] } {
    return this.buildMindMapStructure([], fileContext, queries);
  }

  async expandMindMapNode(nodeId: string, currentMap: any, context: string): Promise<MindMapNode[]> {
    try {
      const prompt = `
      Expand the mind map node "${nodeId}" with 3-5 relevant sub-topics.
      Context: "${context}"
      
      Return JSON: {"nodes": [{"id": "string", "label": "string", "relationship": "string"}]}
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = JSON.parse(result.response.text());
      
      return response.nodes?.map((node: any, index: number) => ({
        id: `${nodeId}-child-${index}`,
        label: node.label,
        type: 'detail' as const,
        level: 3,
        parentId: nodeId,
        expanded: false,
        hasChildren: false,
        relationship: node.relationship || 'relates to'
      })) || [];
    } catch (error) {
      console.error('Node expansion error:', error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
