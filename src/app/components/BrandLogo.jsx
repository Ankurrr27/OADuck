import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ dark = false }) {
  return (
    <Link className={`brand-mark ${dark ? "brand-mark-dark" : ""}`} href="/" aria-label="OA Duck home">
      <Image className="brand-image" src="/OADuck.png" alt="" width={42} height={36} priority />
      <span className="brand-name">OA Duck</span>
    </Link>
  );
}
