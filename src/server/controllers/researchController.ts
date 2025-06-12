
import { geminiService } from '../services/geminiService';

interface ThinkingStep {
  id: number;
  type: 'file_processing' | 'planning' | 'searching' | 'learning' | 'reflection' | 'replanning' | 'answer_generation';
  title: string;
  content: string;
  status: 'processing' | 'complete' | 'pending';
  data?: any;
}

interface ResearchRequest {
  query: string;
  files: any[];
  mode: 'normal' | 'deep';
}

export class ResearchController {
  static async processResearch(request: ResearchRequest): Promise<{
    thinkingSteps: ThinkingStep[];
    response: { content: string; sources: string[] };
    mindMap: any;
  }> {
    const steps: ThinkingStep[] = [];
    let stepId = 1;

    try {
      // Step 1: File Processing
      let fileContext = '';
      let fileChunks: string[] = [];
      
      if (request.files.length > 0) {
        const fileStep: ThinkingStep = {
          id: stepId++,
          type: 'file_processing',
          title: 'Processing uploaded files',
          content: `Extracting and analyzing content from ${request.files.length} file(s)...`,
          status: 'processing'
        };
        steps.push(fileStep);

        for (const file of request.files) {
          if (file.content) {
            const processed = await geminiService.processFileContent(file.content);
            fileChunks = processed.chunks;
            fileContext += `File: ${file.name}\n${processed.summary}\n\n`;
          }
        }

        fileStep.status = 'complete';
        fileStep.content = `Successfully processed ${request.files.length} file(s). Document summary extracted for research context.`;
      }

      // Step 2: Planning
      const planningStep: ThinkingStep = {
        id: stepId++,
        type: 'planning',
        title: 'Research Planning',
        content: 'Analyzing query and generating targeted search plan...',
        status: 'processing'
      };
      steps.push(planningStep);

      const searchQueries = await geminiService.generateSearchQueries(
        request.query,
        fileContext,
        request.mode
      );

      planningStep.status = 'complete';
      planningStep.content = `Generated ${searchQueries.length} targeted research queries based on your ${request.mode} research mode.`;
      planningStep.data = { queries: searchQueries };

      // Step 3: Searching & Learning
      const allLearnings: any[] = [];
      
      for (const searchQuery of searchQueries) {
        const searchingStep: ThinkingStep = {
          id: stepId++,
          type: 'searching',
          title: `Searching: ${searchQuery.query}`,
          content: `Purpose: ${searchQuery.purpose}`,
          status: 'processing',
          data: { query: searchQuery.query }
        };
        steps.push(searchingStep);

        const learningResults = await geminiService.simulateWebSearch(searchQuery);
        allLearnings.push(...learningResults);

        searchingStep.status = 'complete';

        // Add learning steps
        for (const learning of learningResults) {
          const learningStep: ThinkingStep = {
            id: stepId++,
            type: 'learning',
            title: 'Knowledge acquired',
            content: learning.summary,
            status: 'complete',
            data: { source_url: learning.source_url, summary: learning.summary }
          };
          steps.push(learningStep);
        }
      }

      // Step 4: Reflection
      const reflectionStep: ThinkingStep = {
        id: stepId++,
        type: 'reflection',
        title: 'Sufficiency Assessment',
        content: 'Evaluating collected information for completeness...',
        status: 'processing'
      };
      steps.push(reflectionStep);

      const reflection = await geminiService.performReflection(
        request.query,
        allLearnings,
        request.mode
      );

      reflectionStep.status = 'complete';
      reflectionStep.content = `Assessment: ${reflection.decision}. ${reflection.reason}`;
      reflectionStep.data = reflection;

      // Step 5: Answer Generation
      const answerStep: ThinkingStep = {
        id: stepId++,
        type: 'answer_generation',
        title: 'Synthesizing Final Report',
        content: `Generating comprehensive ${request.mode} analysis...`,
        status: 'processing'
      };
      steps.push(answerStep);

      const finalReport = await geminiService.generateFinalReport(
        request.query,
        fileContext,
        allLearnings,
        request.mode
      );

      answerStep.status = 'complete';
      answerStep.content = `Generated ${request.mode} research report with actionable insights.`;

      // Generate mind map
      const mindMapData = await geminiService.generateMindMapData(
        finalReport,
        fileContext,
        searchQueries
      );

      const sources = allLearnings.map(l => l.source_url);

      return {
        thinkingSteps: steps,
        response: {
          content: finalReport,
          sources: sources
        },
        mindMap: mindMapData
      };

    } catch (error) {
      console.error('Research processing error:', error);
      throw new Error('Failed to process research request');
    }
  }

  static async processFollowUp(query: string, context: string, files: any[]): Promise<{
    thinkingSteps: ThinkingStep[];
    response: { content: string; sources: string[] };
  }> {
    const steps: ThinkingStep[] = [];
    
    try {
      const planningStep: ThinkingStep = {
        id: 1,
        type: 'planning',
        title: 'Follow-up Analysis',
        content: `Analyzing follow-up question: "${query}"`,
        status: 'complete'
      };
      steps.push(planningStep);

      const searchQueries = await geminiService.generateSearchQueries(query, context, 'normal');
      const learningResults = await geminiService.simulateWebSearch(searchQueries[0]);
      const report = await geminiService.generateFinalReport(query, context, learningResults, 'normal');

      return {
        thinkingSteps: steps,
        response: {
          content: report,
          sources: learningResults.map(l => l.source_url)
        }
      };
    } catch (error) {
      console.error('Follow-up processing error:', error);
      throw new Error('Failed to process follow-up query');
    }
  }

  static async expandMindMapNode(nodeId: string, currentMindMap: any, query: string): Promise<any> {
    try {
      const newNodes = await geminiService.expandMindMapNode(nodeId, currentMindMap, query);
      
      return {
        ...currentMindMap,
        nodes: [...currentMindMap.nodes, ...newNodes],
        edges: [
          ...currentMindMap.edges,
          ...newNodes.map(node => ({
            source: nodeId,
            target: node.id,
            label: node.relationship
          }))
        ]
      };
    } catch (error) {
      console.error('Mind map expansion error:', error);
      throw new Error('Failed to expand mind map node');
    }
  }
}
