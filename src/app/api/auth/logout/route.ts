import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Create response and redirect to homepage
  const url = new URL(request.url);
  const localeMatch = url.pathname.match(/^\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : 'fr';
  
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url), {
    status: 302,
  });
}
