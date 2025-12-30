
export const OAUTH_CONFIG = {
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    clientId: 'VOTRE_CLIENT_ID_TWITTER', // À remplacer par votre vrai ID
    scope: 'tweet.read tweet.write users.read offline.access',
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    clientId: 'VOTRE_CLIENT_ID_LINKEDIN',
    scope: 'r_liteprofile w_member_social',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
    clientId: 'VOTRE_CLIENT_ID_FACEBOOK',
    scope: 'pages_manage_posts publish_video',
  }
};

export const generateOAuthUrl = (platform: keyof typeof OAUTH_CONFIG) => {
  const config = OAUTH_CONFIG[platform];
  const redirectUri = `${window.location.origin}/oauth-callback`;
  const state = Math.random().toString(36).substring(7);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scope,
    state: state,
    // Spécifique à Twitter PKCE
    code_challenge: 'challenge', 
    code_challenge_method: 'plain'
  });

  return `${config.authUrl}?${params.toString()}`;
};
