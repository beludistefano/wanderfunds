import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import "../css/components/mainSideBar.css";

export default function MainSideBar() {
  const navigate = useNavigate();

  async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Sign-out error:", error);
    }
    navigate("/");
  }

  return (
    <div id="mainSideBar">
      <ul>
        <li className="listLinks">
          <Link to="/" className="links">
            Home
          </Link>
        </li>
        <li className="listLinks">
          <Link to="/profile" className="links">
            Profile
          </Link>
        </li>
        <li className="listLinks">
          <Link onClick={logoutUser} className="links">
            Logout
          </Link>
        </li>
      </ul>
    </div>
  );
}
