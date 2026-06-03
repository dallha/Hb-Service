'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, Star, MessageCircle, Mail, MapPin, ChevronDown } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import type { SiteSettingsMap } from '@/lib/settings';
import { toast } from 'sonner';

export default function FormationsView({ settings = {} }: { settings?: SiteSettingsMap }) {
  const { navigate } = useNavigationStore();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    whatsapp: '',
    email: '',
    formation: '',
    message: ''
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const whatsappNumber = settings.whatsapp_number || '221778757474';

  const scrollToForm = (formationName?: string) => {
    if (formationName) {
      setFormData(prev => ({ ...prev, formation: formationName }));
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.country || !formData.city || !formData.whatsapp || !formData.email || !formData.formation) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const text = `Bonjour HB_SERVICE, je souhaite m'inscrire à une formation.%0A%0A*Informations :*%0A- Nom: ${formData.name}%0A- Pays: ${formData.country}%0A- Ville: ${formData.city}%0A- WhatsApp: ${formData.whatsapp}%0A- E-mail: ${formData.email}%0A- Formation: *${formData.formation}*%0A%0A*Message :* ${formData.message || 'Aucun message'}`;
    
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-black">
          <img
            src="/images/formations-hero.jpg"
            alt="Formations Professionnelles HB_SERVICE"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#D4AF37] mb-4">
              Académie HB_SERVICE
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6 break-words">
              Formations <br className="hidden sm:block"/>
              <span className="text-[#D4AF37]">Professionnelles</span>
            </h1>
            <p className="font-sans text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transformez votre passion en métier avec les formations professionnelles HB_SERVICE.
            </p>
            <Button
              onClick={() => scrollToForm()}
              className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#1A1A1A] font-sans text-xs tracking-widest uppercase px-8 py-4 h-auto rounded-none border-none"
            >
              Voir les programmes
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Programmes Section */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">Nos Programmes</h2>
          <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Parfumerie */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-border p-6 sm:p-10 flex flex-col h-full hover:border-[#D4AF37]/50 transition-colors bg-card"
          >
            <div className="mb-8">
              <h3 className="font-serif text-2xl sm:text-3xl text-[#D4AF37] mb-2">Formation Parfumerie</h3>
              <p className="text-muted-foreground text-sm mb-4">Apprenez à créer des parfums professionnels pour homme, femme et enfant.</p>
              <p className="font-sans text-xl text-foreground font-medium">175 000 FCFA <span className="text-muted-foreground text-sm font-normal">ou 2 900 MAD</span></p>
            </div>

            <div className="flex-1 mb-8">
              <h4 className="font-sans text-xs tracking-widest uppercase text-foreground mb-4">Programme</h4>
              <ul className="space-y-3">
                {[
                  "Introduction à la parfumerie",
                  "Matières premières et fragrances",
                  "Familles olfactives",
                  "Formulation des parfums",
                  "Dosages et calculs",
                  "Fixateurs et tenue du parfum",
                  "Macération et filtration",
                  "Conditionnement professionnel",
                  "Commercialisation et création de marque"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => scrollToForm('Formation Parfumerie')}
              className="w-full bg-foreground text-background hover:bg-[#D4AF37] hover:text-[#1A1A1A] font-sans text-xs tracking-widest uppercase py-6 rounded-none transition-colors"
            >
              S'inscrire à la Formation Parfumerie
            </Button>
          </motion.div>

          {/* Cosmétique */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.2 }}
            className="border border-border p-6 sm:p-10 flex flex-col h-full hover:border-[#D4AF37]/50 transition-colors bg-card"
          >
            <div className="mb-8">
              <h3 className="font-serif text-2xl sm:text-3xl text-[#D4AF37] mb-2">Formation Cosmétique Naturelle</h3>
              <p className="text-muted-foreground text-sm mb-4">Apprenez à fabriquer vos propres produits cosmétiques naturels.</p>
              <p className="font-sans text-xl text-foreground font-medium">175 000 FCFA <span className="text-muted-foreground text-sm font-normal">ou 2 900 MAD</span></p>
            </div>

            <div className="flex-1 mb-8">
              <h4 className="font-sans text-xs tracking-widest uppercase text-foreground mb-4">Programme</h4>
              <ul className="space-y-3">
                {[
                  "Crèmes corporelles",
                  "Savons artisanaux",
                  "Shampoings",
                  "Soins capillaires",
                  "Sérums et huiles",
                  "Déodorants naturels",
                  "Gels douche",
                  "Conservation des produits",
                  "Packaging et étiquetage",
                  "Commercialisation des produits"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => scrollToForm('Formation Cosmétique Naturelle')}
              className="w-full bg-foreground text-background hover:bg-[#D4AF37] hover:text-[#1A1A1A] font-sans text-xs tracking-widest uppercase py-6 rounded-none transition-colors"
            >
              S'inscrire à la Formation Cosmétique
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Formulaire d'inscription */}
      <section ref={formRef} className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">Formulaire d'inscription</h2>
            <p className="text-muted-foreground text-sm">Remplissez ce formulaire pour nous envoyer votre demande. Vous serez redirigé vers WhatsApp pour finaliser.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 sm:p-10 border border-border shadow-sm">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">Nom et prénom *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">Numéro WhatsApp *</label>
                <input required type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="+221..." />
              </div>
              <div className="space-y-2">
                <label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">Pays *</label>
                <input required type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">Ville *</label>
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">Adresse e-mail *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">Formation choisie *</label>
                <select required name="formation" value={formData.formation} onChange={handleInputChange} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none text-foreground">
                  <option value="" disabled>Sélectionnez une option</option>
                  <option value="Formation Parfumerie">Formation Parfumerie</option>
                  <option value="Formation Cosmétique Naturelle">Formation Cosmétique Naturelle</option>
                  <option value="Les deux formations">Les deux formations</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">Message (facultatif)</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} rows={3} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none" />
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#1A1A1A] font-sans text-xs tracking-widest uppercase py-4 rounded-none mt-8 border-none flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              S'inscrire via WhatsApp
            </Button>
          </form>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">Ils ont transformé leur passion</h2>
          <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Fatou Diop", role: "Créatrice de marque", text: "Cette formation a changé ma vie. J'ai pu lancer ma propre ligne de parfums d'intérieur grâce aux conseils experts." },
            { name: "Awa Ndiaye", role: "Entrepreneuse", text: "Le module sur la cosmétique naturelle est incroyablement complet. Les formulations sont précises et professionnelles." },
            { name: "Mariama Ba", role: "Artisane Parfumeur", text: "Un accompagnement en or. J'ai appris des techniques de macération que je ne trouvais nulle part ailleurs." }
          ].map((testimonial, i) => (
            <div key={i} className="border border-border p-6 bg-card text-center flex flex-col items-center">
              <div className="flex gap-1 mb-4 text-[#D4AF37]">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-muted-foreground text-sm italic mb-6">"{testimonial.text}"</p>
              <div className="mt-auto">
                <p className="font-serif text-lg text-foreground">{testimonial.name}</p>
                <p className="font-sans text-[10px] tracking-widest uppercase text-[#D4AF37]">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 max-w-3xl mx-auto border-t border-border">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">Questions Fréquentes</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: "La formation est-elle en présentiel ou en ligne ?", a: "Nos formations sont proposées selon différentes modalités adaptées à vos besoins. Veuillez nous contacter sur WhatsApp pour connaître les prochaines sessions." },
            { q: "Faut-il des prérequis pour s'inscrire ?", a: "Aucun prérequis technique n'est nécessaire. Les formations reprennent les bases jusqu'aux techniques avancées." },
            { q: "Le matériel est-il fourni ?", a: "Oui, tous les ingrédients, matières premières et contenants nécessaires pour la pratique sont inclus dans le tarif de la formation." },
            { q: "Délivrez-vous une attestation ?", a: "Une attestation de fin de formation professionnelle est délivrée à l'issue du programme, validant vos acquis." }
          ].map((faq, i) => (
            <div key={i} className="border border-border bg-card">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left font-serif text-lg text-foreground hover:text-[#D4AF37] transition-colors"
              >
                {faq.q}
                <ChevronDown className={`w-5 h-5 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-4 pt-0 text-sm text-muted-foreground">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
      
      {/* Contact Simple */}
      <section className="py-16 bg-[#1A1A1A] text-white text-center px-4">
        <h2 className="font-serif text-2xl sm:text-3xl mb-4 text-[#D4AF37]">Besoin d'informations supplémentaires ?</h2>
        <p className="text-white/70 text-sm max-w-xl mx-auto mb-8">Notre équipe pédagogique est à votre disposition pour vous guider vers la formation la plus adaptée à votre projet.</p>
        <a 
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] px-6 py-3 font-sans text-xs tracking-widest uppercase transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Contacter le secrétariat
        </a>
      </section>
    </div>
  );
}
