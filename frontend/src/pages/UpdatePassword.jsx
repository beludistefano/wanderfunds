import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

import "../css/login.css";
import Header from "../components/header";

function validateUpdate(pass, repPass) {
  const registrationErrors = {};

  if (pass == "") {
    registrationErrors.pass = "Password cannot be empty";
  }

  if (pass.length < 8) {
    registrationErrors.passLength = "Password must have at least 8 characters";
  }

  if (repPass == "") {
    registrationErrors.repPass = "You must repeat your password";
  }

  if (pass !== repPass) {
    registrationErrors.match = "Passwords don't match";
  }

  return registrationErrors;
}

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    setValidationErrors({});

    const updateValidation = validateUpdate(password, repeatPassword);
    setValidationErrors(updateValidation);

    if (Object.keys(updateValidation).length != 0) {
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      } else {
        setErrorMsg("");
      }
      navigate("/");
    } catch (e) {
      console.log(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="centralDiv">
      <Header></Header>
      <div id="registerMainContent">
        <h2>Update Password</h2>
        <form
          className="loginForm"
          id="registrationForm"
          onSubmit={handleSubmit}
        >
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
              <p className="errorDisplayText">{validationErrors.passLength}</p>
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
  );
}
