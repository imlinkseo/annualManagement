import { supabase } from "./supabaseClient";
import { formData } from "@/types/types";
import { v4 as uuidv4 } from "uuid";


function sanitizeFileName(name: string) {
  const ext = name.includes(".") ? name.split(".").pop() : "";
  const base = name.replace(/\.[^/.]+$/, "");
  const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80);
  const uid = uuidv4().slice(0, 8);
  return ext ? `${safeBase}_${uid}.${ext}` : `${safeBase}_${uid}`;
}

export async function uploadFormData(formData: formData) {
  const sb = supabase;

  const insertPayload = {
    user_id: formData.userId,
    type: formData.type,
    time: formData.time,
    category: formData.category,
    special: formData.special,
    start_date: formData.startDate instanceof Date ? formData.startDate.toISOString() : formData.startDate,
    end_date: formData.endDate instanceof Date ? formData.endDate.toISOString() : formData.endDate,
    reason: formData.reason,
    status: formData.status,
    normal_num: formData.normal_num,
    special_num: formData.special_num,
    date_num: formData.date_num,
    special_file_path: null as string | null,
  };

  const { data: vacationRow, error: vErr } = await sb
    .from("vacation")
    .insert(insertPayload)
    .select("id")
    .single();

  if (vErr || !vacationRow?.id) throw vErr ?? new Error("vacation insert failed");

  let finalFilePath: string | null = null;
  let uploadedObjectPath: string | null = null;

  if (formData.category === "특수" && formData.file instanceof File) {
    const bucket = "vacation-special";
    const fileName = sanitizeFileName(formData.file.name);
    const path = `${vacationRow.id}/${fileName}`;

    const { data: upRes, error: upErr } = await sb.storage
      .from(bucket)
      .upload(path, formData.file, { upsert: false });

    if (upErr) {
      await sb.from("vacation").delete().eq("id", vacationRow.id);
      throw upErr;
    }

    uploadedObjectPath = upRes?.path ?? path;

    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(uploadedObjectPath);
    finalFilePath = urlData?.publicUrl ?? uploadedObjectPath;

    const { error: metaErr } = await sb.from("vacation_special_files").insert({
      vacation_id: vacationRow.id,
      bucket,
      file_path: uploadedObjectPath,
      original_name: formData.file.name,
      mime_type: formData.file.type,
      size: formData.file.size,
    });
    if (metaErr) {
      await sb.storage.from(bucket).remove([uploadedObjectPath]);
      await sb.from("vacation").delete().eq("id", vacationRow.id);
      throw metaErr;
    }

    const { error: updErr } = await sb
      .from("vacation")
      .update({ special_file_path: finalFilePath })
      .eq("id", vacationRow.id);
    if (updErr) throw updErr;
  }

  return { id: vacationRow.id, special_file_path: finalFilePath };
}