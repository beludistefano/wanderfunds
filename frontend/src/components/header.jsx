import "../css/components/header.css";

export default function Header() {
  return (
    <header id="header">
      <div id="logoSection">
        <img src="./src/assets/oneLogo.png" alt="WanderFunds Logo" />
      </div>
      <div id="functionalitiesHeader">
        <img
          src="./src/assets/iconNotif.png"
          className="smallLogo notifLogo"
          alt="Notifications Logo"
        />
        <img
          src="./src/assets/iconProf.png"
          className="smallLogo profileLogo"
          alt="Profile Logo"
        />
      </div>
    </header>
  );
}
