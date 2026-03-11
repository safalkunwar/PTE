export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

let didWarnMissingOAuthEnv = false;

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  if (!oauthPortalUrl || !appId) {
    if (!didWarnMissingOAuthEnv) {
      didWarnMissingOAuthEnv = true;
      console.error(
        "[Auth] OAuth is not configured. Set VITE_OAUTH_PORTAL_URL (include http/https) and VITE_APP_ID in your .env file."
      );
    }
    return "/";
  }

  try {
    const url = new URL("/app-auth", oauthPortalUrl);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch (err) {
    if (!didWarnMissingOAuthEnv) {
      didWarnMissingOAuthEnv = true;
      console.error(
        "[Auth] Invalid VITE_OAUTH_PORTAL_URL. It must be an absolute URL like https://auth.example.com",
        err
      );
    }
    return "/";
  }
};
