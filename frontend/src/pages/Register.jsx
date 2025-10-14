import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

import "../css/login.css";
import Header from "../components/header";

function validateRegistration(name, email, pass, repPass) {
  const registrationErrors = {};

  if (name == "") {
    registrationErrors.name = "Name cannot be empty";
  }

  if (email == "") {
    registrationErrors.email = "Email cannot be empty";
  }

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

export default function Register() {
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
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
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: userEmail,
      password: password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      console.log(error.message);
    } else {
      navigate("/login");
    }
  }

  return (
    <div id="centralDiv">
      <Header></Header>
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

          <button type="submit" className="loginButton">
            Register
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
