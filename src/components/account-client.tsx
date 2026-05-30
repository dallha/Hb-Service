'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Package, User as UserIcon, MapPin, ChevronRight, Plus, Trash2, Shield } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

type AccountTab = 'orders' | 'addresses' | 'profile' | 'security';

export default function AccountClient({ user, initialOrders, initialAddresses }: any) {
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const [addresses, setAddresses] = useState(initialAddresses || []);
  const [orders] = useState(initialOrders || []);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    phone: '',
  });

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // MFA State
  const [mfaStatus, setMfaStatus] = useState<'loading' | 'enabled' | 'disabled'>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [mfaVerifyCode, setMfaVerifyCode] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (activeTab === 'security') {
      const checkMfa = async () => {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (!error && (data?.currentLevel === 'aal2' || data?.nextLevel === 'aal2')) {
          setMfaStatus('enabled');
        } else {
          setMfaStatus('disabled');
        }
      };
      checkMfa();
    }
  }, [activeTab]);

  const handleEnableMfa = async () => {
    // Check if there's already an unverified factor and delete it first
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (factors && factors.totp) {
      for (const factor of factors.totp) {
        if (factor.status === 'unverified') {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) { toast.error(error.message); return; }
    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) { toast.error(challengeError.message); return; }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: mfaVerifyCode
    });
    if (error) { 
      toast.error("Code incorrect. Veuillez réessayer."); 
    } else { 
      toast.success("Authentification à deux facteurs activée avec succès !"); 
      setMfaStatus('enabled'); 
      setQrCode(null);
      setMfaVerifyCode('');
      setFactorId(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error();
      toast.success('Profil mis à jour');
      setIsEditingProfile(false);
      // Update local state (assuming user is passed as prop, we just force a refresh to update the parent server component)
      window.location.reload();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm("Voulez-vous vraiment désactiver la double authentification ? Votre compte sera moins sécurisé.")) return;
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (factors && factors.totp) {
      for (const factor of factors.totp) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      setMfaStatus('disabled');
      toast.success("Double authentification désactivée.");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });
      if (!res.ok) throw new Error();
      const newAddress = await res.json();
      setAddresses([newAddress, ...addresses]);
      setIsAddingAddress(false);
      setAddressForm({ firstName: '', lastName: '', street: '', city: '', phone: '' });
      toast.success('Adresse ajoutée avec succès');
    } catch {
      toast.error('Erreur lors de l\'ajout de l\'adresse');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette adresse ?')) return;
    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setAddresses(addresses.filter((a: any) => a.id !== id));
      toast.success('Adresse supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E8E0D5] pb-6 gap-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A] mb-3">
              Mon Espace Privé
            </h1>
            <p className="font-sans text-sm tracking-wider uppercase text-[#8C8C8C]">
              Bienvenue, {user.fullName || user.email}
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="group inline-flex items-center text-xs font-sans tracking-widest uppercase transition-colors text-[#8C8C8C] hover:text-[#C44536]"
            >
              <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Se déconnecter
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Sidebar Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#E8E0D5] sticky top-28 flex flex-col">
              <button
                onClick={() => setActiveTab('orders')}
                className={`p-5 flex items-center gap-3 text-left transition-colors border-b border-[#E8E0D5] ${activeTab === 'orders' ? 'bg-[#FDFCFB] text-[#D4AF37]' : 'hover:bg-[#F8F7F5] text-[#1A1A1A]'}`}
              >
                <Package className="h-5 w-5" />
                <span className="font-serif text-lg">Mes Commandes</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`p-5 flex items-center gap-3 text-left transition-colors border-b border-[#E8E0D5] ${activeTab === 'addresses' ? 'bg-[#FDFCFB] text-[#D4AF37]' : 'hover:bg-[#F8F7F5] text-[#1A1A1A]'}`}
              >
                <MapPin className="h-5 w-5" />
                <span className="font-serif text-lg">Mes Adresses</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`p-5 flex items-center gap-3 text-left transition-colors border-b border-[#E8E0D5] ${activeTab === 'profile' ? 'bg-[#FDFCFB] text-[#D4AF37]' : 'hover:bg-[#F8F7F5] text-[#1A1A1A]'}`}
              >
                <UserIcon className="h-5 w-5" />
                <span className="font-serif text-lg">Mon Profil</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`p-5 flex items-center gap-3 text-left transition-colors ${activeTab === 'security' ? 'bg-[#FDFCFB] text-[#D4AF37]' : 'hover:bg-[#F8F7F5] text-[#1A1A1A]'}`}
              >
                <Shield className="h-5 w-5" />
                <span className="font-serif text-lg">Sécurité (MFA)</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-[#E8E0D5] overflow-hidden"
                >
                  <div className="p-6 sm:p-8 border-b border-[#E8E0D5] flex items-center bg-[#FDFCFB]">
                    <h3 className="font-serif text-xl text-[#1A1A1A]">Historique de Commandes</h3>
                  </div>
                  
                  {orders.length > 0 ? (
                    <div className="divide-y divide-[#E8E0D5]">
                      {orders.map((order: any) => (
                        <div key={order.id} className="p-6 sm:p-8 hover:bg-[#FDFCFB] transition-colors group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                              <p className="font-sans text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">
                                Commande #{order.id.slice(-8).toUpperCase()}
                              </p>
                              <p className="font-serif text-lg text-[#1A1A1A]">
                                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="font-sans text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">
                                Montant Total
                              </p>
                              <p className="font-serif text-xl text-[#D4AF37]">
                                {formatPrice(order.totalAmount)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-6 flex items-center gap-3">
                            <span className="font-sans text-[10px] tracking-widest uppercase text-[#8C8C8C]">Statut :</span>
                            <span className={`px-3 py-1 font-sans text-[10px] tracking-widest uppercase border ${
                              order.status === 'delivered' ? 'border-[#4A7C59] text-[#4A7C59] bg-[#4A7C59]/5' :
                              order.status === 'pending' ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5' :
                              'border-[#1A1A1A] text-[#1A1A1A] bg-[#1A1A1A]/5'
                            }`}>
                              {order.status === 'pending' ? 'En attente' :
                               order.status === 'processing' ? 'En préparation' :
                               order.status === 'shipped' ? 'Expédiée' :
                               order.status === 'delivered' ? 'Livrée' :
                               order.status === 'cancelled' ? 'Annulée' : order.status}
                            </span>
                          </div>

                          <div className="border-t border-dashed border-[#E8E0D5] pt-6">
                            <p className="font-sans text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-4">Articles</p>
                            <ul className="space-y-4">
                              {order.items.map((item: any) => (
                                <li key={item.id} className="flex items-center gap-4">
                                  <div className="h-16 w-16 bg-[#F5F0E8] border border-[#E8E0D5] shrink-0 overflow-hidden relative">
                                    {item.variant.product.imageUrl && (
                                      <img 
                                        src={item.variant.product.imageUrl} 
                                        alt={item.variant.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-serif text-[#1A1A1A] truncate">{item.variant.product.name}</p>
                                    <p className="font-sans text-[11px] text-[#8C8C8C] mt-1 uppercase tracking-wider">
                                      {item.variant.size} × {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-sans text-sm text-[#1A1A1A]">{formatPrice(item.unitPrice * item.quantity)}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <Package className="h-12 w-12 text-[#E8E0D5] mx-auto mb-4" />
                      <p className="font-serif text-xl text-[#1A1A1A] mb-2">Aucune commande</p>
                      <p className="font-sans text-sm text-[#8C8C8C]">
                        Vous n'avez pas encore passé de commande chez nous.
                      </p>
                      <a href="/shop" className="inline-flex items-center mt-8 text-xs font-sans tracking-widest uppercase text-[#D4AF37] hover:text-[#B8962E] transition-colors group">
                        Découvrir nos créations
                        <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-[#E8E0D5] overflow-hidden"
                >
                  <div className="p-6 sm:p-8 border-b border-[#E8E0D5] flex items-center justify-between bg-[#FDFCFB]">
                    <h3 className="font-serif text-xl text-[#1A1A1A]">Carnet d'Adresses</h3>
                    <Button onClick={() => setIsAddingAddress(!isAddingAddress)} className="bg-[#1A1A1A] hover:bg-[#333] text-white rounded-none h-9 px-4 text-xs tracking-widest uppercase">
                      {isAddingAddress ? 'Annuler' : <><Plus className="w-4 h-4 mr-1" /> Ajouter</>}
                    </Button>
                  </div>

                  {isAddingAddress && (
                    <div className="p-6 sm:p-8 border-b border-[#E8E0D5] bg-[#F8F7F5]">
                      <form onSubmit={handleAddAddress} className="space-y-4 max-w-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="Prénom" required value={addressForm.firstName} onChange={e => setAddressForm({...addressForm, firstName: e.target.value})} className="rounded-none border-[#E8E0D5]" />
                          <Input placeholder="Nom" required value={addressForm.lastName} onChange={e => setAddressForm({...addressForm, lastName: e.target.value})} className="rounded-none border-[#E8E0D5]" />
                        </div>
                        <Input placeholder="Numéro de téléphone" required value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="rounded-none border-[#E8E0D5]" />
                        <Input placeholder="Adresse (ex: Point E, Rue de l'Est...)" required value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="rounded-none border-[#E8E0D5]" />
                        <Input placeholder="Ville" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="rounded-none border-[#E8E0D5]" />
                        <Button type="submit" className="bg-[#4A7C59] hover:bg-[#3d6649] text-white rounded-none w-full text-xs tracking-widest uppercase">
                          Sauvegarder l'adresse
                        </Button>
                      </form>
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    {addresses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {addresses.map((addr: any) => (
                          <div key={addr.id} className="border border-[#E8E0D5] p-6 relative group hover:border-[#D4AF37] transition-colors">
                            <h4 className="font-serif text-lg text-[#1A1A1A] mb-2">{addr.firstName} {addr.lastName}</h4>
                            <p className="font-sans text-sm text-[#8C8C8C] mb-1">{addr.phone}</p>
                            <p className="font-sans text-sm text-[#8C8C8C]">{addr.street}, {addr.city}</p>
                            
                            <button onClick={() => handleDeleteAddress(addr.id)} className="absolute top-4 right-4 text-[#8C8C8C] hover:text-[#C44536] transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="h-12 w-12 text-[#E8E0D5] mx-auto mb-4" />
                        <p className="font-sans text-sm text-[#8C8C8C]">Aucune adresse enregistrée pour le moment.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-[#E8E0D5] overflow-hidden"
                >
                  <div className="p-6 sm:p-8 border-b border-[#E8E0D5] bg-[#FDFCFB]">
                    <h3 className="font-serif text-xl text-[#1A1A1A]">Informations Personnelles</h3>
                  </div>
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">E-mail</p>
                      <p className="text-[#1A1A1A] font-medium">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">Nom Complet</p>
                      <p className="text-[#1A1A1A] font-medium">{user.fullName || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">Téléphone</p>
                      <p className="text-[#1A1A1A] font-medium">{user.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-[#E8E0D5] overflow-hidden"
                >
                  <div className="p-6 sm:p-8 border-b border-[#E8E0D5] bg-[#FDFCFB]">
                    <h3 className="font-serif text-xl text-[#1A1A1A]">Sécurité & Double Authentification</h3>
                  </div>
                  <div className="p-6 sm:p-8 space-y-6">
                    {mfaStatus === 'loading' ? (
                      <p className="text-gray-500">Chargement des paramètres de sécurité...</p>
                    ) : mfaStatus === 'enabled' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-md border border-green-200">
                          <Shield className="w-5 h-5" />
                          <p className="font-medium">La double authentification (MFA) est activée pour votre compte.</p>
                        </div>
                        <p className="text-sm text-gray-600">Votre compte est hautement sécurisé. Lors de chaque connexion, un code de votre application d'authentification vous sera demandé.</p>
                        <Button 
                          variant="destructive" 
                          onClick={handleDisableMfa}
                          className="mt-4"
                        >
                          Désactiver la double authentification
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {!qrCode ? (
                          <div className="space-y-4">
                            <p className="text-[#1A1A1A]">La double authentification (MFA) ajoute une couche de sécurité supplémentaire à votre compte en demandant un code en plus de votre mot de passe.</p>
                            <Button 
                              onClick={handleEnableMfa}
                              className="bg-[#1A1A1A] hover:bg-[#333] text-white rounded-none h-10 px-6 text-xs tracking-widest uppercase"
                            >
                              Activer la double authentification
                            </Button>
                          </div>
                        ) : (
                          <form onSubmit={handleVerifyMfa} className="space-y-6 max-w-md border border-[#E8E0D5] p-6 bg-[#F8F7F5]">
                            <h4 className="font-serif text-lg text-[#1A1A1A]">Configuration MFA</h4>
                            <div className="space-y-4">
                              <p className="text-sm text-gray-600">
                                1. Scannez ce QR Code avec une application d'authentification comme Google Authenticator, Authy ou Microsoft Authenticator.
                              </p>
                              <div className="bg-white p-4 w-fit mx-auto border border-gray-200 [&>svg]:w-48 [&>svg]:h-48" dangerouslySetInnerHTML={{ __html: qrCode }} />
                              <p className="text-sm text-gray-600">
                                2. Entrez le code à 6 chiffres généré par l'application pour valider l'activation.
                              </p>
                              <div>
                                <Input
                                  placeholder="Code à 6 chiffres"
                                  required
                                  value={mfaVerifyCode}
                                  onChange={(e) => setMfaVerifyCode(e.target.value)}
                                  className="rounded-none border-[#E8E0D5] text-center text-xl tracking-widest"
                                  maxLength={6}
                                />
                              </div>
                              <Button type="submit" className="w-full bg-[#4A7C59] hover:bg-[#3d6649] text-white rounded-none text-xs tracking-widest uppercase mt-4">
                                Valider et Activer
                              </Button>
                              <button 
                                type="button" 
                                onClick={() => setQrCode(null)} 
                                className="w-full text-center text-xs text-gray-500 mt-2 hover:text-gray-700"
                              >
                                Annuler
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
