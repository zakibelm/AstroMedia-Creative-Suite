
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { storage } from '../services/storage';

export const OAuthCallback: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const platform = params.get('platform');
    const error = params.get('error');

    if (error) {
      console.error(`OAuth Error from provider: ${error}`);
      window.opener?.postMessage({ type: 'OAUTH_ERROR', error }, window.location.origin);
      setTimeout(() => window.close(), 2000);
      return;
    }

    if (code && platform) {
      const savedState = sessionStorage.getItem(`oauth_state_${platform}`);
      
      // State verification for security
      if (state !== savedState) {
        console.error("OAuth state mismatch. Potential CSRF attack.");
        window.opener?.postMessage({ type: 'OAUTH_ERROR', error: 'State mismatch' }, window.location.origin);
        window.close();
        return;
      }

      // In a real app, you would now send 'code' to your backend to exchange for an 'access_token'.
      // The backend uses the 'Client Secret' which is kept hidden from the browser.
      // Here, we simulate a successful exchange and storage.
      const simulatedToken = `tok_live_${Math.random().toString(36).substring(2)}`;
      
      storage.saveToken(platform, simulatedToken);
      storage.setAccountConnection(platform, true);
      
      // Signal success to the settings page
      window.opener?.postMessage({ type: 'OAUTH_SUCCESS', platform, token: simulatedToken }, window.location.origin);
      
      // Clean up
      sessionStorage.removeItem(`oauth_state_${platform}`);
      
      // Close the popup after a brief moment
      setTimeout(() => window.close(), 1000);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6" />
      <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Securing Connection</h2>
      <p className="text-slate-400 font-medium italic">Handshaking with platform service... Please do not close this window.</p>
    </div>
  );
};
