import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";
import HCaptcha from "@hcaptcha/react-hcaptcha";

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

function validateEmail(username) {
  const loginErrors = {};

  if (username == "") {
    loginErrors.username = "Email cannot be empty";
  }

  return loginErrors;
}

export default function Login() {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [updatePasswordMessage, setUpdatePasswordMessage] = useState(null);

  const [captchaToken, setCaptchaToken] = useState(null);
  const hcaptchaRef = useRef();

  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading, initialized } = useAuth();

  useEffect(() => {
    if (initialized && session) {
      const from = location.state?.from;
      const redirectTo =
        from && from.pathname !== "/login"
          ? `${from.pathname}${from.search || ""}`
          : "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [initialized, session, navigate, location.state]);

  async function updatePass() {
    setValidationErrors({});
    const errs = validateEmail(userEmail);
    setValidationErrors(errs);
    if (Object.keys(errs).length) {
      setSubmitting(false);
      return;
    }

    try {
      var token = captchaToken;
      if (hcaptchaRef.current && !token) {
        token = await hcaptchaRef.current.execute({ async: true });
        setCaptchaToken(token);
      }

      if (!token) {
        setErrorMsg("Please complete the captcha verification.");
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(
        userEmail,
        {
          redirectTo:
            "https://wanderfunds-frontend.onrender.com/update-password",
          captchaToken: token,
        }
      );

      if (error) {
        setErrorMsg(error.message);
        setSubmitting(false);
        return;
      } else {
        setSubmitting(false);
        setUpdatePasswordMessage("Please check your inbox!");
      }
    } catch (e) {
      setSubmitting(false);
      setErrorMsg(error.message);
    }
  }

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

    if (!captchaToken) {
      setErrorMsg("Please complete the captcha verification.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
      options: { captchaToken },
    });

    if (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
      setCaptchaToken(null);
      if (hcaptchaRef.current) {
        hcaptchaRef.current.resetCaptcha();
      }
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
              <a onClick={updatePass}>Forgot Password?</a>
            </div>
          </div>
          <HCaptcha
            ref={hcaptchaRef}
            sitekey="dad63dc4-0696-48ee-966a-a5e2f540dffa"
            onVerify={(token) => {
              setCaptchaToken(token);
              setErrorMsg("");
            }}
            onExpire={() => {
              setCaptchaToken(null);
              setErrorMsg("Captcha expired. Please try again.");
              setSubmitting(false);
            }}
            onError={() => {
              setErrorMsg("Captcha error. Please try again.");
              setSubmitting(false);
              setCaptchaToken(null);
            }}
          />
          <button type="submit" className="loginButton">
            Login
          </button>
          {errorMsg != "" && (
            <div id="loginResult" className="errorDisplayText">
              {errorMsg}
            </div>
          )}
          {updatePasswordMessage != "" && (
            <div id="updateMessage" className="errorDisplayText">
              {updatePasswordMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
