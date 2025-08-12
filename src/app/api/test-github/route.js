import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  return NextResponse.json({
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasNextAuthUrl: !!nextAuthUrl,
    clientIdLength: clientId?.length || 0,
    nextAuthUrl: nextAuthUrl || 'not set'
  });
}