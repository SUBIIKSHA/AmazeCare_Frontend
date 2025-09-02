import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaVials,
  FaCreditCard,
  FaUserCircle,
  FaBell
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";
import Logo from '../../../Images/Logo.png';


function DoctorPatients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const token = sessionStorage.getItem("token");
  const doctorId = sessionStorage.getItem("doctorID");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5093/api/Patient/byDoctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = res.data?.["$values"] || res.data || [];
        console.log(list);
        setPatients(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFeedback({ type: "error", message: "Failed to fetch patients." });
        setLoading(false);
      });
  };

  const onSearch = () => {
    if (!searchTerm.trim()) {
      fetchPatients();
      setFeedback(null);
      return;
    }
    setLoading(true);
    axios
      .post(
        "http://localhost:5093/api/Patient/search",
        {
          fullName: searchTerm,
          doctorID: Number(doctorId),
          statusIds: [1], 
          pageNumber: 1,
          pageSize: 100,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const list = res.data?.patients?.["$values"] || res.data?.patients || [];
        console.log(list);
        setPatients(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFeedback({ type: "error", message: "Search failed." });
        setLoading(false);
      });
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFeedback(null);
    fetchPatients();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
      <nav className="admin-sidebar d-flex flex-column p-3">
        <div className="sidebar-logo">
        <img src={Logo} alt="Logo" />
      </div>
        <h3 className="mb-4">AmazeCare Doctor</h3>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/doctor-dashboard" className="nav-link">
              <FaHome className="me-2" /> Overview
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/doctor/patients" className="nav-link active">
              <FaUserInjured className="me-2" /> Patients
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/doctor/appointments" className="nav-link">
              <FaCalendarAlt className="me-2" /> Appointments
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/doctor/records" className="nav-link">
              <FaNotesMedical className="me-2" /> Medical Records
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/doctor/prescriptions" className="nav-link">
              <FaPrescriptionBottleAlt className="me-2" /> Prescriptions
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/doctor/tests" className="nav-link">
              <FaVials className="me-2" /> Tests
            </Link>
          </li>
        </ul>
      </nav>

      <div className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Patients</h2>
          <div className="d-flex align-items-center gap-3">
            <FaUserCircle
              size={24}
              className="text-secondary cursor-pointer"
              title="Profile"
              onClick={() => navigate("/profile")}
            />
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="d-flex align-items-center mb-3 gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            className="form-control w-50"
            style={{ minWidth: 250 }}
          />
          <button onClick={onSearch} disabled={loading} className="btn btn-primary">
            Search
          </button>
          <button onClick={clearSearch} disabled={loading} className="btn btn-secondary">
            Clear
          </button>
        </div>
        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

          <table className="table appointments-table">
          <thead style={{ backgroundColor: "#cce2ff", color: "#0049b7" }}>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 && !loading ? (
              <tr>
                <td colSpan={6}>No patients found.</td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.patientID}>
                  <td>{patient.patientID}</td>
                  <td>{patient.fullName}</td>
                  <td>{patient.dob ? patient.dob.split("T")[0] : ""}</td>
                  <td>{patient.genderName || patient.genderID}</td>
                  <td>{patient.contactNumber || "-"}</td>
                  <td>{patient.address || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DoctorPatients;
