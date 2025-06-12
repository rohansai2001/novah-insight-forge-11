
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

class FileService {
  async extractTextFromFile(filePath, originalName) {
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

  async processFiles(files) {
    const processedFiles = [];
    
    for (const file of files) {
      try {
        const content = await this.extractTextFromFile(file.path, file.originalname);
        processedFiles.push({
          name: file.originalname,
          content,
          type: path.extname(file.originalname),
          size: file.size
        });
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
      }
    }
    
    return processedFiles;
  }
}

module.exports = FileService;
