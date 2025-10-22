import Holidays from "date-holidays";

const hd = new Holidays("KR");

const ymd = (d: Date) => {
  const z = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const yyyy = z.getFullYear();
  const mm = String(z.getMonth() + 1).padStart(2, "0");
  const dd = String(z.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function getHolidaySetInRange(start: Date, end: Date) {
  let s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  let e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (e < s) [s, e] = [e, s];

  const years = new Set<number>();
  for (let y = s.getFullYear(); y <= e.getFullYear(); y++) years.add(y);

  const set = new Set<string>();
  for (const y of years) {
    const list = hd.getHolidays(y) || [];
    for (const h of list) {
      if (!h?.date) continue;
      const d = new Date(h.date);
      if (d >= s && d <= e) set.add(ymd(d));
    }
  }
  return set;
}

export function isWeekend(d: Date) {
  const w = d.getDay();
  return w === 0 || w === 6;
}
