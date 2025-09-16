import { Link } from "react-router-dom";

import "../css/components/mainSideBar.css";

export default function MainSideBar() {
  return (
    <div id="mainSideBar">
      <ul>
        <li className="listLinks">
          <Link className="links">Home</Link>
        </li>
        <li className="listLinks">
          <Link className="links">Expense Log</Link>
        </li>
      </ul>
    </div>
  );
}
