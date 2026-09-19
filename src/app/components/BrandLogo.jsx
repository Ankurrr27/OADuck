import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ dark = false }) {
  return (
    <Link className={`flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight sm:gap-2.5 sm:text-xl ${dark ? "text-[#f7f5ed]" : "text-[#111416]"}`} href="/" aria-label="OA Duck home">
      <Image className="h-8 w-8 shrink-0 object-contain sm:h-11 sm:w-11" src="/OADuck.png" alt="" width={42} height={36} priority />
      <span>OA Duck</span>
    </Link>
  );
}
