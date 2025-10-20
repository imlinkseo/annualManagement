// ThemeToggle.tsx
import { useEffect, useState } from "react";

/** 현재 환경의 다크 여부(system 기준)를 반환 */
function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** 루트(html)에 다크/라이트 적용 + data-theme 동기화 */
function applyThemeToDocument(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");
}

/** 최초 테마 결정 로직: localStorage > html.classList(.dark) > system */
function getInitialIsDark() {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("theme"); // 'dark' | 'light' | null
  if (stored === "dark") return true;
  if (stored === "light") return false;
  // SSR에서 서버가 이미 .dark를 넣어둘 수도 있음
  if (document.documentElement.classList.contains("dark")) return true;
  // 마지막으로 시스템 설정
  return getSystemPrefersDark();
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  // 초기 1회: 테마 결정 및 적용
  useEffect(() => {
    const initial = getInitialIsDark();
    setIsDark(initial);
    applyThemeToDocument(initial);
  }, []);

  // 시스템 다크모드 변경을 감지(로컬 저장값이 없을 때만 반영하고 싶다면 로직 분기 추가)
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const handler = (e: MediaQueryListEvent) => {
      // 사용자가 버튼으로 명시적으로 바꿨다면 무시하고 싶다면 early-return
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return;
      setIsDark(e.matches);
      applyThemeToDocument(e.matches);
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    applyThemeToDocument(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        inline-flex items-center gap-2
        bg-surface text-content border border-border
        rounded-btn px-3 py-2 shadow-card
        hover:opacity-90 transition
      "
    >
      {/* 아이콘: 라이트=해, 다크=달 */}
      {isDark ? <MoonIcon /> : <SunIcon />}
      <span className="text-sm">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

/* 해(라이트) 아이콘 */
function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79l1.8-1.79zm10.48 14.32l1.79 1.79l1.79-1.79l-1.79-1.8l-1.79 1.8zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 12H1v0h3v0zm19 0h-3v0h3v0zM6.76 19.16l-1.8 1.79l-1.79-1.79l1.79-1.8l1.8 1.8zM17.24 4.84l1.8-1.79l1.79 1.79l-1.79 1.79l-1.8-1.79zM12 7a5 5 0 100 10a5 5 0 000-10z"
      />
    </svg>
  );
}

/* 달(다크) 아이콘 */
function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
      {...props}
    >
      <path
        fill="currentColor"
        d="M21 12.79A9 9 0 1111.21 3A7 7 0 0021 12.79z"
      />
    </svg>
  );
}
