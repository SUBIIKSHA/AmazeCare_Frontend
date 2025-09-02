import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaVials,
  FaCreditCard,
  FaUserCircle,FaBell
} from "react-icons/fa";
import "./DoctorDashboard.css";
import Logo from '../../../Images/Logo.png';

const patternOptions = [
  { id: 1, code: "1-0-0", timing: "BF" },
  { id: 2, code: "0-1-0", timing: "AF" },
  { id: 3, code: "0-0-1", timing: "BF" },
  { id: 4, code: "1-1-0", timing: "AF" },
  { id: 5, code: "1-1-1", timing: "AF" },
  { id: 6, code: "0-1-1", timing: "BF" },
];

const DoctorPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [tests, setTests] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [formData, setFormData] = useState({
    recordID: "",
    medicineID: "",
    patternID: "",
    quantity: "",
    days: 365,
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const token = sessionStorage.getItem("token");
  const doctorId = sessionStorage.getItem("doctorID");

  useEffect(() => {
  fetchPrescriptionsAndRecords();
  fetchAllTests();
}, []);


  const fetchPrescriptionsAndRecords = async () => {
  setLoading(true);
  try {
    const [presRes, recRes] = await Promise.all([
      axios.get("http://localhost:5093/api/Prescription", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5093/api/MedicalRecord", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const allPrescriptions = presRes.data?.["$values"] || presRes.data || [];
    const allRecords = recRes.data?.["$values"] || recRes.data || [];
    const doctorRecords = allRecords.filter((r) => r.doctorID && r.doctorID.toString() === doctorId.toString());
    const doctorRecordIDs = doctorRecords.map((r) => r.recordID);
    const doctorPrescriptions = allPrescriptions.filter((p) => doctorRecordIDs.includes(p.recordID));

    setPrescriptions(doctorPrescriptions);
  } catch (error) {
    setFeedback({ type: "error", message: "Failed to fetch prescriptions or records." });
    console.error(error);
  } finally {
    setLoading(false);
  }
};


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

  const getTestsForPrescription = (prescriptionID) => {
    const matchedTests = tests.filter((t) => t.prescriptionID === prescriptionID);
    if (!matchedTests.length) return "None";
    return matchedTests.map((t) => t.testName || t.name || "Unnamed Test").join(", ");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (!formData.patternID) {
      setFeedback({ type: "error", message: "Please select a pattern." });
      return;
    }
    setLoading(true);
    axios
      .post("http://localhost:5093/api/Prescription", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchPrescriptionsAndRecords();
        setActivePanel(null);
        setFormData({
          recordID: "",
          medicineID: "",
          patternID: "",
          quantity: "",
          days: 365,
          notes: "",
        });
        setFeedback({ type: "success", message: "Prescription added successfully." });
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: "error", message: "Failed to add prescription." });
        setLoading(false);
      });
  };
 const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };
  const cancelAdd = () => {
    setActivePanel(null);
    setFormData({
      recordID: "",
      medicineID: "",
      patternID: "",
      quantity: "",
      days: 365,
      notes: "",
    });
    setFeedback(null);
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
              <Link to="/doctor/patients" className="nav-link">
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
          <Link to="/doctor/prescriptions" className="nav-link active">
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
  
        <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
          <header className="d-flex justify-content-between align-items-center mb-4">
            <h2>Prescriptions</h2>
            <div className="d-flex align-items-center gap-3">
              <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" onClick={() => navigate("/profile")}/>
              <button className="btn btn-outline-danger" disabled={loading} onClick={logout}>
                Logout
              </button>
            </div>
          </header>
            <div className="d-flex justify-content-end mb-3 gap-2 flex-wrap">
                <button
                className={`btn btn-outline-success${activePanel === "add" ? " active" : ""}`}
                onClick={() => setActivePanel(activePanel === "add" ? null : "add")}
                disabled={loading}
                type="button"
            >
                {activePanel === "add" ? "Close Add Form" : "Add Prescription"}
            </button>
            </div>

        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        {activePanel === "add" && (
          <form onSubmit={submitForm} className="prescription-form mb-4">
            <input
              type="number"
              name="recordID"
              placeholder="Record ID"
              value={formData.recordID}
              onChange={handleInputChange}
              disabled={loading}
              required
              className="form-control mb-2"
            />
            <input
              type="number"
              name="medicineID"
              placeholder="Medicine ID"
              value={formData.medicineID}
              onChange={handleInputChange}
              disabled={loading}
              required
              className="form-control mb-2"
            />
            <select
              name="patternID"
              value={formData.patternID}
              onChange={handleInputChange}
              disabled={loading}
              required
              className="form-control mb-2"
            >
              <option value="">Select Pattern</option>
              {patternOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.id} - ({opt.code}) - {opt.timing}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
            />
            <input
              type="number"
              name="days"
              placeholder="Days"
              value={formData.days}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
            />
            <textarea
              name="notes"
              placeholder="Notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
            />
            <div>
              <button type="submit" disabled={loading} className="btn btn-primary me-2">
                Add Prescription
              </button>
              <button type="button" onClick={cancelAdd} disabled={loading} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="prescription-list">
          {loading && <p>Loading prescriptions...</p>}
          <table className="table appointments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>RecordID</th>
                <th>Medicine Name</th>
                <th>Pattern Code</th>
                <th>Dosage Timing</th>
                <th>Quantity</th>
                <th>Days</th>
                <th>Notes</th>
                <th>Tests</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 && !loading ? (
                <tr>
                  <td colSpan="9">No prescriptions found.</td>
                </tr>
              ) : (
                prescriptions.map((rx) => (
                  <tr key={rx.prescriptionID}>
                    <td>{rx.prescriptionID}</td>
                    <td>{rx.recordID}</td>
                    <td>{rx.medicineName}</td>
                    <td>{rx.patternCode}</td>
                    <td>{rx.dosageTiming}</td>
                    <td>{rx.quantity}</td>
                    <td>{rx.days}</td>
                    <td>{rx.notes}</td>
                    <td>{getTestsForPrescription(rx.prescriptionID)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DoctorPrescriptions;
