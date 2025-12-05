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
  console.log("▶️ uploadFormData 시작", formData);

  if (!formData.userId) {
    console.error("❌ userId 없음, Supabase 요청 안 보냄");
    throw new Error("userId가 없습니다.");
  }

  const sb = supabase;

  if (!sb) {
    console.error("❌ supabase 인스턴스가 undefined 입니다.");
    throw new Error("supabase 클라이언트가 초기화되지 않았습니다.");
  }

  try {
    const insertPayload = {
      user_id: formData.userId,
      type: formData.type,
      time: formData.time,
      category: formData.category,
      special: formData.special,
      start_date:
        formData.startDate instanceof Date
          ? formData.startDate.toISOString().slice(0, 10)
          : formData.startDate,
      end_date:
        formData.endDate instanceof Date
          ? formData.endDate.toISOString().slice(0, 10)
          : formData.endDate,
      reason: formData.reason,
      status: formData.status,
      normal_num: formData.normal_num,
      special_num: formData.special_num,
      date_num: formData.date_num,
      special_file_path: null as string | null,
    };

    console.log("📡 Supabase insert 요청 직전 payload:", insertPayload);

    const { data: vacationRow, error: vErr } = await sb
      .from("vacation")
      .insert(insertPayload)
      .select("id")
      .single();

    console.log("📡 Supabase insert 응답:", { vacationRow, vErr });
    

    if (vErr || !vacationRow?.id) {
      console.error("❌ vacation insert 에러:", vErr);
      throw vErr ?? new Error("vacation insert failed");
    }

    let finalFilePath: string | null = null;
    let uploadedObjectPath: string | null = null;

    if (formData.category === "특수" && formData.file instanceof File) {
      const bucket = "vacation-special";
      const fileName = sanitizeFileName(formData.file.name);
      const path = `${vacationRow.id}/${fileName}`;

      console.log("📂 파일 업로드 시작", { bucket, path });

      const { data: upRes, error: upErr } = await sb.storage
        .from(bucket)
        .upload(path, formData.file, { upsert: false });

      console.log("📂 파일 업로드 응답", { upRes, upErr });

      if (upErr) {
        console.error("❌ 파일 업로드 에러, vacation 롤백", upErr);
        await sb.from("vacation").delete().eq("id", vacationRow.id);
        throw upErr;
      }

      uploadedObjectPath = upRes?.path ?? path;

      const { data: urlData } = sb.storage
        .from(bucket)
        .getPublicUrl(uploadedObjectPath);

      finalFilePath = urlData?.publicUrl ?? uploadedObjectPath;

      console.log("🌐 publicUrl 생성", { finalFilePath });

      const { error: metaErr } = await sb
        .from("vacation_special_files")
        .insert({
          vacation_id: vacationRow.id,
          bucket,
          file_path: uploadedObjectPath,
          original_name: formData.file.name,
          mime_type: formData.file.type,
          size: formData.file.size,
        });

      console.log("📝 메타데이터 insert 응답", { metaErr });

      if (metaErr) {
        console.error(
          "❌ 메타데이터 insert 에러, 파일 + vacation 롤백",
          metaErr
        );
        await sb.storage.from(bucket).remove([uploadedObjectPath]);
        await sb.from("vacation").delete().eq("id", vacationRow.id);
        throw metaErr;
      }

      const { error: updErr } = await sb
        .from("vacation")
        .update({ special_file_path: finalFilePath })
        .eq("id", vacationRow.id);

      console.log("📝 vacation special_file_path 업데이트 응답", { updErr });

      if (updErr) {
        console.error("❌ vacation update 에러", updErr);
        throw updErr;
      }
    }

    console.log("✅ uploadFormData 완료", {
      id: vacationRow.id,
      special_file_path: finalFilePath,
    });

    return { id: vacationRow.id, special_file_path: finalFilePath };
  } catch (e) {
    console.error("🔥 uploadFormData 전체 에러", e);
    throw e;
  }
}
