/**
 * SoundEngine — HB_Service Luxury Audio Experience
 * 
 * Moteur sonore inspiré du Al-Mouyassar Islamic Quiz.
 * Gère les effets sonores premium pour l'expérience d'achat.
 * Utilise l'API Web Audio pour générer des sons synthétiques élégants.
 */

class SoundEngineClass {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hb-sound-enabled');
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    }
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('hb-sound-enabled', String(enabled));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  /**
   * Son élégant "ding" doré — Ajout au panier
   * Deux notes harmoniques ascendantes (luxe)
   */
  playAddToCart() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Note 1 : Mi5 (659.25 Hz) — doux
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(this.volume * 0.6, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Note 2 : La5 (880 Hz) — plus aigu, harmonique
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      gain2.gain.setValueAtTime(this.volume * 0.4, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.4);
    } catch {}
  }

  /**
   * Son de confirmation — Commande réussie
   * Arpège ascendant majestueux
   */
  playOrderSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // Do5, Mi5, Sol5, Do6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(this.volume * 0.5, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch {}
  }

  /**
   * Son d'erreur discret — Échec ou notification
   * Intervalle descendant doux
   */
  playError() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(349.23, now + 0.2); // La4 → Fa4
      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  /**
   * Son de notification — Promotion ou alerte
   * Trille léger
   */
  playNotification() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now + i * 0.1);
        gain.gain.setValueAtTime(this.volume * 0.3, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.08);
      }
    } catch {}
  }

  /**
   * Alias pour playOrderSuccess — utilisé par checkout-view
   */
  playSuccess() {
    this.playOrderSuccess();
  }

  /**
   * Son d'ouverture de panier
   * Glissando ascendant subtil
   */
  playCartOpen() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(this.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }
}

// Singleton
export const SoundEngine = new SoundEngineClass();
