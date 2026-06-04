import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Initialiser le client Google Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

export const runtime = 'nodejs'; // ou edge selon la base de données
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Récupérer le catalogue pour l'injecter dans le contexte
    const products = await db.product.findMany({
      where: { isActive: true },
      include: { collection: true, variants: true },
    });

    const productList = products.map(p => {
      const price = p.variants[0]?.price || 'N/A';
      return `- **${p.name}** (Collection: ${p.collection?.name || 'Aucune'}). Prix: ${price} FCFA. Description: ${(p.description || '').substring(0, 150).replace(/\n/g, ' ')}...`;
    }).join('\n');

    const systemPrompt = `Tu es l'assistant et conseiller virtuel de "HB Service", une boutique premium de parfums et soins naturels basée à Dakar, au Sénégal.
Ton rôle est d'accueillir les visiteurs, de les conseiller sur leurs choix de parfums et soins, et de les assister.

Voici le catalogue actuel de nos produits :
${productList}

Règles de comportement :
1. **Ton** : Sois extrêmement poli, courtois, élégant, chaleureux et professionnel. Utilise le vouvoiement. 
2. **Recommandations** : Base tes conseils UNIQUEMENT sur les produits de la liste fournie ci-dessus. Si un produit n'y est pas, c'est qu'il n'est pas disponible.
3. **Mise en page** : Utilise Markdown pour rendre tes messages faciles à lire (gras pour les noms de parfums, listes à puces).
4. **Informations utiles** :
   - Livraison : Dakar (24-48h), Régions du Sénégal (3-5 jours), International (tarifs selon destination).
   - Paiements acceptés : Wave, Orange Money, Carte Bancaire, Espèces à la livraison (Dakar uniquement).
   - Contact direct (WhatsApp) : +221 77 875 74 74.
5. **Concison** : Ne fais pas de réponses trop longues, le client est sur une petite fenêtre de chat. Sois concis et engageant. Limite-toi à 3 ou 4 phrases maximum par message, sauf si le client demande beaucoup d'informations d'un coup.

N'oublie pas d'insérer quelques emojis (✨, 🌿, 🧴) pour rendre le tout plus vivant, mais avec modération.`;

    // Utilisation du modèle Google Gemini
    const result = await streamText({
      model: google('models/gemini-2.5-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Erreur lors du traitement de la requête' }, { status: 500 });
  }
}
