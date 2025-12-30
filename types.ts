
export type MediaType = 'image' | 'video';

export interface MediaAsset {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  prompt: string;
  createdAt: string; // ISO String for storage
  metadata: Record<string, any>;
  campaignId?: string; // Optional link to a campaign
}

export interface CampaignReport {
  sentimentScore: number;
  engagementQuality: 'high' | 'medium' | 'low';
  lessonsLearned: string[];
  selfCorrectionPlan: string;
  generatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'completed' | 'scheduled';
  platform: string;
  performance: {
    reach: number;
    engagement: number;
    conversion: number;
  };
  lastUpdated: string;
  scheduledAt?: string;
  aiReport?: CampaignReport;
}

export interface SocialPost {
  id: string;
  mediaId: string;
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
  caption: string;
  status: 'scheduled' | 'published' | 'failed';
  scheduledFor?: string;
  publishedAt?: string;
  jobId: string; // n8n tracking ID
}

export type AgentStep = 'execute' | 'observe' | 'validate' | 'conform' | 'retry';

export interface AgentTask {
  id: string;
  agentId: string;
  title: string;
  currentStep: AgentStep;
  attempts: number;
  maxAttempts: number;
  logs: string[];
  status: 'running' | 'completed' | 'failed';
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'processing' | 'learning';
  specialization: string;
  efficiency: number;
  lastAction: string;
  avatar: string;
}

export interface GenerationStatus {
  status: 'idle' | 'generating' | 'completed' | 'failed';
  progress: number;
  error?: string;
  resultUrl?: string;
}
