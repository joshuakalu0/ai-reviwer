import { NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = "https://ai-reviwer.vercel.app/api/auth/github/callback";
// const REDIRECT_URI = process.env.NEXTAUTH_URL
//   ? `${process.env.NEXTAUTH_URL}/api/auth/github/callback`
//   : "https://ai-reviwer.vercel.app/api/auth/github/callback";

export async function GET() {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "repo user:email",
    state: Math.random().toString(36).substring(7),
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.json({ url: githubAuthUrl });
}
