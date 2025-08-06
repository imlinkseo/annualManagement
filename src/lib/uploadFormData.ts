import { createClient } from "@supabase/supabase-js";
import { formData } from "@/types/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const uploadFormData = async (formData: formData) => {
  const { userId, type, time, category, special, startDate, endDate, reason,status,date_num } =
    formData;

  const { data, error } = await supabase.from("vacation").insert([
    {
      user_id: userId,
      type,
      time,
      category,
      special,
      start_date: startDate ? startDate.toISOString().split("T")[0] : null,
      end_date: endDate ? endDate.toISOString().split("T")[0] : null,
      reason,status,date_num
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
