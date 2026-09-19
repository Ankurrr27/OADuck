import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ dark = false }) {
  return (
    <Link className={`flex items-center gap-2.5 text-xl font-bold tracking-tight ${dark ? "text-[#f7f5ed]" : "text-[#111416]"}`} href="/" aria-label="OA Duck home">
      <Image className="h-11 w-11 object-contain" src="/OADuck.png" alt="" width={42} height={36} priority />
      <span>OA Duck</span>
    </Link>
  );
}
