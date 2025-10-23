import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import "../css/notifications.css";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";
import { format } from "date-fns";

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const { session, initialized } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  async function markAllRead() {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setLoading(false);
        return;
      }

      const notificationsData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/allnotifications`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const notifJson = await notificationsData.json();

      console.log(notifJson);
      await getNotifications();
    } catch (error) {
      console.log(error);
    }
  }

  async function setNotifRead(id) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setLoading(false);
        return;
      }

      const notificationsData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/notifications`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notifID: id }),
        }
      );

      const notifJson = await notificationsData.json();

      console.log(notifJson);
      await getNotifications();
    } catch (error) {
      console.log(error);
    }
  }

  async function getNotifications() {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setLoading(false);
        return;
      }

      const notificationsData = await fetch(
        `https://wanderfunds-backend.onrender.com/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const notifJson = await notificationsData.json();

      console.log(notifJson);

      setNotifications(notifJson);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <div>
      {!loading ? (
        <>
          <Header></Header>
          <div id="mainContent">
            <MainSideBar id="mainSideBar" />
            <div id="notificationsCenterContainer">
              {notifications.length == 0 ? (
                <p>No notifications!</p>
              ) : (
                <>
                  <div id="notificationsContainer">
                    {notifications.map((n) => {
                      return (
                        <div
                          key={n.id}
                          className={`notificationCard ${
                            n.read ? "notificationRead" : "notificationUnread"
                          }`}
                        >
                          <div className="notificationColumn">
                            <p className="notificationTitle">
                              ➡️ {n.notif_title} -{" "}
                              <span className="notifDate">
                                {format(new Date(n.created_at), "MMM d, yyyy")}
                              </span>
                            </p>
                            <p className="notificationDesc">{n.notif_desc}</p>
                          </div>
                          <div className="notificationColumnButton">
                            {n.read ? (
                              <></>
                            ) : (
                              <FontAwesomeIcon
                                onClick={() => setNotifRead(n.id)}
                                icon={faCircle}
                                className="notifIcon"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="notificationsButtonContainer">
                    <button
                      id="markAllReadButton"
                      onClick={markAllRead}
                      className="button buttonSave"
                    >
                      MARK ALL AS READ
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
