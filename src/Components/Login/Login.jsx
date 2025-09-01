import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

import { loginAPICall } from '../../Services/login.service';
import { LoginModel } from '../../Models/login.model';
import { LoginErrorModel } from '../../Models/loginerror.model';

import Logo from '../../Images/Logo.png';

const Login = () => {
  const [user, setUser] = useState(new LoginModel());
  const [errors, setErrors] = useState(new LoginErrorModel());
  const navigate = useNavigate();

  const changeUser = (event) => {
    const fieldName = event.target.name;
    const value = event.target.value;

    switch (fieldName) {
      case "username":
        if (value === "") {
          setErrors((e) => ({ ...e, username: "Username cannot be empty" }));
        } else {
          setUser((u) => ({ ...u, username: value }));
          setErrors((e) => ({ ...e, username: "" }));
        }
        break;
      case "password":
        setUser((u) => ({ ...u, password: value }));
        break;
      default:
        break;
    }
  };

  const login = () => {
    if (errors.username?.length > 0 || errors.password?.length > 0) return;

    loginAPICall(user)
      .then((result) => {
        const { token, role, username, patientID, doctorID } = result.data;

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("role", role.toLowerCase());
        sessionStorage.setItem("username", username);
        if (patientID) sessionStorage.setItem("patientID", patientID);
        if (doctorID) sessionStorage.setItem("doctorID", doctorID);

        alert("Login success");

        switch (role.toLowerCase()) {
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "doctor":
            navigate("/doctor-dashboard");
            break;
          case "patient":
            navigate("/patient-dashboard");
            break;
          default:
            alert("Unknown role. Please contact support.");
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response?.status === 401) {
          alert(err.response.data.errorMessage);
        } else {
          alert("Login failed. Please try again.");
        }
      });
  };

  const cancel = () => {
    setUser(new LoginModel());
    setErrors(new LoginErrorModel());
  };

  return (
    <div className="login-wrapper d-flex vh-100">
      <div className="login-left d-flex flex-column justify-content-center align-items-start text-white px-5">
        <div className="hospital-brand mb-4 d-flex align-items-center">
          <img src={Logo} alt="AmazeCare Logo" className="hospital-logo me-3" />
          <h1 className="fw-bold">AmazeCare Hospital</h1>
        </div>
        <p className="lead mb-4">
          Compassionate care, modern technology, and trusted expertise—serving our community with excellence.
        </p>
        <ul className="hospital-points mb-5">
          <li>✔ 24/7 Advanced Emergency</li>
          <li>✔ Multi-specialty Diagnostics</li>
          <li>✔ Skilled Medical Professionals</li>
        </ul>
      </div>
      <div className="login-right d-flex justify-content-center align-items-center flex-grow-1">
        <div className="card shadow-lg login-card p-5">
          <div className="login-card-logo mb-3">
            <img src={Logo} alt="AmazeCare Logo" className="hospital-logo-login" />
            <h3 className="card-title login-title fw-bold mb-1">Login</h3>
          </div>
          <p className="text-muted mb-4">Sign in to access your dashboard.</p>
          <form onSubmit={(e) => { e.preventDefault(); login(); }}>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Username</label>
              <input
                type="text"
                className={`form-control ${errors.username ? "is-invalid" : ""}`}
                name="username"
                value={user.username}
                onChange={changeUser}
                placeholder="Enter your username"
                required
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={user.password}
                onChange={changeUser}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="d-flex justify-content-end align-items-center mb-3">
              <a href="#" className="text-decoration-none text-primary">Forgot Password?</a>
            </div>
            <div className="d-flex gap-3">
              <button type="submit" className="btn btn-primary flex-grow-1">Login</button>
              <button type="button" className="btn btn-secondary flex-grow-1" onClick={cancel}>Cancel</button>
            </div>
          </form>
          <div className="register-link text-center mt-4">
            <span className="text-muted">Don’t have an account? </span>
            <Link to="/register" className="text-primary fw-bold">Register</Link>
          </div>
          <div className="text-center mt-4 small text-muted">
            © 2025 AmazeCare Hospital | All Rights Reserved
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
