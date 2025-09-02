import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserCircle,
  FaVials,
  FaUserInjured,
  FaCalendarAlt,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaCreditCard,FaBell
} from "react-icons/fa";
import "./DoctorDashboard.css";


const masterTests = [
  { testID: 1, testName: "Blood Test", price: 300.0, instructions: "Fasting recommended for accurate results" },
  { testID: 2, testName: "X-Ray", price: 500.0, instructions: "Remove any metal objects before test" },
  { testID: 3, testName: "MRI", price: 2500.0, instructions: "Inform technician if you have metal implants" },
  { testID: 4, testName: "ECG", price: 400.0, instructions: "Stay still and relaxed during the procedure" },
  { testID: 5, testName: "CT Scan", price: 2000.0, instructions: "Contrast dye may be used" },
  { testID: 6, testName: "Urine Test", price: 100.0, instructions: "Use the first morning sample" },
  { testID: 7, testName: "Liver Function Test", price: 800.0, instructions: "Avoid alcohol 24 hours before test" },
  { testID: 8, testName: "Thyroid Test", price: 600.0, instructions: "No special preparation needed" },
];

const DoctorTests = () => {
  const navigate = useNavigate();

  const [recommendedTests, setRecommendedTests] = useState([]);
  const [formData, setFormData] = useState({ prescriptionID: "", testID: "" });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activePanel, setActivePanel] = useState(null);

  const token = sessionStorage.getItem("token");
  const doctorId = sessionStorage.getItem("doctorID");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recTestsRes, presRes, recRes] = await Promise.all([
        axios.get("http://localhost:5093/api/RecommendedTest", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5093/api/Prescription", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5093/api/MedicalRecord", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const allRecommendedTests = recTestsRes.data?.["$values"] || recTestsRes.data || [];
      const allPrescriptions = presRes.data?.["$values"] || presRes.data || [];
      const allRecords = recRes.data?.["$values"] || recRes.data || [];

      const doctorRecords = allRecords.filter(
        (r) => r.doctorID && r.doctorID.toString() === doctorId.toString()
      );
      const doctorRecordIDs = doctorRecords.map((r) => r.recordID);
      const doctorPrescriptions = allPrescriptions.filter((p) => doctorRecordIDs.includes(p.recordID));
      const doctorPrescriptionIDs = doctorPrescriptions.map((p) => p.prescriptionID);

      const doctorRecTests = allRecommendedTests.filter((rt) =>
        doctorPrescriptionIDs.includes(rt.prescriptionID)
      );

      setRecommendedTests(doctorRecTests);
    } catch (error) {
      setFeedback({ type: "error", message: "Failed to fetch data." });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (!formData.prescriptionID || !formData.testID) {
      setFeedback({ type: "error", message: "Both Prescription ID and Test must be selected." });
      return;
    }
    setLoading(true);
    axios
      .post("http://localhost:5093/api/RecommendedTest", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchData();
        setFormData({ prescriptionID: "", testID: "" });
        setFeedback({ type: "success", message: "Test added." });
        setActivePanel(null);
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: "error", message: "Failed to add test." });
        setLoading(false);
      });
  };

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const getTestDetails = (testID) => {
    return masterTests.find((test) => test.testID === Number(testID)) || {};
  };

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
            <nav className="admin-sidebar d-flex flex-column p-3">
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
              <Link to="/doctor/prescriptions" className="nav-link">
                <FaPrescriptionBottleAlt className="me-2" /> Prescriptions
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/doctor/tests" className="nav-link active">
                <FaVials className="me-2" /> Tests
              </Link>
            </li>
              </ul>
            </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-3">
          <h2>Tests</h2>
          <div className="d-flex align-items-center gap-3">
                    <FaBell size={22} className="icon-hover text-secondary" title="Notifications" />
            
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" />
            <button className="btn btn-outline-danger" onClick={logout} disabled={loading}>
              Logout
            </button>
          </div>
        </header>

        <div className="d-flex justify-content-end mb-3">
          <button
            className={`btn btn-outline-success${activePanel === "add" ? " active" : ""}`}
            onClick={() => setActivePanel(activePanel === "add" ? null : "add")}
            disabled={loading}
            type="button"
          >
            {activePanel === "add" ? "Close" : "Add Test"}
          </button>
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        {activePanel === "add" && (
        <form onSubmit={submitForm} className="mb-4" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <input
            type="number"
            name="prescriptionID"
            placeholder="Prescription ID"
            value={formData.prescriptionID}
            onChange={handleInputChange}
            disabled={loading}
            required
            className="form-control mb-2"
            />

            <select
            name="testID"
            value={formData.testID}
            onChange={handleInputChange}
            disabled={loading}
            required
            className="form-control mb-2"
            >
            <option value="">Select Test</option>
            {masterTests.map((test) => (
                <option key={test.testID} value={test.testID}>
                {test.testName}
                </option>
            ))}
            </select>

            <div>
            <button type="submit" disabled={loading} className="btn btn-primary me-2">
                Add Test
            </button>
            <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                setActivePanel(null);
                setFormData({ prescriptionID: "", testID: "" });
                setFeedback(null);
                }}
                disabled={loading}
            >
                Cancel
            </button>
            </div>
        </form>
        )}


          <table className="table appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Prescription ID</th>
              <th>Test ID</th>
              <th>Test Name</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {recommendedTests.length === 0 && !loading ? (
              <tr>
                <td colSpan="6">No tests found.</td>
              </tr>
            ) : (
              recommendedTests.map((rt) => {
                const details = getTestDetails(rt.testID);
                return (
                  <tr key={rt.recommendedTestID}>
                    <td>{rt.recommendedTestID}</td>
                    <td>{rt.prescriptionID}</td>
                    <td>{rt.testID}</td>
                    <td>{details.testName || rt.testName}</td>
                    <td>{details.instructions}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default DoctorTests;
