import { BodyButterImage } from "./BodyButterImage";
import { BodyOilImage } from "./BodyOilImage";
import { BundleImage } from "./BundleImage";
import { GlowBalmImage } from "./GlowBalmImage";

const PRODUCT_IMAGES = [BodyButterImage, BodyOilImage, GlowBalmImage, BundleImage];

interface ProductImageProps {
  index: number;
  className?: string;
}

/** Renders the product illustration for the given card index (wraps for any length). */
export function ProductImage({ index, className }: ProductImageProps) {
  const Illustration = PRODUCT_IMAGES[index % PRODUCT_IMAGES.length];
  return <Illustration className={className} />;
}
