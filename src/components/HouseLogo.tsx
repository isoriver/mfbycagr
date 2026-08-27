/* eslint-disable @next/next/no-img-element -- logos are tiny, local, trusted assets; using
   next/image here would force images.dangerouslyAllowSVG (SVG logos) for no real benefit. */
import { houseLogoSrc } from "@/lib/houseLogos";
import { avatarColor, avatarInitials } from "@/lib/format";

/**
 * A fund house's logo, with a graceful fallback to the generated initials avatar when no
 * logo file has been added for that house (see src/lib/houseLogos.ts for the convention).
 * Server component; renders identically to the old avatar when no logo is present.
 */
export function HouseLogo({
  house,
  houseSlug,
  size = 30,
  className = "",
}: {
  house: string;
  houseSlug: string;
  size?: number;
  className?: string;
}) {
  const src = houseLogoSrc(houseSlug);
  const box = { width: size, height: size } as const;

  if (src) {
    return (
      <span
        style={box}
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border ${className}`}
      >
        <img
          src={src}
          alt={`${house} logo`}
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-contain p-[3px]"
        />
      </span>
    );
  }

  const fontSize = size >= 40 ? 15 : size >= 33 ? 13 : 12;
  return (
    <span
      aria-hidden="true"
      style={{ ...box, background: avatarColor(house), fontSize }}
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
    >
      {avatarInitials(house)}
    </span>
  );
}
