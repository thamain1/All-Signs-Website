import { supabase } from './supabase';

export interface ContentSlotValue {
  imageAssetId?: string;
  fallbackPath: string;
  alt: string;
  headline?: string;
  subhead?: string;
  enabled: boolean;
  url?: string;
}

interface ContentSlot {
  id: string;
  slot_key: string;
  draft_value: ContentSlotValue;
  published_value: ContentSlotValue;
  updated_at: string;
}

class ContentResolver {
  private cache: Map<string, ContentSlotValue> = new Map();
  private previewMode: boolean = false;

  setPreviewMode(enabled: boolean) {
    this.previewMode = enabled;
    this.clearCache();
  }

  isPreviewMode(): boolean {
    return this.previewMode;
  }

  clearCache() {
    this.cache.clear();
  }

  async getContentSlot(slotKey: string): Promise<ContentSlotValue | null> {
    const cacheKey = `${slotKey}-${this.previewMode ? 'draft' : 'published'}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const { data, error } = await supabase
        .from('content_slots')
        .select('*')
        .eq('slot_key', slotKey)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching content slot ${slotKey}:`, error);
        return null;
      }

      if (!data) {
        console.warn(`Content slot not found: ${slotKey}`);
        return null;
      }

      const slot = data as ContentSlot;
      const value = this.previewMode ? slot.draft_value : slot.published_value;

      if (!value || !value.enabled) {
        console.warn(`Content slot disabled or empty: ${slotKey}`);
        return null;
      }

      if (value.imageAssetId && !value.url) {
        const { data: asset } = await supabase
          .from('media_assets')
          .select('url')
          .eq('id', value.imageAssetId)
          .eq('status', 'active')
          .maybeSingle();

        if (asset) {
          value.url = asset.url;
        }
      }

      this.cache.set(cacheKey, value);
      return value;
    } catch (err) {
      console.error(`Exception fetching content slot ${slotKey}:`, err);
      return null;
    }
  }

  async getAllSlots(): Promise<Record<string, ContentSlotValue>> {
    try {
      const { data, error } = await supabase
        .from('content_slots')
        .select('*');

      if (error) {
        console.error('Error fetching all content slots:', error);
        return {};
      }

      const slots: Record<string, ContentSlotValue> = {};

      for (const slot of (data as ContentSlot[])) {
        const value = this.previewMode ? slot.draft_value : slot.published_value;
        if (value && value.enabled) {
          slots[slot.slot_key] = value;
        }
      }

      return slots;
    } catch (err) {
      console.error('Exception fetching all content slots:', err);
      return {};
    }
  }

  getImageUrl(slotValue: ContentSlotValue | null): string {
    if (!slotValue) {
      return '';
    }

    return slotValue.url || slotValue.fallbackPath;
  }
}

export const contentResolver = new ContentResolver();
