import { Resend } from 'resend';
import React from 'react';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Remplacez cette adresse par l'adresse vérifiée sur votre compte Resend
// ex: contact@hb-service.com
const DEFAULT_FROM = 'HB_Service <onboarding@resend.dev>';

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY non définie. L\'e-mail n\'a pas été envoyé en vrai.');
    console.warn(`📩 Simulation d'envoi à : ${to} | Sujet : ${subject}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
