import { employee_with_unused } from '@/types/types.d';
import { supabase } from "@/lib/supabaseClient";

export async function fetchEmployeeByUserId(user_id: string): Promise<employee_with_unused> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error) throw error;
  return data;
}
