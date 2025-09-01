import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserMd, FaUsers, FaCalendarAlt, FaFileAlt, FaFileMedical,
  FaVial, FaMoneyBillWave, FaClock, FaBell, FaUserCircle, FaSignOutAlt,FaCog
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Logo from '../../../Images/Logo.png';

const masterTests = [
  { testID: 1, testName: "Blood Test", price: 300.00, instructions: "Fasting recommended for accurate results" },
  { testID: 2, testName: "X-Ray", price: 500.00, instructions: "Remove any metal objects before test" },
  { testID: 3, testName: "MRI", price: 2500.00, instructions: "Inform technician if you have metal implants" },
  { testID: 4, testName: "ECG", price: 400.00, instructions: "Stay still and relaxed during the procedure" },
  { testID: 5, testName: "CT Scan", price: 2000.00, instructions: "Contrast dye may be used" },
  { testID: 6, testName: "Urine Test", price: 100.00, instructions: "Use the first morning sample" },
  { testID: 7, testName: "Liver Function Test", price: 800.00, instructions: "Avoid alcohol 24 hours before test" },
  { testID: 8, testName: "Thyroid Test", price: 600.00, instructions: "No special preparation needed" },
];

const AdminRecommendedTests = () => {
  const navigate = useNavigate();
  const [recommendedTests, setRecommendedTests] = useState([]);
  const [formData, setFormData] = useState({ prescriptionID: "", testID: "" });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const token = sessionStorage.getItem("token");

  const fetchRecommendedTests = () => {
    setLoading(true);
    axios.get("http://localhost:5093/api/RecommendedTest", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setRecommendedTests(res.data?.["$values"] || res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setFeedback({ type: "error", message: "Failed to load recommended tests." });
      });
  };

  useEffect(() => {
    fetchRecommendedTests();
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
    axios.post("http://localhost:5093/api/RecommendedTest", formData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        fetchRecommendedTests();
        setFormData({ prescriptionID: "", testID: "" });
        setFeedback({ type: "success", message: "Recommended test added." });
        setActivePanel(null);
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: "error", message: "Failed to add recommended test." });
        setLoading(false);
      });
  };

const cancelAdd = () => {
    setActivePanel(null);
    setFormData({
      prescriptionID:"",
      testID:""
    });
    setFeedback(null);
  };

  const getTestDetails = (testID) => {
    return masterTests.find((test) => test.testID === Number(testID)) || {};
  };

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
      <nav className="admin-sidebar d-flex flex-column p-3">
        <div className="sidebar-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h3 className="mb-4">AmazeCare Admin</h3>
        <ul className="nav flex-column ">
          <li className="nav-item mb-2" >
            <Link to="/admin-dashboard" className="nav-link active">
              <FaFileAlt className="me-2" /> Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/doctors" className="nav-link">
              <FaUserMd className="me-2" /> Doctors
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/patients" className="nav-link">
              <FaUsers className="me-2" /> Patients
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/appointments" className="nav-link">
              <FaCalendarAlt className="me-2" /> Appointments
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/settings" className="nav-link">
              <FaCog className="me-2" /> Settings
            </Link>
          </li>
        </ul>
      </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Tests</h2>
          <div className="d-flex align-items-center gap-3">
            <FaBell size={24} className="text-secondary cursor-pointer" title="Notifications" />
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" />
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              disabled={loading}
              onClick={() => navigate("/login")}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

            <button type="submit" disabled={loading} className="btn btn-primary me-2">
              Add Recommended Test
            </button>
            <button type="button" onClick={cancelAdd} disabled={loading} className="btn btn-secondary">
                Cancel
              </button>
          </form>
        )}

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Recommended Test ID</th>
              <th>Prescription ID</th>
              <th>Test ID</th>
              <th>Test Name</th>
              <th>Price</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {recommendedTests.length === 0 && !loading ? (
              <tr>
                <td colSpan="6">No recommended tests found.</td>
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
                    <td>{details.price}</td>
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

export default AdminRecommendedTests;
