import Image, { ImageProps } from "next/image";
import clsx from "clsx";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";
type ResponsiveMap = Partial<Record<Breakpoint | "base", string>>;
// 값 예시: { base: "120px", md: "160px", lg: "200px" }

export interface BaseImageSize {
  /** 기본 소스 이미지의 고정 폭/높이(px) — 비율 계산용 */
  width: number;
  height: number;
}

interface ResponsiveImageProps
  extends Omit<ImageProps, "width" | "height" | "sizes" | "fill">,
    BaseImageSize {
  /** Tailwind 폭을 브레이크포인트별로 지정 (px, vw 등 허용) */
  responsive?: ResponsiveMap;
  /** 상자 가득 채우는 fill 모드 (부모 요소가 position:relative 필요) */
  fillMode?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/** Tailwind 기본 브레이크포인트와 media-query 매핑 */
const MQ: Record<Exclude<Breakpoint, never>, string> = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

/** responsive 맵을 sizes 문자열로 변환 */
function buildSizes(responsive?: ResponsiveMap) {
  if (!responsive) return undefined;
  const order: (keyof ResponsiveMap)[] = ["2xl", "xl", "lg", "md", "sm"];
  const parts: string[] = [];
  for (const bp of order) {
    const size = responsive[bp as Breakpoint];
    if (size) parts.push(`${MQ[bp as Breakpoint]} ${size}`);
  }
  const base = responsive.base ?? "100vw";
  parts.push(base);
  return parts.join(", ");
}

/** responsive 맵을 Tailwind width 클래스 문자열로 변환 (px/퍼센트 등 지원) */
function buildWidthClasses(responsive?: ResponsiveMap) {
  if (!responsive) return "";
  const toW = (v: string) => {
    // px이면 w-[160px] 형태, vw/% 등 단위도 그대로 허용
    if (/^\d+px$/.test(v)) return `w-[${v}]`;
    return `w-[${v}]`;
  };
  const classes: string[] = [];
  if (responsive.base) classes.push(toW(responsive.base));
  if (responsive.sm) classes.push(`sm:${toW(responsive.sm)}`);
  if (responsive.md) classes.push(`md:${toW(responsive.md)}`);
  if (responsive.lg) classes.push(`lg:${toW(responsive.lg)}`);
  if (responsive.xl) classes.push(`xl:${toW(responsive.xl)}`);
  if (responsive["2xl"]) classes.push(`2xl:${toW(responsive["2xl"]!)}`);
  return classes.join(" ");
}

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  responsive,
  fillMode = false,
  className,
  priority,
  quality,
  ...rest
}: ResponsiveImageProps) {
  const sizes = buildSizes(responsive);
  const widthClasses = buildWidthClasses(responsive);

  // 이미지의 시각적 크기는 CSS로, 내려받는 소스 선택은 sizes로 제어
  const common = {
    alt,
    src,
    sizes,
    className: clsx("h-auto", widthClasses, className),
    priority,
    quality,
    ...rest,
  };

  if (fillMode) {
    // 부모 요소에 relative 필요, object-fit은 className으로 제어 (object-contain 등)
    return <Image fill {...common} />;
  }

  // 고정 width/height로 비율을 알려주되, 렌더 폭은 CSS로 변경
  return <Image width={width} height={height} {...common} />;
}
