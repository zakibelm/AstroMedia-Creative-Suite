
import { SocialPost } from '../types';
import { storage } from './storage';

export const n8nService = {
  /**
   * Simulates triggering an n8n webhook for social media publishing
   */
  publishPost: async (postData: Omit<SocialPost, 'id' | 'status' | 'jobId'>): Promise<string> => {
    // In a real app, this would be: 
    // await fetch('https://n8n.your-instance.com/webhook/publish', { method: 'POST', body: JSON.stringify(postData) });
    
    console.log('Triggering n8n workflow for:', postData.platform);
    
    const jobId = `n8n_job_${Math.random().toString(36).substr(2, 9)}`;
    const newPost: SocialPost = {
      ...postData,
      id: crypto.randomUUID(),
      status: 'scheduled',
      jobId
    };
    
    storage.savePost(newPost);

    // Simulate n8n processing and callback
    setTimeout(() => {
      const success = Math.random() > 0.1;
      storage.updatePostStatus(newPost.id, success ? 'published' : 'failed');
      console.log(`n8n job ${jobId} completed with status: ${success ? 'published' : 'failed'}`);
    }, 5000);

    return jobId;
  }
};
