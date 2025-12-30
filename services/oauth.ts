
export const OAUTH_CONFIG = {
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    clientId: 'VOTRE_CLIENT_ID_TWITTER', 
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
  // We include the platform in the redirect URI as a query param so the callback handler knows the context.
  // In a production environment, this URI must be pre-registered exactly in the provider's developer console.
  const redirectUri = `${window.location.origin}/oauth-callback?platform=${platform}`;
  const state = Math.random().toString(36).substring(7);
  
  // Store state in session storage to verify upon return (prevent CSRF)
  sessionStorage.setItem(`oauth_state_${platform}`, state);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scope,
    state: state,
    // Note: Twitter v2 requires PKCE. For this frontend-only demo, we use a simple challenge.
    code_challenge: 'challenge', 
    code_challenge_method: 'plain'
  });

  return `${config.authUrl}?${params.toString()}`;
};
