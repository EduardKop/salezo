import Image from "next/image";
import blackLogo from "../../../black-logo.png";
import whiteLogo from "../../../white-logo.png";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({ className, imageClassName }: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="flex shrink-0 items-center justify-center">
        <Image
          src={whiteLogo}
          alt="Salezo"
          sizes="32px"
          className={cn("h-8 w-auto max-w-none object-contain dark:hidden", imageClassName)}
          priority
        />
        <Image
          src={blackLogo}
          alt="Salezo"
          sizes="32px"
          className={cn("hidden h-8 w-auto max-w-none object-contain dark:block", imageClassName)}
          priority
        />
      </span>
      <span className="font-semibold text-lg tracking-tight">Salezo</span>
    </span>
  );
}
