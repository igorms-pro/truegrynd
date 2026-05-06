import { supabase } from '@/lib/supabase';

type Options = {
  userId: string;
  file: File;
};

const AVATAR_BUCKET = 'avatars';

function extFromMime(file: File): string {
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/webp') return 'webp';
  return 'bin';
}

export async function uploadAvatar({ userId, file }: Options): Promise<string> {
  const ext = extFromMime(file);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${userId}/${filename}`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    upsert: true,
    cacheControl: '3600',
    contentType: file.type,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error('public_url_missing');
  return data.publicUrl;
}
