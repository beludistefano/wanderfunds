import { useParams } from "react-router-dom";
import Header from "../components/header";
import "../css/tripdash.css";
import { useEffect, useState } from "react";

export default function RejectInvitation() {
  const { invitationid } = useParams();
  const [loading, setLoading] = useState(true);

  async function rejectInvitation() {
    try {
      const rejectData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/rejectinvitation?invitation_token=${invitationid}`
      );
      const rejectJson = await rejectData.json();

      console.log(rejectJson);

      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    rejectInvitation();
  }, []);

  return (
    <div>
      {!loading ? (
        <>
          <Header></Header>
          <div id="mainContentInvitation">
            <h2>Bon voyage? More like Non voyage ✈️</h2>
            <p>
              Your trip invitation has been rejected. See you on the next
              adventure!
            </p>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
