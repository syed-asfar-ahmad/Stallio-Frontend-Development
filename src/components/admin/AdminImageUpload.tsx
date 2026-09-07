import { useRef, useState } from 'react';
import DashboardImageRemoveButton from '../DashboardImageRemoveButton';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';
import { getStoredToken } from '../../context/AuthContext';
import { AdminLoadingInline } from './AdminLoading';
import { adminTheme } from './adminTheme';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type Props = {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  uploadType?: 'product' | 'logo';
  hint?: string;
  required?: boolean;
  previewContain?: boolean;
};

export default function AdminImageUpload({
  label,
  value,
  onChange,
  uploadType = 'product',
  hint,
  required,
  previewContain,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    const token = getStoredToken();
    if (!token) {
      toast.error('Not signed in');
      return;
    }
    setUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('type', uploadType);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-stone-800 dark:text-zinc-200">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {hint ? <p className={`mb-2 text-xs ${adminTheme.muted}`}>{hint}</p> : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <div className="relative shrink-0">
            <img
              src={value}
              alt=""
              className={`h-16 w-16 rounded-xl border-2 border-stone-200 dark:border-zinc-700 ${
                previewContain ? 'object-contain bg-stone-100 p-1 dark:bg-zinc-800' : 'object-cover bg-stone-100 dark:bg-zinc-800'
              }`}
            />
            <DashboardImageRemoveButton
              onClick={() => onChange(null)}
              aria-label="Remove Image"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-stone-200 text-stone-400 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40 dark:hover:text-brand-400"
          >
            {uploading ? <AdminLoadingInline dotsOnly /> : <Upload className="h-5 w-5" />}
          </button>
        )}
        {value ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`inline-flex items-center gap-2 ${adminTheme.btnSecondary}`}
          >
            {uploading ? <AdminLoadingInline dotsOnly /> : <Upload className="h-4 w-4" />}
            Change Image
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`inline-flex items-center gap-2 ${adminTheme.btnSecondary}`}
          >
            {uploading ? <AdminLoadingInline /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        )}
      </div>
    </div>
  );
}
