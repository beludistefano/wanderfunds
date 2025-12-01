import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import "../css/login.css";
import LoggedOutHeader from "../components/LoggedOutHeader";

function validateRegistration(name, email, pass, repPass) {
  const registrationErrors = {};

  if (name.trim() == "") {
    registrationErrors.name = "Name cannot be empty";
  }

  if (email.trim() == "") {
    registrationErrors.email = "Email cannot be empty";
  }

  if (pass.trim() == "" || pass == null) {
    registrationErrors.pass = "Password cannot be empty";
  }

  if (pass.length < 8) {
    registrationErrors.passLength = "Password must have at least 8 characters";
  }

  if (repPass.trim() == "") {
    registrationErrors.repPass = "You must repeat your password";
  }

  if (pass !== repPass) {
    registrationErrors.match = "Passwords don't match";
  }

  return registrationErrors;
}

export default function Register() {
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  const [captchaToken, setCaptchaToken] = useState(null);
  const hcaptchaRef = useRef();

  const navigate = useNavigate();
  const location = useLocation();

  function checkPassStrength(value) {
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const isLongEnough = value.length >= 8;

    if (!isLongEnough || !hasLetter || !hasNumber) {
      setPasswordStrength(
        "Password must have at least 8 characters, and have at least 1 letter and 1 number"
      );
      setPassword(value);
      return;
    } else {
      setPasswordStrength(null);
      setPassword(value);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    console.log("Registration attempt:", { userEmail, name, password });

    setValidationErrors({});

    const registerValidation = validateRegistration(
      name,
      userEmail,
      password,
      repeatPassword
    );
    setValidationErrors(registerValidation);

    if (Object.keys(registerValidation).length != 0) {
      setLoading(false);
      return;
    }

    if (!captchaToken) {
      setErrorMsg("Please complete the captcha verification.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: password,
      options: {
        data: {
          display_name: name,
        },
        captchaToken,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setCaptchaToken(null);
      console.log(error.message);
      if (hcaptchaRef.current) {
        hcaptchaRef.current.resetCaptcha();
      }
      setLoading(false);
      return;
    } else {
      setErrorMsg("");
    }

    const userId = data.user?.id;
    console.log("New user ID:", userId);

    var createProfileData = {};
    createProfileData["name"] = name;
    createProfileData["email"] = userEmail;
    createProfileData["user_id"] = userId;

    console.log(createProfileData);

    try {
      const createProfile = await fetch(
        "https://wanderfunds-backend.onrender.com/api/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createProfileData),
        }
      );

      const createResp = await createProfile.json();
      console.log(createResp);
      const from = location.state?.from;
      const dest =
        from && !["/login", "/register", "/"].includes(from.pathname)
          ? `${from.pathname}${from.search || ""}`
          : "/dashboard";
      navigate(dest, { replace: true });
    } catch (e) {
      setErrorMsg(
        "There was a problem creating your profile. Please try again."
      );
      setCaptchaToken(null);
      console.log(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="centralDiv">
      <LoggedOutHeader></LoggedOutHeader>
      <div id="registerMainContent">
        <h2>Register to WanderFunds</h2>
        <form
          className="loginForm"
          id="registrationForm"
          onSubmit={handleSubmit}
        >
          <div className="formGroup registerFormGroup">
            <label htmlFor="username">Name</label>
            <input
              id="userName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`formInput ${
                validationErrors.name ? "borderRed" : ""
              }`}
            />
            {validationErrors.name && (
              <p className="errorDisplayText">{validationErrors.name}</p>
            )}
          </div>

          <div className="formGroup registerFormGroup">
            <label htmlFor="username">Email</label>
            <input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className={`formInput ${
                validationErrors.email ? "borderRed" : ""
              }`}
            />
            {validationErrors.email && (
              <p className="errorDisplayText">{validationErrors.email}</p>
            )}
          </div>

          <div className="formGroup registerFormGroup">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => checkPassStrength(e.target.value)}
              className={`formInput ${
                validationErrors.pass || validationErrors.passLength
                  ? "borderRed"
                  : ""
              }`}
            />
            {validationErrors.pass && (
              <p className="errorDisplayText">{validationErrors.pass}</p>
            )}
            {passwordStrength && (
              <p className="errorDisplayText">{passwordStrength}</p>
            )}
            {validationErrors.passLength && (
              <p className="errorDisplayText">{validationErrors.passLength}</p>
            )}
          </div>

          <div className="formGroup registerFormGroup">
            <label htmlFor="password">Repeat Password</label>
            <input
              id="passwordRep"
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={`formInput ${
                validationErrors.repPass || validationErrors.match
                  ? "borderRed"
                  : ""
              }`}
            />
            {validationErrors.repPass && (
              <p className="errorDisplayText">{validationErrors.repPass}</p>
            )}
            {validationErrors.match && (
              <p className="errorDisplayText">{validationErrors.match}</p>
            )}
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
              setLoading(false);
            }}
            onError={() => {
              setErrorMsg("Captcha error. Please try again.");
              setLoading(false);
              setCaptchaToken(null);
            }}
          />

          <button type="submit" className="loginButton" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          {errorMsg != "" && (
            <div id="registrationResult" className="errorDisplayText">
              {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
