import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaHome,
  FaFileMedical,
  FaPrescriptionBottleAlt,
  FaSignOutAlt,
  FaCreditCard,
  FaUserMd,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./PatientDashboard.css";

const PatientPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const token = sessionStorage.getItem("token");
  const patientID = Number(sessionStorage.getItem("patientID"));

  useEffect(() => {
    if (!patientID) {
      setFeedback({ type: "error", message: "Patient not authenticated." });
      return;
    }
    fetchMedicalRecords();
  }, [patientID]);

  const fetchMedicalRecords = () => {
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
        setMedicalRecords(patientRecords);
        fetchPrescriptions(patientRecords);
      })
      .catch((err) => {
        console.error(err);
        setFeedback({ type: "error", message: "Failed to fetch medical records." });
      });
  };

  const fetchPrescriptions = (records) => {
    setLoading(true);
    axios
      .get("http://localhost:5093/api/Prescription", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let data = res.data;
        if (data && data.$values) data = data.$values;

        const recordIDs = records.map((r) => r.recordID);

        const patientPrescriptions = Array.isArray(data)
          ? data.filter((presc) => recordIDs.includes(presc.recordID))
          : [];

        setPrescriptions(patientPrescriptions);
        fetchAllTests();
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFeedback({ type: "error", message: "Failed to fetch prescriptions." });
        setLoading(false);
      });
  };

  // Fetch all tests once
  const fetchAllTests = () => {
    axios
      .get("http://localhost:5093/api/RecommendedTest", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let data = res.data;
        if (data && data.$values) data = data.$values;
        setTests(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch tests:", err);
      });
  };

  // Helper: get test names for a prescriptionID
  const getTestsForPrescription = (prescriptionID) => {
    const matchedTests = tests.filter((test) => test.prescriptionID === prescriptionID);
    if (!matchedTests.length) return "None";
    return matchedTests.map((t) => t.testName || t.name || "Unnamed Test").join(", ");
  };

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100">
      <nav className="admin-sidebar d-flex flex-column p-3">
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
            <Link to="/patient/prescriptions" className="nav-link active">
              <FaPrescriptionBottleAlt className="me-2" />
              Prescriptions
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/billings" className="nav-link">
              <FaCreditCard className="me-2" />
              Billing
            </Link>
          </li>
        </ul>
      </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Prescriptions</h2>
          <div className="d-flex align-items-center gap-3">
            <FaBell size={24} className="text-secondary cursor-pointer" title="Notifications" />
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" />
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
          <div>Loading prescriptions...</div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table className="table table-striped" style={{ minWidth: "1000px", width: "100%" }}>
              <thead style={{ backgroundColor: "blue", color: "white" }}>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Prescription ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Record ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Medicine Name</th>
                  <th style={{ whiteSpace: "nowrap" }}>Pattern Code</th>
                  <th style={{ whiteSpace: "nowrap" }}>Dosage Timing</th>
                  <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                  <th style={{ whiteSpace: "nowrap" }}>Days</th>
                  <th style={{ whiteSpace: "nowrap" }}>Notes</th>
                  <th style={{ whiteSpace: "nowrap" }}>Prescribed Date</th>
                  <th style={{ whiteSpace: "nowrap" }}>Tests</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center">
                      No prescriptions found.
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((presc) => (
                    <tr key={presc.prescriptionID}>
                      <td style={{ whiteSpace: "nowrap" }}>{presc.prescriptionID}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{presc.recordID}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{presc.medicineName}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{presc.patternCode}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{presc.dosageTiming}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{presc.quantity}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{presc.days}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{presc.notes || "N/A"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {new Date(presc.prescribedDate).toLocaleDateString()}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {getTestsForPrescription(presc.prescriptionID)}
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

export default PatientPrescriptions;
