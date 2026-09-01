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

    // 3. Automatically sync to database and auth user_metadata
    if (type === "avatar") {
      await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
    } else {
      // Update users table
      await supabase
        .from("users")
        .update({ banner_url: publicUrl })
        .eq("id", userId);

      // Update freelancer_profiles cover_image if exists
      await supabase
        .from("freelancer_profiles")
        .update({ cover_image: publicUrl })
        .eq("user_id", userId);

      // Update client_profiles banner_url if exists
      await supabase
        .from("client_profiles")
        .update({ banner_url: publicUrl })
        .eq("user_id", userId);

      await supabase.auth.updateUser({
        data: {
          banner_url: publicUrl,
          cover_image: publicUrl,
        },
      });
    }

    return { publicUrl, error: null };
  } catch (err: unknown) {
    console.error(`Unexpected upload error for ${type}:`, err);
    const msg = err instanceof Error ? err.message : "Gagal mengunggah gambar";
    return { publicUrl: null, error: msg };
  }
}

/**
 * Reset / delete profile avatar or cover banner from database and auth
 */
export async function deleteProfileMedia(
  userId: string,
  type: ImageUploadType
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createClient();
    if (type === "avatar") {
      await supabase
        .from("users")
        .update({ avatar_url: null })
        .eq("id", userId);

      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
    } else {
      await supabase
        .from("users")
        .update({ banner_url: null })
        .eq("id", userId);

      await supabase
        .from("freelancer_profiles")
        .update({ cover_image: null })
        .eq("user_id", userId);

      await supabase
        .from("client_profiles")
        .update({ banner_url: null })
        .eq("user_id", userId);

      await supabase.auth.updateUser({
        data: {
          banner_url: null,
          cover_image: null,
        },
      });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    console.error(`Error deleting ${type}:`, err);
    const msg = err instanceof Error ? err.message : "Gagal menghapus gambar";
    return { success: false, error: msg };
  }
}

