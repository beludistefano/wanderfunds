import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

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
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/");
      }
    });
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    setValidationErrors({});

    const loginValidation = validateLogin(userEmail, password);
    setValidationErrors(loginValidation);

    if (Object.keys(loginValidation).length != 0) {
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data?.session) {
      console.log("entered the if data ok");
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        console.log("entered the second if");
        sub.subscription.unsubscribe();
        const redirectTo = location.state?.from?.pathname || "/";
        navigate(redirectTo, { replace: true });
      }
    });
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
