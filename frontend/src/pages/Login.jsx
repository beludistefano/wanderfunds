import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

import "../css/login.css";
import Header from "../components/header";

function validateLogin(username, password) {
  const loginErrors = {};

  if (username == "") {
    loginErrors.username = "Email cannot be empty";
  }

  if (password == "") {
    loginErrors.password = "Password cannot be empty";
  }

  return loginErrors;
}

export default function Login() {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading, initialized } = useAuth();

  useEffect(() => {
    if (initialized && session) {
      const redirectTo =
        location.state?.from?.pathname &&
        location.state.from.pathname !== "/login"
          ? location.state.from.pathname
          : "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [initialized, session, navigate, location.state]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    setValidationErrors({});
    const errs = validateLogin(userEmail, password);
    setValidationErrors(errs);
    if (Object.keys(errs).length) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  return (
    <div id="centralDiv">
      <Header></Header>
      <div id="mainContent">
        <form className="loginForm" onSubmit={handleSubmit}>
          <div className="formGroup loginFormGroup">
            <label htmlFor="username">Email</label>
            <input
              id="username"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className={`formInput ${
                validationErrors.username ? "borderRed" : ""
              }`}
            />
            {validationErrors.username && (
              <p className="errorDisplayText">{validationErrors.username}</p>
            )}
          </div>

          <div className="formGroup loginFormGroup">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`formInput ${
                validationErrors.password ? "borderRed" : ""
              }`}
            />
            {validationErrors.password && (
              <p className="errorDisplayText">{validationErrors.password}</p>
            )}
            <div className="forgotPassword">
              <a href="#">Forgot Password?</a>
            </div>
          </div>

          <button type="submit" className="loginButton">
            Login
          </button>
          {errorMsg != "" && (
            <div id="loginResult" className="errorDisplayText">
              {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
