import "../css/components/header.css";
import logo from "../assets/oneLogo.png";
import notif from "../assets/iconNotif.png";
import prof from "../assets/iconProf.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Sign-out error:", error);
    }
    navigate("/");
  }

  return (
    <>
      <header id="header">
        <div id="logoSection">
          <Link to="/">
            <img src={logo} alt="WanderFunds Logo" />
          </Link>
        </div>
        <div id="functionalitiesHeader">
          <Link to="/notifications">
            <img
              src={notif}
              className="smallLogo profileLogo"
              alt="Notifications Logo"
            />
          </Link>
          <FontAwesomeIcon
            icon={faBars}
            className="menuLogo"
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </div>
      </header>
      {menuOpen && (
        <div className="dropdownMenu">
          <Link className="links" to="/">
            Home
          </Link>
          <Link className="links" to="/notifications">
            Notifications
          </Link>
          <Link className="links" to="/profile">
            Profile
          </Link>
          <Link className="links" onClick={logoutUser}>
            Logout
          </Link>
        </div>
      )}
    </>
  );
}
