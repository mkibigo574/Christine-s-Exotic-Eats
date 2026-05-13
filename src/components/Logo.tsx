import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Christine's Exotic Eats — Enlighten your taste buds"
      width={446}
      height={140}
      priority
      className={`h-12 md:h-14 w-auto select-none ${className}`}
    />
  );
}

export function Monogram({ size = 44 }: { size?: number }) {
  return (
    <Image
      src="/calabash.png"
      alt=""
      width={105}
      height={134}
      aria-hidden
      className="select-none w-auto"
      style={{ height: size }}
    />
  );
}
