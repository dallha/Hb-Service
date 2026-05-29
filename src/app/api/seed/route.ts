import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  // Protection: seed n'est autorisé qu'en développement
  // et uniquement si ALLOW_SEED=true est défini
  if (process.env.ALLOW_SEED !== 'true') {
    return NextResponse.json(
      { error: 'Seed endpoint désactivé. Définissez ALLOW_SEED=true pour l\'activer.' },
      { status: 403 }
    );
  }

  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Database seeded' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'initialisation de la base de données' },
      { status: 500 }
    );
  }
}
