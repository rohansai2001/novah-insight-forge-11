
import { geminiService } from '../services/geminiService';
import { MindMapService } from '../services/mindMapService';

export class ResearchController {
  static async processResearch(query: string, files: any[], deepResearch: boolean) {
    try {
      console.log('Processing research for:', query);
      
      // Generate thinking steps
      const thinkingSteps = await geminiService.generateThinkingSteps(query, files.length > 0);
      
      // Process files if any
      let fileContext = '';
      if (files.length > 0) {
        for (const file of files) {
          if (file.content) {
            fileContext += `File: ${file.name}\n${file.content}\n\n`;
          }
        }
      }
      
      // Generate response
      const response = await geminiService.generateResponse(query, fileContext);
      
      // Generate mind map data
      let mindMapData;
      if (fileContext) {
        const chunkData = await geminiService.processDocument(fileContext);
        mindMapData = MindMapService.convertChunkDataToMindMap(chunkData, query);
      } else {
        mindMapData = MindMapService.getSampleMindMapData(query);
      }

      return {
        thinkingSteps,
        response,
        mindMap: mindMapData,
        files
      };
    } catch (error) {
      console.error('Research processing error:', error);
      throw new Error('Failed to process research query');
    }
  }

  static async processFollowUp(query: string, context: string, files: any[]) {
    try {
      console.log('Processing follow-up:', query);
      
      const thinkingSteps = await geminiService.generateThinkingSteps(query, files && files.length > 0);
      const response = await geminiService.generateResponse(query, context);
      
      return {
        thinkingSteps,
        response
      };
    } catch (error) {
      console.error('Follow-up processing error:', error);
      throw new Error('Failed to process follow-up query');
    }
  }

  static async expandMindMapNode(nodeId: string, currentMindMap: any, query: string) {
    try {
      console.log('Expanding mind map node:', nodeId);
      
      const newNodes = await geminiService.expandMindMapNode(nodeId, query, currentMindMap);
      const expandedMap = await MindMapService.expandNode(nodeId, currentMindMap, newNodes);
      
      return expandedMap;
    } catch (error) {
      console.error('Mind map expansion error:', error);
      throw new Error('Failed to expand mind map node');
    }
  }
}
