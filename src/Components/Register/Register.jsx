import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import './Register.css';
import { Link } from "react-router-dom";


import { registerAPICall } from '../../Services/register.service';
import { RegisterModel } from '../../Models/register.model';
import { RegisterErrorModel } from '../../Models/registererror.model';


import Logo from '../../Images/Logo.png';


// Gender master (update IDs to match backend)
const genderMap = {
  "Male": 1,
  "Female": 2,
  "Other": 3
};


const PATIENT_ROLE_ID = 3; // Set your correct Patient role id
const ACTIVE_STATUS_ID = 1; // Set your correct Active status id


const Register = () => {
  const [user, setUser] = useState(new RegisterModel());
  const [errors, setErrors] = useState(new RegisterErrorModel());
  const navigate = useNavigate();


  // Handles change for all fields, including mapping gender label to ID
  const changeUser = (event) => {
    const { name, value } = event.target;
    let curErrors = { ...errors };
    let curUser = { ...user, [name]: value };


    if (name === "gender") {
      curUser.genderID = genderMap[value] || "";
      curUser.gender = value;
      curErrors.gender = value ? "" : "Gender required";
    }


    switch (name) {
      case "username":
        curErrors.username = value ? "" : "Username cannot be empty";
        break;
      case "email":
        curErrors.email = value && !/\S+@\S+\.\S+/.test(value) ? "Invalid email address" : "";
        break;
      case "password":
        curErrors.password = value.length < 6 ? "Password must be at least 6 characters" : "";
        break;
      case "fullName":
        curErrors.fullName = value ? "" : "Full Name required";
        break;
      case "dob":
        curErrors.dob = value ? "" : "Date of Birth required";
        break;
      case "contactNumber":
        curErrors.contactNumber = value ? "" : "Contact Number required";
        break;
      case "address":
        curErrors.address = value ? "" : "Address required";
        break;
      default:
        break;
    }
    setUser(curUser);
    setErrors(curErrors);
  };


  const register = () => {
    for (const key in errors) {
      if (errors[key]) return;
    }
    // Only check visible fields from the form
    for (const key of ["fullName","dob","gender","bloodGroup","contactNumber","address","username","email","password"]) {
      if (!user[key]) {
        alert("Please fill all required fields.");
        return;
      }
    }
    // Payload: send only genderID, not label, with fixed role/status
    const payload = {
      fullName: user.fullName,
      dob: user.dob,
      genderID: user.genderID,
      bloodGroup: user.bloodGroup,
      contactNumber: user.contactNumber,
      address: user.address,
      username: user.username,
      email: user.email,
      password: user.password,
      roleID: PATIENT_ROLE_ID,
      statusID: ACTIVE_STATUS_ID
    };
    registerAPICall(payload)
      .then(() => {
        alert("Registration successful. Please login.");
        navigate("/login");
      })
      .catch(err => {
        alert(err.response?.data?.errorMessage || "Registration failed.");
      });
  };


  const cancel = () => {
    setUser(new RegisterModel());
    setErrors(new RegisterErrorModel());
  };


  return (
    <div className="login-wrapper d-flex ">
      {/* Left branding/info */}
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
      {/* Right form */}
      <div className="login-right d-flex justify-content-center align-items-center flex-grow-1">
        <div className="card shadow-lg login-card p-5" style={{ minWidth: "400px", maxWidth: "480px" }}>
          <div className="login-card-logo mb-3">
            <img src={Logo} alt="AmazeCare Logo" className="hospital-logo-login" />
            <h3 className="card-title login-title fw-bold mb-1">Register</h3>
          </div>
          <p className="register-description text-muted mb-4">Create your account to access the dashboard.</p>
          <form onSubmit={e => { e.preventDefault(); register(); }}>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Full Name</label>
              <input type="text" className={`form-control ${errors.fullName ? "is-invalid" : ""}`} name="fullName" value={user.fullName} onChange={changeUser} required />
              {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Date of Birth</label>
              <input type="date" className={`form-control ${errors.dob ? "is-invalid" : ""}`} name="dob" value={user.dob} onChange={changeUser} required />
              {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Gender</label>
              <select className={`form-control ${errors.gender ? "is-invalid" : ""}`} name="gender" value={user.gender} onChange={changeUser} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Blood Group</label>
              <select className="form-control" name="bloodGroup" value={user.bloodGroup} onChange={changeUser} required>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Contact Number</label>
              <input type="tel" className={`form-control ${errors.contactNumber ? "is-invalid" : ""}`} name="contactNumber" value={user.contactNumber} onChange={changeUser} required />
              {errors.contactNumber && <div className="invalid-feedback">{errors.contactNumber}</div>}
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Address</label>
              <input type="text" className={`form-control ${errors.address ? "is-invalid" : ""}`} name="address" value={user.address} onChange={changeUser} required />
              {errors.address && <div className="invalid-feedback">{errors.address}</div>}
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Username</label>
              <input type="text" className={`form-control ${errors.username ? "is-invalid" : ""}`} name="username" value={user.username} onChange={changeUser} required />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} name="email" value={user.email} onChange={changeUser} required />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold">Password</label>
              <input type="password" className={`form-control ${errors.password ? "is-invalid" : ""}`} name="password" value={user.password} onChange={changeUser} required />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            <div className="d-flex gap-3 mb-2">
              <button type="submit" className="btn btn-primary flex-grow-1">Register</button>
              <button type="button" className="btn btn-secondary flex-grow-1" onClick={cancel}>Cancel</button>
            </div>
          </form>
          <div className="register-link text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-primary fw-bold">Login</Link>
          </div>
          <div className="text-center mt-4 small text-muted">
            © 2025 AmazeCare Hospital | All Rights Reserved
          </div>
        </div>
      </div>
    </div>
  );
};


export default Register;




