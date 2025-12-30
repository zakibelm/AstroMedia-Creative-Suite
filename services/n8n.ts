
import { SocialPost, AgentTask, AgentStep } from '../types';
import { storage } from './storage';
import { validateAgentAction } from './gemini';

export const n8nService = {
  /**
   * Simulates triggering an n8n webhook for social media publishing
   */
  publishPost: async (postData: Omit<SocialPost, 'id' | 'status' | 'jobId'>): Promise<string> => {
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
  },

  /**
   * Simulates the AI Community Manager logic with a self-correction loop
   */
  runCommunityManagerTask: async (campaignId: string, onUpdate: (task: AgentTask) => void) => {
    const taskId = `task_${Math.random().toString(36).substr(2, 9)}`;
    const task: AgentTask = {
      id: taskId,
      agentId: 'a3', // Echo-ACM
      title: 'Replying to High-Value Comments',
      currentStep: 'execute',
      attempts: 1,
      maxAttempts: 3,
      logs: ['[EXECUTE] Scanning comments for Campaign_ID: ' + campaignId],
      status: 'running'
    };

    onUpdate({ ...task });

    const runStep = async (currentTask: AgentTask) => {
      // 1. OBSERVE
      currentTask.currentStep = 'observe';
      currentTask.logs.push('[OBSERVE] Detected negative sentiment in 2 comments. Drafting empathy-first responses.');
      onUpdate({ ...currentTask });
      await new Promise(r => setTimeout(r, 2000));

      // 2. VALIDATE
      currentTask.currentStep = 'validate';
      currentTask.logs.push('[VALIDATE] Routing drafts to Gemini Intelligence for compliance check...');
      onUpdate({ ...currentTask });

      try {
        const validation = await validateAgentAction(
          'Community Manager', 
          'Empathetic apology for delay and offering personal DM follow-up',
          'Post about product launch with shipping delays'
        );

        if (validation.compliant) {
          currentTask.currentStep = 'conform';
          currentTask.logs.push('[CONFORM] Validation successful. Brand alignment: 100%.');
          currentTask.logs.push('[EXECUTE] Responses published.');
          currentTask.status = 'completed';
          onUpdate({ ...currentTask });
        } else {
          currentTask.logs.push(`[RETRY] Validation FAILED: ${validation.reason}`);
          currentTask.logs.push(`[CORRECTION] Applying: ${validation.suggestedCorrection}`);
          
          if (currentTask.attempts < currentTask.maxAttempts) {
            currentTask.attempts++;
            currentTask.currentStep = 'retry';
            onUpdate({ ...currentTask });
            await new Promise(r => setTimeout(r, 1500));
            await runStep(currentTask);
          } else {
            currentTask.status = 'failed';
            currentTask.logs.push('[ERROR] Max attempts reached. Alerting human supervisor.');
            onUpdate({ ...currentTask });
          }
        }
      } catch (e) {
        currentTask.status = 'failed';
        currentTask.logs.push('[ERROR] Connectivity lost with Validation Node.');
        onUpdate({ ...currentTask });
      }
    };

    await runStep(task);
  }
};
