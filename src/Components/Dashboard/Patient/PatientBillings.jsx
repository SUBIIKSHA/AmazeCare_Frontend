import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaHome,
  FaFileMedical,
  FaPrescriptionBottleAlt,
  FaCreditCard,
  FaUserMd,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import Logo from '../../../Images/Logo.png';
import { Link, useNavigate } from "react-router-dom";
import "./PatientDashboard.css";

const PatientBillings = () => {
  const navigate = useNavigate();
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const token = sessionStorage.getItem("token");
  const patientID = Number(sessionStorage.getItem("patientID"));

  useEffect(() => {
    if (!patientID) {
      setFeedback({ type: "error", message: "Patient not authenticated." });
      return;
    }
    fetchBillings();
  }, [patientID]);

  const fetchBillings = () => {
    setLoading(true);
    axios
      .get("http://localhost:5093/api/Billing", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let data = res.data;
        if (data && data.$values) data = data.$values;

        const patientBillings = Array.isArray(data)
          ? data.filter((bill) => Number(bill.patientID) === patientID)
          : [];

        setBillings(patientBillings);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFeedback({ type: "error", message: "Failed to fetch billings." });
        setLoading(false);
      });
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
              <FaHome className="me-2" />
              Overview
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/doctors" className="nav-link">
              <FaUserMd className="me-2" />
              Doctors
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/records" className="nav-link">
              <FaFileMedical className="me-2" />
              Medical Records
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/prescriptions" className="nav-link">
              <FaPrescriptionBottleAlt className="me-2" />
              Prescriptions
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/billings" className="nav-link active">
              <FaCreditCard className="me-2" />
              Billing
            </Link>
          </li>
        </ul>
      </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Billing</h2>
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
          <div>Loading billing information...</div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%" }}>
              <table className="table appointments-table" style={{ minWidth: "800px", width: "100%" }}>
              <thead style={{ backgroundColor: "blue", color: "white" }}>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Billing ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Appointment ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Total Amount</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap" }}>Billing Date</th>
                </tr>
              </thead>
              <tbody>
                {billings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No billing records found.
                    </td>
                  </tr>
                ) : (
                  billings.map((bill) => (
                    <tr key={bill.billingID}>
                      <td style={{ whiteSpace: "nowrap" }}>{bill.billingID}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{bill.appointmentID}</td>
                      <td style={{ whiteSpace: "nowrap" }}>${bill.totalAmount}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{bill.statusName}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {new Date(bill.billingDate).toLocaleDateString()}
                      </td>
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

export default PatientBillings;
