import { supabase } from "@/integrations/supabase/client";

export type AssetType = "cover" | "illustration";
export type AssetRecord = {
  id: string;
  project_id: string;
  url: string;
  prompt?: string | null;
  type: AssetType;
  created_at: string;
};

export async function listAssets(params: { projectId: string; type?: AssetType }): Promise<AssetRecord[]> {
  const { projectId, type } = params;
  let q = supabase
    .from("assets")
    .select("id, project_id, url, prompt, type, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (type) q = q.eq("type", type);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as AssetRecord[]) ?? [];
}

// Index the image URL returned by the existing Edge Function (no re-upload)
export async function createAssetFromFunctionResponse(params: {
  projectId: string;
  type: AssetType;
  imageUrl: string;
  prompt?: string | null;
}): Promise<AssetRecord> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess?.session?.user) throw new Error("You must be signed in to save.");

  const { data, error } = await supabase
    .from("assets")
    .insert({
      project_id: params.projectId,
      type: params.type,
      url: params.imageUrl,
      prompt: params.prompt ?? null
    })
    .select("id, project_id, url, prompt, type, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as AssetRecord;
}