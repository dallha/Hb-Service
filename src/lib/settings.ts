import { db } from '@/lib/db';

export type SiteSettingsMap = Record<string, string>;

// Default values — used as fallbacks if not set in DB yet
export const DEFAULT_SETTINGS: SiteSettingsMap = {
  // Hero
  hero_title: "L'Art du Parfum,",
  hero_title_accent: "l'Essence du Naturel",
  hero_subtitle: "Découvrez des créations olfactives d'exception, nées du savoir-faire africain et de la pureté des ingrédients naturels.",
  hero_cta_primary: "Acheter maintenant",
  hero_cta_secondary: "Découvrir la collection",
  hero_image_url: "/images/hero/hero-main.png",

  // Brand
  logo_url: "/logo-gold.jpg",
  brand_tagline: "Parfums & Soins Naturels Premium. Des créations olfactives d'exception, nées du savoir-faire africain.",
  copyright_text: "HB_Service. Tous droits réservés.",

  // Contact
  whatsapp_number: "221778757474",
  whatsapp_message: "Bonjour ! J'aimerais avoir plus d'informations sur vos parfums.",
  phone_primary: "+221 77 875 74 74 (WhatsApp)",
  phone_backup: "+212 601 13 45 45",
  email: "contact@hb-service.com",
  address: "Dakar, Sénégal",

  // Social
  instagram_url: "#",
  facebook_url: "#",
  tiktok_url: "#",

  // Storytelling Section (homepage preview)
  story_1_title: "Notre Histoire",
  story_1_text: "Née de la passion d'un créateur africain, HB_Service puise son inspiration dans les paysages et les traditions du continent. Chaque fragrance raconte une histoire — celle des couchers de soleil sur le Sahel, des marchés d'épices de la Médina, des roses sauvages après la pluie.",
  story_1_image: "/images/brand/savoir-faire.png",
  story_2_title: "Notre Savoir-Faire",
  story_2_text: "Nos parfumeurs artisanaux combinent des siècles de tradition olfactive avec une expertise contemporaine. Chaque flacon est le fruit d'un travail minutieux, où les ingrédients les plus nobles sont sélectionnés avec soin pour créer des compositions d'une élégance intemporelle.",
  story_2_image: "/images/brand/savoir-faire.png",
  story_3_title: "Nos Engagements",
  story_3_text: "Nous croyons en une beauté responsable. Nos ingrédients sont sourcés éthiquement, nos formulations sont libres de parabènes et de sulfates, et nos packagings sont pensés pour minimiser notre impact environnemental. Le luxe peut être conscient.",
  story_3_image: "/images/brand/savoir-faire.png",
  story_4_title: "Nos Ingrédients",
  story_4_text: "De l'oud du Cambodge à la rose de Damas, chaque ingrédient est sélectionné pour sa pureté et son caractère unique. Nous travaillons directement avec des producteurs locaux pour garantir une traçabilité totale et une qualité irréprochable.",
  story_4_image: "/images/brand/savoir-faire.png",
  story_cta_label: "En savoir plus",

  // Storytelling Page hero
  storytelling_hero_title: "Notre Histoire,",
  storytelling_hero_title_accent: "Notre Passion",
  storytelling_hero_subtitle: "Depuis sa création, HB_Service incarne l'excellence du parfum et du soin naturel, puisant dans l'héritage africain pour créer des expériences sensorielles d'exception.",
  storytelling_values: "Qualité,Authenticité,Élégance,Confiance",

  // Reassurance
  reassurance_headline: "2 500+ Clients Satisfaits",
  reassurance_rating: "Note moyenne de 4.8/5 basée sur les avis clients",
  reassurance_1_label: "Livraison Rapide",
  reassurance_1_desc: "Sous 48h à Dakar",
  reassurance_2_label: "Paiement à la Livraison",
  reassurance_2_desc: "Zéro risque",
  reassurance_3_label: "Support WhatsApp",
  reassurance_3_desc: "Conseil personnalisé",

  // Collections section
  collections_section_title: "Nos Collections",
  collections_cta_label: "Explorer",

  // SEO
  seo_title: "HB_Service — Parfums & Soins Naturels Premium",
  seo_description: "Découvrez des créations olfactives d'exception, nées du savoir-faire africain et de la pureté des ingrédients naturels. Parfums premium et soins naturels.",

  // Marketing & Pixels
  facebook_pixel_id: "",
  tiktok_pixel_id: "",
  google_analytics_id: "",
};

// Fetch all settings from DB, merged with defaults
export async function getSettings(): Promise<SiteSettingsMap> {
  try {
    const rows = await db.siteSettings.findMany();
    const dbValues: SiteSettingsMap = {};
    rows.forEach((r) => { dbValues[r.key] = r.value; });
    return { ...DEFAULT_SETTINGS, ...dbValues };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
