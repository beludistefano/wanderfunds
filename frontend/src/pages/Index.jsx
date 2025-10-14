import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

import "../css/login.css";
import Header from "../components/header";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div id="centralDiv">
      <Header></Header>
      <div id="mainContentIndex">
        <Link to="/login" className="loginButton">
          Login
        </Link>
        <Link to="/register" className="loginButton">
          Register
        </Link>
      </div>
    </div>
  );
}
