
const GeminiService = require('../services/geminiService');
const FileService = require('../services/fileService');

class ResearchController {
  constructor() {
    this.geminiService = new GeminiService(process.env.GEMINI_API_KEY);
    this.fileService = new FileService();
  }

  async processResearch(req, res) {
    try {
      const { query, deepResearch } = req.body;
      
      // Process uploaded files
      const processedFiles = req.files && req.files.length > 0 
        ? await this.fileService.processFiles(req.files)
        : [];

      // Generate thinking steps
      const thinkingSteps = await this.geminiService.generateThinkingSteps(query, processedFiles.length > 0);
      
      // Generate response and mind map in parallel
      const [responseData, mindMapData] = await Promise.all([
        this.geminiService.generateResponse(query, '', processedFiles),
        this.geminiService.generateMindMap(query, processedFiles)
      ]);

      res.json({
        thinkingSteps,
        response: responseData,
        mindMap: mindMapData,
        files: processedFiles
      });

    } catch (error) {
      console.error('Research processing error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async processFollowUp(req, res) {
    try {
      const { query, context, files } = req.body;
      
      const thinkingSteps = await this.geminiService.generateThinkingSteps(query, files && files.length > 0);
      const responseData = await this.geminiService.generateResponse(query, context, files || []);
      
      res.json({
        thinkingSteps,
        response: responseData
      });

    } catch (error) {
      console.error('Follow-up processing error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async expandMindMapNode(req, res) {
    try {
      const { nodeId, currentMindMap, query } = req.body;
      
      const expandedData = await this.geminiService.expandNode(nodeId, currentMindMap, query);
      
      res.json(expandedData);

    } catch (error) {
      console.error('Mind map expansion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = ResearchController;
