'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  value?: string | null;
  className?: string;
  bucket?: string;
}

export function ImageUpload({ onUpload, value, className = "", bucket = "medias" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const supabase = createClient();
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (err: any) {
      setError(err.message || "Erreur lors du téléchargement");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-20 h-20 border border-[#E8E0D5] bg-[#F5F0E8] overflow-hidden rounded-sm group shrink-0">
            <img src={value} alt="Aperçu" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <button
              type="button"
              onClick={() => onUpload("")}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 border border-dashed border-[#E8E0D5] bg-[#F8F7F5] flex flex-col items-center justify-center rounded-sm shrink-0">
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-[#8C8C8C] animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-[#8C8C8C]" />
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="w-full bg-white border-[#E8E0D5] rounded-none font-sans text-xs uppercase tracking-wider"
            >
              {isUploading ? 'Chargement...' : (value ? 'Changer l\'image' : 'Sélectionner une image')}
            </Button>
          </div>
          {error && <p className="text-xs text-[#C44536] mt-1.5">{error}</p>}
        </div>
      </div>
    </div>
  );
}
