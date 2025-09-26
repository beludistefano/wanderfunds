import "../css/components/header.css";
import logo from "../assets/oneLogo.png";
import notif from "../assets/iconNotif.png";
import prof from "../assets/iconProf.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
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
          <FontAwesomeIcon
            icon={faBars}
            className="menuLogo"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          <img
            src={prof}
            className="smallLogo profileLogo"
            alt="Profile Logo"
          />
        </div>
      </header>
      {menuOpen && (
        <div className="dropdownMenu">
          <Link className="links" to="/">
            Home
          </Link>
          <Link className="links" to="/">
            Profile
          </Link>
        </div>
      )}
    </>
  );
}
