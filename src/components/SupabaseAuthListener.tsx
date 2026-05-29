'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SupabaseAuthListener() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle password recovery or invite links (which append #access_token=... to the URL)
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        // If the URL has type=invite or type=recovery in the hash
        if (window.location.hash.includes('type=invite') || window.location.hash.includes('type=recovery')) {
          router.push('/update-password');
        }
      }
    });

    // Fallback: If the user lands directly with the hash and the event already fired
    if (typeof window !== 'undefined' && (window.location.hash.includes('type=invite') || window.location.hash.includes('type=recovery'))) {
      router.push('/update-password');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  return null;
}
