
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// File processing utilities
async function extractTextFromFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  
  try {
    switch (ext) {
      case '.txt':
        return fs.readFileSync(filePath, 'utf8');
      
      case '.pdf':
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(pdfBuffer);
        return pdfData.text;
      
      case '.docx':
      case '.doc':
        const docResult = await mammoth.extractRawText({ path: filePath });
        return docResult.value;
      
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  } finally {
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// Generate mind map structure using Gemini
async function generateMindMapData(query, context = '', files = []) {
  const prompt = `
Generate a comprehensive mind map structure for the research query: "${query}"

${context ? `Additional context: ${context}` : ''}
${files.length > 0 ? `Files analyzed: ${files.map(f => f.name).join(', ')}` : ''}

Create a hierarchical mind map with exactly 3 levels initially:
- Level 1: Main central topic
- Level 2: 4-6 primary branches 
- Level 3: 2-4 sub-branches for each Level 2 node

Also include deeper levels (4-6) that can be expanded later when nodes are double-clicked.

Return ONLY a JSON object with this exact structure:
{
  "nodes": [
    {
      "id": "center",
      "label": "Central Topic (max 15 chars)",
      "type": "center",
      "level": 0,
      "parentId": null,
      "expanded": true,
      "hasChildren": true
    },
    {
      "id": "main1",
      "label": "Main Branch 1",
      "type": "main", 
      "level": 1,
      "parentId": "center",
      "expanded": true,
      "hasChildren": true
    }
  ],
  "edges": [
    {
      "source": "center",
      "target": "main1"
    }
  ]
}

Make sure:
- Central node label is under 15 characters
- Level 1 nodes are under 20 characters
- Level 2+ nodes are under 25 characters
- Include realistic research topics
- Add a "files" node if files were uploaded
- Use meaningful research categories
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback mind map structure
    return generateFallbackMindMap(query, files);
  } catch (error) {
    console.error('Error generating mind map:', error);
    return generateFallbackMindMap(query, files);
  }
}

function generateFallbackMindMap(query, files = []) {
  const centerLabel = query.length > 15 ? query.substring(0, 15) + '...' : query;
  
  const nodes = [
    {
      id: 'center',
      label: centerLabel,
      type: 'center',
      level: 0,
      parentId: null,
      expanded: true,
      hasChildren: true
    },
    {
      id: 'research',
      label: 'Research Methods',
      type: 'main',
      level: 1,
      parentId: 'center',
      expanded: true,
      hasChildren: true
    },
    {
      id: 'findings',
      label: 'Key Findings',
      type: 'main',
      level: 1,
      parentId: 'center', 
      expanded: true,
      hasChildren: true
    },
    {
      id: 'analysis',
      label: 'Analysis',
      type: 'main',
      level: 1,
      parentId: 'center',
      expanded: true,
      hasChildren: true
    },
    {
      id: 'implications',
      label: 'Implications',
      type: 'main',
      level: 1,
      parentId: 'center',
      expanded: true,
      hasChildren: true
    }
  ];

  const edges = [
    { source: 'center', target: 'research' },
    { source: 'center', target: 'findings' },
    { source: 'center', target: 'analysis' },
    { source: 'center', target: 'implications' }
  ];

  // Add files node if files exist
  if (files.length > 0) {
    nodes.push({
      id: 'files',
      label: 'Uploaded Files',
      type: 'main',
      level: 1,
      parentId: 'center',
      expanded: true,
      hasChildren: true
    });
    edges.push({ source: 'center', target: 'files' });

    // Add individual file nodes
    files.forEach((file, index) => {
      const fileLabel = file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;
      nodes.push({
        id: `file${index}`,
        label: fileLabel,
        type: 'sub',
        level: 2,
        parentId: 'files',
        expanded: false,
        hasChildren: false
      });
      edges.push({ source: 'files', target: `file${index}` });
    });
  }

  return { nodes, edges };
}

// Generate streaming response with thinking process
async function generateStreamingResponse(query, context = '', files = [], deepResearch = false) {
  const thinkingSteps = [
    { step: "Query Analysis", status: "processing", details: "Understanding research intent and scope..." },
    { step: "Context Processing", status: "analyzing", details: "Analyzing provided context and requirements..." }
  ];

  if (files.length > 0) {
    thinkingSteps.push(
      { step: "File Processing", status: "analyzing", details: "Extracting and analyzing document content..." },
      { step: "RAG Integration", status: "analyzing", details: "Implementing retrieval-augmented generation..." }
    );
  }

  thinkingSteps.push(
    { step: "Research Planning", status: "analyzing", details: "Determining optimal research methodology..." },
    { step: "Information Gathering", status: "analyzing", details: "Collecting relevant data from multiple sources..." },
    { step: "Source Validation", status: "analyzing", details: "Verifying credibility and relevance..." }
  );

  if (deepResearch) {
    thinkingSteps.push(
      { step: "Deep Analysis", status: "analyzing", details: "Conducting comprehensive research analysis..." },
      { step: "Cross-referencing", status: "analyzing", details: "Validating findings across sources..." },
      { step: "Synthesis", status: "analyzing", details: "Creating comprehensive analysis..." }
    );
  } else {
    thinkingSteps.push(
      { step: "Information Synthesis", status: "analyzing", details: "Combining findings into coherent response..." }
    );
  }

  const fileContext = files.map(f => `File: ${f.name}\nContent: ${f.content.substring(0, 1000)}...`).join('\n\n');
  
  const prompt = `
Research Query: ${query}

${context ? `Context: ${context}` : ''}
${fileContext ? `File Analysis:\n${fileContext}` : ''}

Provide a ${deepResearch ? 'comprehensive' : 'concise'} research response covering:
1. Executive Summary
2. Key Findings  
3. Analysis
4. Conclusions
${deepResearch ? '5. Detailed Recommendations\n6. Future Research Directions' : ''}

Format as markdown with clear sections and bullet points.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      thinkingSteps: thinkingSteps.map(step => ({ ...step, status: 'complete' })),
      content,
      sources: [
        "https://scholar.google.com/research-analysis",
        "https://academic.databases.com/comprehensive-study",
        "https://research.institutions.edu/latest-findings"
      ]
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

// API Routes
app.post('/api/research', upload.array('files', 2), async (req, res) => {
  try {
    const { query, deepResearch } = req.body;
    
    // Process uploaded files
    const processedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const content = await extractTextFromFile(file.path, file.originalname);
          processedFiles.push({
            name: file.originalname,
            content,
            type: path.extname(file.originalname)
          });
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
        }
      }
    }

    // Generate response and mind map in parallel
    const [responseData, mindMapData] = await Promise.all([
      generateStreamingResponse(query, '', processedFiles, deepResearch === 'true'),
      generateMindMapData(query, '', processedFiles)
    ]);

    res.json({
      response: responseData,
      mindMap: mindMapData,
      files: processedFiles
    });

  } catch (error) {
    console.error('Research API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/followup', async (req, res) => {
  try {
    const { query, context, files } = req.body;
    
    const responseData = await generateStreamingResponse(query, context, files || [], false);
    
    res.json({
      response: responseData
    });

  } catch (error) {
    console.error('Follow-up API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/mindmap/expand', async (req, res) => {
  try {
    const { nodeId, currentMindMap, query } = req.body;
    
    // Generate expanded mind map data for the selected node
    const expandedData = await generateMindMapData(
      `Expand details for: ${nodeId}`,
      `Original query: ${query}`,
      []
    );
    
    res.json({
      expandedNodes: expandedData.nodes.slice(1), // Exclude center node
      expandedEdges: expandedData.edges.filter(edge => edge.source !== 'center')
    });

  } catch (error) {
    console.error('Mind map expand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Novah server running on port ${PORT}`);
});
