import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaHome,
  FaFileMedical,
  FaSignOutAlt,
  FaPrescriptionBottleAlt,
  FaCreditCard,
  FaUserMd,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import Logo from '../../../Images/Logo.png';
import { Link, useNavigate } from "react-router-dom";
import "./PatientDashboard.css"; 

const PatientRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const token = sessionStorage.getItem("token");
  const patientID = Number(sessionStorage.getItem("patientID"));

  useEffect(() => {
    if (!patientID) {
      setFeedback({ type: "error", message: "Patient not authenticated." });
      return;
    }
    fetchDoctors();
    fetchMedicalRecords();
  }, [patientID]);

  const fetchDoctors = () => {
    axios
      .get("http://localhost:5093/api/Doctor", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const docs = res.data?.$values || res.data || [];
        setDoctors(docs);
      })
      .catch((err) => {
        console.error("Failed to fetch doctors:", err);
      });
  };

  const fetchMedicalRecords = () => {
    setLoading(true);
    axios
      .get("http://localhost:5093/api/MedicalRecord", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let data = res.data;
        if (data && data.$values) data = data.$values;

        const patientRecords = Array.isArray(data)
          ? data.filter((record) => Number(record.patientID) === patientID)
          : [];

        setRecords(patientRecords);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFeedback({ type: "error", message: "Failed to fetch medical records." });
        setLoading(false);
      });
  };

  const getDoctorName = (doctorID) => {
    const doctor = doctors.find((doc) => doc.doctorID === doctorID);
    return doctor ? doctor.name : "N/A";
  };

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100">
      <nav className="admin-sidebar d-flex flex-column p-3">
        <div className="sidebar-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h3 className="mb-4">AmazeCare Patient</h3>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/patient-dashboard" className="nav-link">
              <FaHome className="me-2" /> Overview
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/doctors" className="nav-link">
              <FaUserMd className="me-2" /> Doctors
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              to="/patient/records"
              className="nav-link active"
              style={{ whiteSpace: "nowrap" }}
            >
              <FaFileMedical className="me-2" /> Medical Records
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/prescriptions" className="nav-link">
              <FaPrescriptionBottleAlt className="me-2" /> Prescriptions
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/billings" className="nav-link">
              <FaCreditCard className="me-2" /> Billing
            </Link>
          </li>
        </ul>
      </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Medical Records</h2>
          <div className="d-flex align-items-center gap-3">
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" onClick={() => navigate("/profile")}/>
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={() => {
                sessionStorage.clear();
                navigate("/login");
              }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        {feedback && (
          <div className={`alert ${feedback.type === "error" ? "alert-danger" : "alert-info"}`}>
            {feedback.message}
          </div>
        )}

        {loading ? (
          <div>Loading medical records...</div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="table appointments-table"
              style={{ minWidth: "1200px", tableLayout: "auto", width: "100%" }}
            >
              <thead style={{ backgroundColor: "blue", color: "white" }}>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Appointment ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Doctor Name</th>
                  <th style={{ whiteSpace: "nowrap" }}>Symptoms</th>
                  <th style={{ whiteSpace: "nowrap" }}>Physical Examination</th>
                  <th style={{ whiteSpace: "nowrap" }}>Treatment Plan</th>
                  <th style={{ whiteSpace: "nowrap" }}>Diagnosis</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No medical records found.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.recordID}>
                      <td style={{ whiteSpace: "nowrap" }}>{record.recordID}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{record.appointmentID}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{getDoctorName(record.doctorID)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{record.symptoms}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{record.physicalExamination}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{record.treatmentPlan}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{record.diagnosis}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientRecords;
