
export interface ProcessedFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
}

class FileProcessor {
  async processFiles(files: File[]): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = [];
    
    for (const file of files) {
      try {
        const content = await this.extractTextFromFile(file);
        processedFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content,
          type: '.' + file.name.split('.').pop()?.toLowerCase(),
          size: file.size
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
    
    return processedFiles;
  }

  private async extractTextFromFile(file: File): Promise<string> {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case '.txt':
        return await file.text();
      case '.pdf':
        // For demo purposes, return placeholder text
        return `PDF content from ${file.name}: This is sample content extracted from the PDF file.`;
      case '.docx':
      case '.doc':
        // For demo purposes, return placeholder text
        return `Document content from ${file.name}: This is sample content extracted from the document file.`;
      default:
        return await file.text();
    }
  }
}

export const fileProcessor = new FileProcessor();
