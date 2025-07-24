import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, document_type, publicUrl } = req.body;
  if (!user_id || !document_type || !publicUrl) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  try {
    if (document_type === 'profile') {
      // Update user_profiles.profile_url
      const { error } = await supabase
        .from('user_profiles')
        .update({ profile_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user_id);
      if (error) throw error;
    } else if (document_type === 'dl' || document_type === 'id') {
      // Fetch existing driver_profiles row (if any)
      const { data: existing, error: fetchError } = await supabase
        .from('driver_profiles')
        .select('dl_url, id_url')
        .eq('user_profile_id', user_id)
        .single();
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      // Prepare upsert object with both NOT NULL columns
      const upsertObj: Record<string, string> = {
        user_profile_id: user_id,
        updated_at: new Date().toISOString(),
      };
      if (document_type === 'dl') {
        upsertObj.dl_url = publicUrl;
        upsertObj.id_url = existing?.id_url || '';
      } else if (document_type === 'id') {
        upsertObj.id_url = publicUrl;
        upsertObj.dl_url = existing?.dl_url || '';
      }
      // Ensure both NOT NULL columns are present
      if (!upsertObj.dl_url) upsertObj.dl_url = '';
      if (!upsertObj.id_url) upsertObj.id_url = '';
      const { error } = await supabase
        .from('driver_profiles')
        .upsert(upsertObj, { onConflict: 'user_profile_id' });
      if (error) throw error;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid document_type' });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Supabase update error:', error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 