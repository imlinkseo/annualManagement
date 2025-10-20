import ResponsiveImage, {
  BaseImageSize,
} from "@/components/common/ResponsiveImage";

type Props = BaseImageSize;

export default function Logo({ width, height }: Props) {
  return (
    <ResponsiveImage
      src="/img/logo.png"
      alt="logo"
      width={width}
      height={height}
      priority
    />
  );
}
