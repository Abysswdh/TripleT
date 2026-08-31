import { createClient } from "@/lib/supabase/client";

export type ImageUploadType = "avatar" | "banner";

export interface UploadResult {
  publicUrl: string | null;
  error: string | null;
}

/**
 * Upload profile avatar or cover banner to Supabase Storage
 * and return the public permanent URL.
 */
export async function uploadProfileMedia(
  file: File,
  userId: string,
  type: ImageUploadType
): Promise<UploadResult> {
  try {
    const supabase = createClient();
    const bucket = type === "avatar" ? "avatars" : "banners";
    const fileExt = file.name.split(".").pop() || "png";
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error(`Error uploading ${type}:`, uploadError.message);
      return { publicUrl: null, error: uploadError.message };
    }

    // 2. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Automatically sync to database
    if (type === "avatar") {
      await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);
    } else {
      await supabase
        .from("freelancer_profiles")
        .update({ cover_image: publicUrl })
        .eq("user_id", userId);
    }

    return { publicUrl, error: null };
  } catch (err: any) {
    console.error(`Unexpected upload error for ${type}:`, err);
    return { publicUrl: null, error: err.message || "Gagal mengunggah gambar" };
  }
}
