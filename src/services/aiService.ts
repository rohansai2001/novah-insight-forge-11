
import { ResearchController } from '../server/controllers/researchController';

interface ThinkingStep {
  id: number;
  type: 'file_processing' | 'planning' | 'searching' | 'learning' | 'reflection' | 'replanning' | 'answer_generation';
  title: string;
  content: string;
  status: 'processing' | 'complete' | 'pending';
  data?: any;
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
    console.log('Processing research request:', { query, fileCount: files.length, deepResearch });
    
    try {
      const mode = deepResearch ? 'deep' : 'normal';
      const result = await ResearchController.processResearch({
        query,
        files,
        mode
      });

      return {
        ...result,
        files
      };
    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error('Failed to process research query');
    }
  }

  async processFollowUp(query: string, context: string, files: any[]): Promise<{ 
    thinkingSteps: ThinkingStep[]; 
    response: { content: string; sources: string[] } 
  }> {
    console.log('Processing follow-up:', query);
    
    try {
      return await ResearchController.processFollowUp(query, context, files);
    } catch (error) {
      console.error('Follow-up processing error:', error);
      throw new Error('Failed to process follow-up query');
    }
  }

  async expandMindMapNode(nodeId: string, currentMindMap: any, query: string): Promise<any> {
    console.log('Expanding mind map node:', nodeId);
    
    try {
      return await ResearchController.expandMindMapNode(nodeId, currentMindMap, query);
    } catch (error) {
      console.error('Mind map expansion error:', error);
      throw new Error('Failed to expand mind map node');
    }
  }
}

export const aiService = new AIService();
