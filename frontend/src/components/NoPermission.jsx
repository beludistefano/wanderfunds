import { Link, useNavigate } from "react-router-dom";
import noaccess from "../assets/noaccess.png";
import "../css/components/nopermission.css";

export default function NoPermission() {
  return (
    <div id="mainNoPermission">
      <h2>Oups...</h2>
      <img alt="No access" src={noaccess} />
      <p>It seems like you don't have the permissions to access this page</p>
    </div>
  );
}
