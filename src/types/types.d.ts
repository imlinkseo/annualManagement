export interface employee {
  id: string;
  user_id: string;
  name: string;
  position: string;
  level: string;
  joined_date: string;
  created_at: string;
  vacation_total: string;
  vacation_used: string;
  vacation_generated_date: string;
  vacation_expiry_date: string;
}
export interface employee_with_unused extends employee {
  vacation_unused: string;
}
export interface vacation {
  id: string;
  type: string;
  time: string | null;
  category: string;
  special: string | null;
  start_date: string;
  end_date: string;
  reason: string;
  created_at: string;
  user_id: string;
}
export type type = "연차" | "반차";
export type category = "일반" | "특수";
export type time = "오전" | "오후" | null;
export type status = "대기" | "승인" | "반려";
export type special =
  | "건강검진 (0.5일)"
  | "예비군/민방위 (1일)"
  | "본인의 조부모·형제 자매 사망 (2일)"
  | "본인/배우자의 부모·배우자·자녀 사망 (5일)"
  | "배우자 출산 (3일)"
  | "본인 결혼 (5일)"
  | "본인/배우자의 형제자매 결혼 (1일)"
  | null;
export type special_item = {
    [K in Exclude<special, null>]?: number;
  };
export interface formData {
  userId: string | null;
  type: type;
  category: category;
  time: time;
  special: special;
  startDate: Date | undefined;
  endDate: Date | undefined;
  reason: string;
  status: status;
  date_num: number;
}
