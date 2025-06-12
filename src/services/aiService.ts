
import { ResearchController } from '../server/controllers/researchController';

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

  async processResearch(query: string, files: any[], deepResearch: boolean): Promise<ResearchResponse> {
    await this.delay(1000); // Simulate network delay
    return await ResearchController.processResearch(query, files, deepResearch);
  }

  async processFollowUp(query: string, context: string, files: any[]): Promise<{ thinkingSteps: ThinkingStep[]; response: { content: string; sources: string[] } }> {
    await this.delay(800);
    return await ResearchController.processFollowUp(query, context, files);
  }

  async expandMindMapNode(nodeId: string, currentMindMap: any, query: string): Promise<any> {
    await this.delay(1000);
    return await ResearchController.expandMindMapNode(nodeId, currentMindMap, query);
  }
}

export const aiService = new AIService();
