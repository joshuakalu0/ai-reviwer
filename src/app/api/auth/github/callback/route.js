import { NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log('OAuth callback received:', { code: !!code, error });

  if (error) {
    console.error('OAuth error from GitHub:', error);
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.error('Missing GitHub OAuth credentials');
    return NextResponse.redirect(new URL('/?error=missing_credentials', request.url));
  }

  try {
    console.log('Exchanging code for token...');
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenResponse.status, tokenResponse.statusText);
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    console.log('Token response:', { hasToken: !!tokenData.access_token, error: tokenData.error });

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData.error, tokenData.error_description);
      return NextResponse.redirect(new URL(`/?error=${tokenData.error}`, request.url));
    }

    if (!tokenData.access_token) {
      console.error('No access token in response');
      return NextResponse.redirect(new URL('/?error=no_access_token', request.url));
    }

    const accessToken = tokenData.access_token;

    // Redirect to home page with token in URL (will be handled by client-side)
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('token', accessToken);
    
    console.log('Redirecting with token');
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}