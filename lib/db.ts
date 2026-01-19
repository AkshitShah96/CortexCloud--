/**
 * In-Memory Database Store
 * 
 * This simulates DynamoDB-style storage for development.
 * Architecture is designed for easy migration to AWS:
 * - Users table → DynamoDB table with PK: user_id
 * - Datasets table → DynamoDB table with PK: user_id, SK: dataset_id
 * - Analyses table → DynamoDB table with PK: dataset_id, SK: analysis_id
 * - File storage → S3 bucket
 */

export interface DBUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBDataset {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string; // S3 key in production
  status: "uploaded" | "processing" | "analyzed" | "error";
  rowCount?: number;
  columnCount?: number;
  columns?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DBAnalysis {
  id: string;
  datasetId: string;
  userId: string;
  status: "pending" | "preprocessing" | "analyzing" | "generating" | "completed" | "error";
  progress: number;
  results?: AnalysisResults;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AnalysisResults {
  summary: {
    totalRows: number;
    totalColumns: number;
    numericColumns: number;
    categoricalColumns: number;
  };
  statistics: {
    column: string;
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  }[];
  trends: {
    type: string;
    description: string;
    confidence: number;
  }[];
  predictions: {
    metric: string;
    currentValue: number;
    predictedValue: number;
    change: number;
    timeframe: string;
  }[];
  anomalies: {
    description: string;
    severity: "low" | "medium" | "high";
    column?: string;
    value?: number;
  }[];
  insights: string[];
  chartData: {
    labels: string[];
    values: number[];
    predictions: number[];
  };
}

export interface DBChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  context?: {
    datasetId?: string;
    analysisId?: string;
  };
  createdAt: string;
}

// In-memory storage (replace with DynamoDB client in production)
class InMemoryDB {
  private users: Map<string, DBUser> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId index
  private datasets: Map<string, DBDataset> = new Map();
  private analyses: Map<string, DBAnalysis> = new Map();
  private chatMessages: Map<string, DBChatMessage[]> = new Map(); // userId -> messages
  private fileStorage: Map<string, string> = new Map(); // storagePath -> file content (base64)

  // User operations
  async createUser(user: DBUser): Promise<DBUser> {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase(), user.id);
    return user;
  }

  async getUserById(id: string): Promise<DBUser | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<DBUser | null> {
    const userId = this.usersByEmail.get(email.toLowerCase());
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async updateUser(id: string, updates: Partial<DBUser>): Promise<DBUser | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  // Dataset operations
  async createDataset(dataset: DBDataset): Promise<DBDataset> {
    this.datasets.set(dataset.id, dataset);
    return dataset;
  }

  async getDatasetById(id: string): Promise<DBDataset | null> {
    return this.datasets.get(id) || null;
  }

  async getDatasetsByUserId(userId: string): Promise<DBDataset[]> {
    return Array.from(this.datasets.values())
      .filter((d) => d.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateDataset(id: string, updates: Partial<DBDataset>): Promise<DBDataset | null> {
    const dataset = this.datasets.get(id);
    if (!dataset) return null;
    const updated = { ...dataset, ...updates, updatedAt: new Date().toISOString() };
    this.datasets.set(id, updated);
    return updated;
  }

  async deleteDataset(id: string): Promise<boolean> {
    const dataset = this.datasets.get(id);
    if (!dataset) return false;
    // Delete associated file
    this.fileStorage.delete(dataset.storagePath);
    // Delete associated analyses
    for (const [analysisId, analysis] of this.analyses) {
      if (analysis.datasetId === id) {
        this.analyses.delete(analysisId);
      }
    }
    this.datasets.delete(id);
    return true;
  }

  // Analysis operations
  async createAnalysis(analysis: DBAnalysis): Promise<DBAnalysis> {
    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  async getAnalysisById(id: string): Promise<DBAnalysis | null> {
    return this.analyses.get(id) || null;
  }

  async getAnalysesByDatasetId(datasetId: string): Promise<DBAnalysis[]> {
    return Array.from(this.analyses.values())
      .filter((a) => a.datasetId === datasetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAnalysesByUserId(userId: string): Promise<DBAnalysis[]> {
    return Array.from(this.analyses.values())
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateAnalysis(id: string, updates: Partial<DBAnalysis>): Promise<DBAnalysis | null> {
    const analysis = this.analyses.get(id);
    if (!analysis) return null;
    const updated = { ...analysis, ...updates, updatedAt: new Date().toISOString() };
    this.analyses.set(id, updated);
    return updated;
  }

  // File storage operations (S3-style)
  async storeFile(path: string, content: string): Promise<void> {
    this.fileStorage.set(path, content);
  }

  async getFile(path: string): Promise<string | null> {
    return this.fileStorage.get(path) || null;
  }

  async deleteFile(path: string): Promise<boolean> {
    return this.fileStorage.delete(path);
  }

  // Chat operations
  async addChatMessage(message: DBChatMessage): Promise<DBChatMessage> {
    const messages = this.chatMessages.get(message.userId) || [];
    messages.push(message);
    this.chatMessages.set(message.userId, messages);
    return message;
  }

  async getChatHistory(userId: string, limit = 50): Promise<DBChatMessage[]> {
    const messages = this.chatMessages.get(userId) || [];
    return messages.slice(-limit);
  }

  async clearChatHistory(userId: string): Promise<void> {
    this.chatMessages.delete(userId);
  }

  // Stats
  async getUserStats(userId: string): Promise<{
    totalDatasets: number;
    totalAnalyses: number;
    completedAnalyses: number;
    totalInsights: number;
  }> {
    const datasets = await this.getDatasetsByUserId(userId);
    const analyses = await this.getAnalysesByUserId(userId);
    const completedAnalyses = analyses.filter((a) => a.status === "completed");
    const totalInsights = completedAnalyses.reduce(
      (sum, a) => sum + (a.results?.insights?.length || 0),
      0
    );

    return {
      totalDatasets: datasets.length,
      totalAnalyses: analyses.length,
      completedAnalyses: completedAnalyses.length,
      totalInsights,
    };
  }
}

// Singleton instance
export const db = new InMemoryDB();

// Helper to generate IDs
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
