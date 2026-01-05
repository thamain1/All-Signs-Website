import { supabase } from './supabase';

export const STORAGE_BUCKET = 'media-library';
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface MediaAsset {
  id: string;
  created_at: string;
  created_by: string | null;
  title: string;
  alt_text: string;
  tags: string[];
  mime_type: string;
  byte_size: number;
  storage_path: string;
  url: string;
  status: 'active' | 'archived';
}

export interface UploadMediaParams {
  file: File;
  title: string;
  alt_text?: string;
  tags?: string[];
}

export async function ensureStorageBucket(): Promise<boolean> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();

    const bucketExists = buckets?.some(b => b.name === STORAGE_BUCKET);

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      });

      if (error) {
        console.error('Error creating storage bucket:', error);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Exception checking/creating storage bucket:', err);
    return false;
  }
}

export async function uploadMedia({ file, title, alt_text = '', tags = [] }: UploadMediaParams): Promise<MediaAsset | null> {
  try {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    await ensureStorageBucket();

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${timestamp}_${sanitizedName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const { data: user } = await supabase.auth.getUser();

    const { data: asset, error: dbError } = await supabase
      .from('media_assets')
      .insert({
        title,
        alt_text,
        tags,
        mime_type: file.type,
        byte_size: file.size,
        storage_path: storagePath,
        url: publicUrl,
        status: 'active',
        created_by: user.user?.id || null
      })
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      console.error('Database error:', dbError);
      throw dbError;
    }

    return asset as MediaAsset;
  } catch (err) {
    console.error('Error uploading media:', err);
    return null;
  }
}

export async function listMedia(filters?: { status?: 'active' | 'archived'; tags?: string[] }): Promise<MediaAsset[]> {
  try {
    let query = supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing media:', error);
      return [];
    }

    return (data as MediaAsset[]) || [];
  } catch (err) {
    console.error('Exception listing media:', err);
    return [];
  }
}

export async function getMediaAsset(id: string): Promise<MediaAsset | null> {
  try {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching media asset:', error);
      return null;
    }

    return data as MediaAsset;
  } catch (err) {
    console.error('Exception fetching media asset:', err);
    return null;
  }
}

export async function updateMediaAsset(id: string, updates: Partial<Pick<MediaAsset, 'title' | 'alt_text' | 'tags' | 'status'>>): Promise<MediaAsset | null> {
  try {
    const { data, error } = await supabase
      .from('media_assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating media asset:', error);
      return null;
    }

    return data as MediaAsset;
  } catch (err) {
    console.error('Exception updating media asset:', err);
    return null;
  }
}

export async function archiveMediaAsset(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('media_assets')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) {
      console.error('Error archiving media asset:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception archiving media asset:', err);
    return false;
  }
}

export async function deleteMediaAsset(id: string): Promise<boolean> {
  try {
    const asset = await getMediaAsset(id);
    if (!asset) return false;

    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([asset.storage_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }

    const { error: dbError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception deleting media asset:', err);
    return false;
  }
}
