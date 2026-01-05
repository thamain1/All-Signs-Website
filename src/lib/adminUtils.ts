import { supabase } from './supabase';

export interface UserProfile {
  user_id: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

    if (!targetUserId) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('Exception fetching user profile:', err);
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const profile = await getUserProfile();
    return profile?.role === 'admin';
  } catch (err) {
    console.error('Exception checking admin status:', err);
    return false;
  }
}

export async function ensureProfile(): Promise<UserProfile | null> {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      return null;
    }

    let profile = await getUserProfile(user.user.id);

    if (!profile) {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.user.id,
          role: 'user'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      profile = data as UserProfile;
    }

    return profile;
  } catch (err) {
    console.error('Exception ensuring profile:', err);
    return null;
  }
}

export async function setUserRole(userId: string, role: 'user' | 'admin'): Promise<boolean> {
  try {
    const currentUserIsAdmin = await isAdmin();

    if (!currentUserIsAdmin) {
      console.error('Only admins can change user roles');
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception setting user role:', err);
    return false;
  }
}
