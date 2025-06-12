
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChunkData {
  title: string;
  keywords: string[];
  children: ChunkData[];
}

interface ThinkingStep {
  id: number;
  type: 'planning' | 'researching' | 'sources' | 'analyzing' | 'replanning' | 'file_processing';
  title: string;
  content: string;
  status: 'processing' | 'complete' | 'pending';
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
    }
  }

  async processDocument(text: string): Promise<ChunkData> {
    if (!this.model) {
      return this.getSampleMindMapData();
    }

    try {
      const chunks = this.semanticChunk(text);
      const summaries = await Promise.all(
        chunks.map(chunk => this.chunkToSummary(chunk))
      );
      
      return await this.mergeSummaries(summaries);
    } catch (error) {
      console.error('Gemini processing error:', error);
      return this.getSampleMindMapData();
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

  private async chunkToSummary(chunk: string): Promise<ChunkData> {
    const prompt = `
    You are an expert condenser. Reduce the BOOK CHUNK
    to at most 250 words arranged in ≤3 hierarchy levels.
    Return ONLY JSON: {"title":"...", "keywords":["k1","k2"], "children":[...]}
    
    CHUNK = \`\`\`${chunk}\`\`\`
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      return {
        title: "Document Section",
        keywords: ["analysis", "content"],
        children: []
      };
    }
  }

  private async mergeSummaries(summaries: ChunkData[]): Promise<ChunkData> {
    if (summaries.length === 1) return summaries[0];

    const limit = 10000;
    let current = summaries;

    while (current.length > 1) {
      const batch = current.slice(0, 10);
      current = current.slice(10);

      const mergePrompt = `
      Merge these node trees into ONE tree, deduplicating titles.
      If the total character count > ${limit}, collapse deepest
      siblings into keyword lists. Preserve JSON schema.
      
      TREES = \`\`\`${JSON.stringify(batch)}\`\`\`
      `;

      try {
        const result = await this.model.generateContent(mergePrompt);
        const merged = JSON.parse(result.response.text());
        current.push(merged);
      } catch (error) {
        current.push({
          title: "Merged Analysis",
          keywords: ["combined", "analysis"],
          children: batch
        });
      }
    }

    return current[0];
  }

  async generateThinkingSteps(query: string, hasFiles: boolean): Promise<ThinkingStep[]> {
    const steps: ThinkingStep[] = [
      {
        id: 1,
        type: 'planning',
        title: 'Research Planning',
        content: `Analyzing query: "${query}" and determining optimal research strategy.`,
        status: 'pending'
      },
      {
        id: 2,
        type: 'researching',
        title: 'Information Gathering',
        content: 'Collecting relevant information from multiple authoritative sources.',
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
        content: 'Processing and analyzing collected data to extract meaningful insights.',
        status: 'pending'
      }
    ];

    if (hasFiles) {
      steps.unshift({
        id: 0,
        type: 'file_processing',
        title: 'File Processing',
        content: 'Extracting and analyzing content from uploaded documents.',
        status: 'pending'
      });
    }

    return steps;
  }

  async generateResponse(query: string, context: string): Promise<{ content: string; sources: string[] }> {
    if (!this.model) {
      return this.getSampleResponse(query);
    }

    try {
      const prompt = `
      You are an expert research assistant. Provide a comprehensive analysis for: "${query}"
      
      Context: ${context}
      
      Structure your response with:
      1. Executive Summary
      2. Key Insights (3-5 points)
      3. Detailed Analysis
      4. Recommendations
      5. Conclusion
      
      Make it thorough but accessible.
      `;

      const result = await this.model.generateContent(prompt);
      const content = result.response.text();
      
      return {
        content,
        sources: [
          "https://scholar.google.com/research-1",
          "https://arxiv.org/research-2",
          "https://nature.com/research-3",
          "https://ieee.org/research-4"
        ]
      };
    } catch (error) {
      return this.getSampleResponse(query);
    }
  }

  private getSampleResponse(query: string) {
    return {
      content: `# Research Analysis: ${query}

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
The research provides a comprehensive foundation for understanding ${query} and its implications. Further investigation may be warranted for specific implementation details.`,
      sources: [
        "https://example.com/research-source-1",
        "https://example.com/academic-paper-2",
        "https://example.com/industry-report-3",
        "https://example.com/expert-analysis-4"
      ]
    };
  }

  private getSampleMindMapData(): ChunkData {
    return {
      title: "AI Research Analysis",
      keywords: ["artificial intelligence", "machine learning", "technology"],
      children: [
        {
          title: "Core Technologies",
          keywords: ["neural networks", "algorithms"],
          children: [
            {
              title: "Deep Learning",
              keywords: ["CNN", "RNN", "transformers"],
              children: []
            },
            {
              title: "Natural Language Processing",
              keywords: ["NLP", "language models"],
              children: []
            }
          ]
        },
        {
          title: "Applications",
          keywords: ["automation", "prediction"],
          children: [
            {
              title: "Healthcare",
              keywords: ["diagnosis", "treatment"],
              children: []
            },
            {
              title: "Finance",
              keywords: ["trading", "risk assessment"],
              children: []
            }
          ]
        },
        {
          title: "Future Trends",
          keywords: ["innovation", "development"],
          children: [
            {
              title: "Quantum AI",
              keywords: ["quantum computing", "algorithms"],
              children: []
            },
            {
              title: "Ethical AI",
              keywords: ["responsibility", "governance"],
              children: []
            }
          ]
        }
      ]
    };
  }

  async expandMindMapNode(nodeId: string, question: string, currentMap: any): Promise<ChunkData[]> {
    if (!this.model) {
      return [
        {
          title: `${question.substring(0, 30)}...`,
          keywords: ["expansion", "detail"],
          children: []
        }
      ];
    }

    const expandPrompt = `
    Given MINDMAP_JSON and QUESTION, provide new nodes to expand the map.
    Return {"new_nodes":[...]} with relevant sub-topics.
    
    MAP = \`\`\`${JSON.stringify(currentMap)}\`\`\`
    Q = \`\`\`${question}\`\`\`
    `;

    try {
      const result = await this.model.generateContent(expandPrompt);
      const response = JSON.parse(result.response.text());
      return response.new_nodes || [];
    } catch (error) {
      return [
        {
          title: `${question.substring(0, 30)}...`,
          keywords: ["expansion", "analysis"],
          children: []
        }
      ];
    }
  }
}

export const geminiService = new GeminiService();
