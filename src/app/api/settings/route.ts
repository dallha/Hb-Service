import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';
import { DEFAULT_SETTINGS } from '@/lib/settings';

export async function GET() {
  try {
    const rows = await db.siteSettings.findMany();
    const dbValues: Record<string, string> = {};
    rows.forEach((r) => { dbValues[r.key] = r.value; });
    return NextResponse.json({ ...DEFAULT_SETTINGS, ...dbValues });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, string>;

    // Upsert each key
    const ops = Object.entries(body).map(([key, value]) =>
      db.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

    await Promise.all(ops);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
