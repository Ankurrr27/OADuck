import BrandLogo from "./BrandLogo";
import ProfileMenu from "./ProfileMenu";

export default function AppHeader() {
  return (
    <header className="dashboard-header">
      <BrandLogo />
      <ProfileMenu />
    </header>
  );
}
