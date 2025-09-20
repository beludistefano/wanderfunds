import "../css/components/header.css";
import logo from "../assets/oneLogo.png";
import notif from "../assets/iconNotif.png";
import prof from "../assets/iconProf.png";

export default function Header() {
  return (
    <header id="header">
      <div id="logoSection">
        <img src={logo} alt="WanderFunds Logo" />
      </div>
      <div id="functionalitiesHeader">
        <img
          src={notif}
          className="smallLogo notifLogo"
          alt="Notifications Logo"
        />
        <img src={prof} className="smallLogo profileLogo" alt="Profile Logo" />
      </div>
    </header>
  );
}
