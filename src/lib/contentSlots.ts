import { supabase } from './supabase';
import { ContentSlotValue } from './contentResolver';

export interface ContentSlot {
  id: string;
  slot_key: string;
  draft_value: ContentSlotValue;
  published_value: ContentSlotValue;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface ContentVersion {
  id: string;
  version: number;
  published_snapshot: Record<string, ContentSlotValue>;
  published_at: string;
  published_by: string | null;
  notes: string;
}

export async function listContentSlots(): Promise<ContentSlot[]> {
  try {
    const { data, error } = await supabase
      .from('content_slots')
      .select('*')
      .order('slot_key', { ascending: true });

    if (error) {
      console.error('Error listing content slots:', error);
      return [];
    }

    return (data as ContentSlot[]) || [];
  } catch (err) {
    console.error('Exception listing content slots:', err);
    return [];
  }
}

export async function getContentSlot(slotKey: string): Promise<ContentSlot | null> {
  try {
    const { data, error } = await supabase
      .from('content_slots')
      .select('*')
      .eq('slot_key', slotKey)
      .maybeSingle();

    if (error) {
      console.error('Error fetching content slot:', error);
      return null;
    }

    return data as ContentSlot;
  } catch (err) {
    console.error('Exception fetching content slot:', err);
    return null;
  }
}

export async function updateDraftValue(slotKey: string, draftValue: ContentSlotValue): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('content_slots')
      .update({
        draft_value: draftValue,
        updated_at: new Date().toISOString(),
        updated_by: user.user?.id || null
      })
      .eq('slot_key', slotKey);

    if (error) {
      console.error('Error updating draft value:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception updating draft value:', err);
    return false;
  }
}

export async function publishAll(notes: string = ''): Promise<boolean> {
  try {
    const slots = await listContentSlots();

    const snapshot: Record<string, ContentSlotValue> = {};
    const updates: Array<{ slot_key: string; published_value: ContentSlotValue }> = [];

    for (const slot of slots) {
      if (slot.draft_value && Object.keys(slot.draft_value).length > 0) {
        snapshot[slot.slot_key] = slot.draft_value;
        updates.push({
          slot_key: slot.slot_key,
          published_value: slot.draft_value
        });
      } else {
        snapshot[slot.slot_key] = slot.published_value;
      }
    }

    const { data: versions } = await supabase
      .from('content_versions')
      .select('version')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (versions?.version || 0) + 1;

    const { data: user } = await supabase.auth.getUser();

    const { error: versionError } = await supabase
      .from('content_versions')
      .insert({
        version: nextVersion,
        published_snapshot: snapshot,
        published_by: user.user?.id || null,
        notes
      });

    if (versionError) {
      console.error('Error creating version:', versionError);
      return false;
    }

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('content_slots')
        .update({ published_value: update.published_value })
        .eq('slot_key', update.slot_key);

      if (updateError) {
        console.error(`Error publishing slot ${update.slot_key}:`, updateError);
      }
    }

    return true;
  } catch (err) {
    console.error('Exception publishing content:', err);
    return false;
  }
}

export async function listVersions(): Promise<ContentVersion[]> {
  try {
    const { data, error } = await supabase
      .from('content_versions')
      .select('*')
      .order('version', { ascending: false });

    if (error) {
      console.error('Error listing versions:', error);
      return [];
    }

    return (data as ContentVersion[]) || [];
  } catch (err) {
    console.error('Exception listing versions:', err);
    return [];
  }
}

export async function rollbackToVersion(versionId: string): Promise<boolean> {
  try {
    const { data: version, error: fetchError } = await supabase
      .from('content_versions')
      .select('*')
      .eq('id', versionId)
      .maybeSingle();

    if (fetchError || !version) {
      console.error('Error fetching version:', fetchError);
      return false;
    }

    const snapshot = (version as ContentVersion).published_snapshot;

    for (const [slotKey, value] of Object.entries(snapshot)) {
      const { error: updateError } = await supabase
        .from('content_slots')
        .update({
          published_value: value,
          draft_value: value
        })
        .eq('slot_key', slotKey);

      if (updateError) {
        console.error(`Error rolling back slot ${slotKey}:`, updateError);
      }
    }

    return true;
  } catch (err) {
    console.error('Exception rolling back version:', err);
    return false;
  }
}

export async function createContentSlot(slotKey: string, initialValue: ContentSlotValue): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('content_slots')
      .insert({
        slot_key: slotKey,
        draft_value: initialValue,
        published_value: initialValue,
        updated_by: user.user?.id || null
      });

    if (error) {
      console.error('Error creating content slot:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception creating content slot:', err);
    return false;
  }
}
