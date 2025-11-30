import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRef } from "react";

import "../css/login.css";
import Header from "../components/header";
import MainSideBar from "../components/MainSideBar";

function validateUpdate(old, pass, repPass) {
  const registrationErrors = {};

  if (old.trim() == "") {
    registrationErrors.oldpass = "Please insert your old password";
  }

  if (pass.trim() == "") {
    registrationErrors.pass = "Password cannot be empty";
  }

  if (pass.length < 8) {
    registrationErrors.passLength = "Password must have at least 8 characters";
  }

  if (repPass.trim() == "") {
    registrationErrors.repPass = "You must repeat your password";
  }

  if (pass !== repPass) {
    console.log(pass);
    console.log(repPass);
    registrationErrors.match = "Passwords don't match";
  }

  return registrationErrors;
}

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [captchaToken, setCaptchaToken] = useState(null);
  const hcaptchaRef = useRef();

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    setValidationErrors({});

    const updateValidation = validateUpdate(
      oldPassword,
      password,
      repeatPassword
    );
    setValidationErrors(updateValidation);

    if (Object.keys(updateValidation).length != 0) {
      setLoading(false);
      return;
    }

    try {
      await hcaptchaRef.current.execute();
    } catch (e) {
      console.log("We could not verify your request");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(captchaToken) {
    console.log("Token: " + captchaToken);
    try {
      const { data } = await supabase.auth.getUser();

      if (!data?.user?.email) {
        setErrorMsg("Error updating your password");
        setLoading(false);
        return;
      }

      const userEmail = data.user.email;

      if (!captchaToken) {
        setErrorMsg("Please complete the captcha verification.");
        setLoading(false);
        return;
      }

      console.log(oldPassword);

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: oldPassword,
        options: { captchaToken },
      });

      if (loginError) {
        setErrorMsg("Current password is incorrect");
        setLoading(false);
        hcaptchaRef.current?.resetCaptcha();
        return;
      }

      const { error: updatePassError } = await supabase.auth.updateUser({
        password: password,
        options: { captchaToken },
      });

      if (updatePassError) {
        console.log(updatePassError);
        setErrorMsg("Error updating your password");
        setLoading(false);
        return;
      }

      setErrorMsg("");
      setCaptchaToken(null);
      if (hcaptchaRef.current) {
        hcaptchaRef.current.resetCaptcha();
      }

      navigate("/profile");
    } catch (e) {
      console.log(e);
      setErrorMsg("Error: Could not update your password");
      setLoading(false);
    }
  }

  return (
    <>
      <Header></Header>
      <div id="mainContent">
        <MainSideBar id="mainSideBar" />
        <div id="dashboardCenterSection">
          <div id="profileCenterContent">
            <h2>Change Password</h2>
            <form
              className="loginForm"
              id="changePassForm"
              onSubmit={handleSubmit}
            >
              <div className="formGroup registerFormGroup">
                <label htmlFor="oldPassword">Old Password</label>
                <input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={`formInput ${
                    validationErrors.oldpass ? "borderRed" : ""
                  }`}
                />
                {validationErrors.oldpass && (
                  <p className="errorDisplayText">{validationErrors.oldpass}</p>
                )}
              </div>
              <div className="formGroup registerFormGroup">
                <label htmlFor="password">New Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`formInput ${
                    validationErrors.pass || validationErrors.passLength
                      ? "borderRed"
                      : ""
                  }`}
                />
                {validationErrors.pass && (
                  <p className="errorDisplayText">{validationErrors.pass}</p>
                )}
                {validationErrors.passLength && (
                  <p className="errorDisplayText">
                    {validationErrors.passLength}
                  </p>
                )}
              </div>

              <div className="formGroup registerFormGroup">
                <label htmlFor="password">Repeat New Password</label>
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
                size="invisible"
                onVerify={(token) => {
                  setCaptchaToken(token);
                  changePassword(token);
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
                {loading ? "Updating..." : "Update"}
              </button>
              {errorMsg != "" && (
                <div id="registrationResult" className="errorDisplayText">
                  {errorMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
