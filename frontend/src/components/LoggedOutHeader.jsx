import "../css/components/header.css";
import logo from "../assets/oneLogo.png";
import { Link, useNavigate } from "react-router-dom";

export default function LoggedOutHeader() {
  const navigate = useNavigate();

  return (
    <>
      <header id="header">
        <div id="logoSection">
          <Link to="/">
            <img src={logo} alt="WanderFunds Logo" />
          </Link>
        </div>
        <div id="functionalitiesHeader">
          <></>
        </div>
      </header>
    </>
  );
}
