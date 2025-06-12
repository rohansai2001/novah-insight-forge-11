
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const ResearchController = require('./controllers/researchController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize controller
const researchController = new ResearchController();

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

// API Routes
app.post('/api/research', upload.array('files', 2), (req, res) => {
  researchController.processResearch(req, res);
});

app.post('/api/followup', (req, res) => {
  researchController.processFollowUp(req, res);
});

app.post('/api/mindmap/expand', (req, res) => {
  researchController.expandMindMapNode(req, res);
});

app.listen(PORT, () => {
  console.log(`Novah server running on port ${PORT}`);
});
