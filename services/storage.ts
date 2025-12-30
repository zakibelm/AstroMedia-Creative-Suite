
import { MediaAsset, SocialPost, Campaign } from '../types';

const ASSETS_KEY = 'astromedia_assets';
const POSTS_KEY = 'astromedia_posts';
const CAMPAIGNS_KEY = 'astromedia_campaigns';
const ACCOUNTS_KEY = 'astromedia_accounts';
const TOKENS_KEY = 'astromedia_tokens';

export const storage = {
  getAssets: (): MediaAsset[] => {
    const data = localStorage.getItem(ASSETS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveAsset: (asset: MediaAsset) => {
    const assets = storage.getAssets();
    localStorage.setItem(ASSETS_KEY, JSON.stringify([asset, ...assets]));
  },
  
  deleteAsset: (id: string) => {
    const assets = storage.getAssets();
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets.filter(a => a.id !== id)));
  },
  
  getPosts: (): SocialPost[] => {
    const data = localStorage.getItem(POSTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  savePost: (post: SocialPost) => {
    const posts = storage.getPosts();
    localStorage.setItem(POSTS_KEY, JSON.stringify([post, ...posts]));
  },
  
  updatePostStatus: (id: string, status: SocialPost['status']) => {
    const posts = storage.getPosts();
    const updated = posts.map(p => p.id === id ? { ...p, status, publishedAt: status === 'published' ? new Date().toISOString() : p.publishedAt } : p);
    localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
  },

  getCampaigns: (): Campaign[] => {
    const data = localStorage.getItem(CAMPAIGNS_KEY);
    const defaultCampaigns: Campaign[] = [
      { id: 'c1', name: 'Q4 Brand Awareness', status: 'active', platform: 'Multi', lastUpdated: new Date().toISOString(), performance: { reach: 12000, engagement: 450, conversion: 22 } },
      { id: 'c2', name: 'Product Launch 2025', status: 'draft', platform: 'Twitter', lastUpdated: new Date().toISOString(), performance: { reach: 0, engagement: 0, conversion: 0 } }
    ];
    return data ? JSON.parse(data) : defaultCampaigns;
  },

  saveCampaign: (campaign: Campaign) => {
    const campaigns = storage.getCampaigns();
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify([campaign, ...campaigns]));
  },

  updateCampaigns: (campaigns: Campaign[]) => {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  },

  getConnectedAccounts: (): Record<string, boolean> => {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : {
      twitter: false,
      linkedin: false,
      instagram: false,
      facebook: false
    };
  },

  setAccountConnection: (platform: string, status: boolean) => {
    const accounts = storage.getConnectedAccounts();
    accounts[platform] = status;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  },

  saveToken: (platform: string, token: string) => {
    const tokens = storage.getTokens();
    tokens[platform] = token;
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  },

  getTokens: (): Record<string, string> => {
    const data = localStorage.getItem(TOKENS_KEY);
    return data ? JSON.parse(data) : {};
  },

  clearToken: (platform: string) => {
    const tokens = storage.getTokens();
    delete tokens[platform];
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }
};
