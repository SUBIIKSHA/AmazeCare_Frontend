import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";import {
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaVials,
  FaCreditCard,
  FaUserCircle,
  FaEdit,FaTrash,FaBell
} from "react-icons/fa";
import "./DoctorDashboard.css";
import Logo from '../../../Images/Logo.png';

const DoctorRecords = () => {
      const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [formMode, setFormMode] = useState("add");
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    patientID: "",
    appointmentID: "",
    symptoms: "",
    physicalExamination: "",
    treatmentPlan: "",
    diagnosis: "",
    createdAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const token = sessionStorage.getItem("token");
  const doctorId = sessionStorage.getItem("doctorID");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = () => {
  setLoading(true);
  axios
    .get("http://localhost:5093/api/MedicalRecord", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const allRecords = res.data || [];
      const doctorRecords = allRecords.filter(
        (record) => record.doctorID && record.doctorID.toString() === doctorId
      );
      setRecords(doctorRecords);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
      setFeedback({ type: "error", message: "Failed to fetch records." });
    });
};

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEdit = (record) => {
    setFormMode("edit");
    setEditingRecord(record);
    setFormData({
      appointmentID: record.appointmentID || "",
      symptoms: record.symptoms || "",
      physicalExamination: record.physicalExamination || "",
      treatmentPlan: record.treatmentPlan || "",
      diagnosis: record.diagnosis || "",
      createdAt: record.createdAt ? record.createdAt.slice(0, 10) : "",
    });
    setActivePanel("add");
    setFeedback(null);
  };

  const cancelEdit = () => {
    setFormMode("add");
    setEditingRecord(null);
    setFormData({
      appointmentID: "",
      symptoms: "",
      physicalExamination: "",
      treatmentPlan: "",
      diagnosis: "",
      createdAt: "",
    });
    setActivePanel(null);
    setFeedback(null);
  };
 const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };
  const submitForm = (e) => {
    e.preventDefault();
    setLoading(true);
    const submitData = { ...formData, doctorID: doctorId };

    if (formMode === "add") {
      axios
        .post("http://localhost:5093/api/MedicalRecord", submitData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchRecords();
          cancelEdit();
          setFeedback({ type: "success", message: "Medical record added successfully." });
          setLoading(false);
        })
        .catch(() => {
          setFeedback({ type: "error", message: "Failed to add medical record." });
          setLoading(false);
        });
    } else if (formMode === "edit") {
      axios
        .put(`http://localhost:5093/api/MedicalRecord/${editingRecord.recordID}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchRecords();
          cancelEdit();
          setFeedback({ type: "success", message: "Medical record updated successfully." });
          setLoading(false);
        })
        .catch(() => {
          setFeedback({ type: "error", message: "Failed to update medical record." });
          setLoading(false);
        });
    }
  };

  const deleteRecord = (id) => {
    if (window.confirm("Are you sure you want to deactivate this medical record?")) {
      setLoading(true);
      axios
        .delete(`http://localhost:5093/api/MedicalRecord/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchRecords();
          setFeedback({ type: "success", message: "Record deactivated successfully." });
          setLoading(false);
        })
        .catch(() => {
          setFeedback({ type: "error", message: "Failed to deactivate record." });
          setLoading(false);
        });
    }
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
      <Link to="/doctor/records" className="nav-link active">
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
<main className="admin-main-content flex-grow-1 p-4 overflow-auto">
  <header className="mb-4">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h2>My Medical Records</h2>
      <div className="d-flex align-items-center gap-3">
        <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" onClick={() => navigate("/profile")}/>
        <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
    </header>

    <div className="d-flex justify-content-end mb-3 gap-2 flex-wrap">
      <button
        className={`btn btn-outline-success${activePanel === "add" ? " active" : ""}`}
        onClick={() => setActivePanel(activePanel === "add" ? null : "add")}
        disabled={loading}
        type="button"
      >
        {formMode === "add" ? "Add Record" : "Edit Record"}
      </button>
    </div>


        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        {activePanel === "add" && (
          <form onSubmit={submitForm} className="medical-record-form mb-4">
            <h3>{formMode === "add" ? "Add Medical Record" : "Edit Medical Record"}</h3>
            <input
              type="number"
              name="appointmentID"
              placeholder="Appointment ID"
              value={formData.appointmentID}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
            />
            <input
              type="text"
              name="symptoms"
              placeholder="Symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
            />
            <input
              type="text"
              name="physicalExamination"
              placeholder="Physical Examination"
              value={formData.physicalExamination}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
            />
            <input
              type="text"
              name="treatmentPlan"
              placeholder="Treatment Plan"
              value={formData.treatmentPlan}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
            />
            <input
              type="text"
              name="diagnosis"
              placeholder="Diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
            />
            <div>
              <button type="submit" disabled={loading} className="btn btn-primary me-2">
                {formMode === "add" ? "Add Record" : "Update Record"}
              </button>
              {(formMode === "edit" || formMode === "add") && !loading && (
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="medical-record-list">
          {loading && <p>Loading records...</p>}
          <table className="table appointments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>AppointmentID</th>
                <th>PatientID</th>
                <th>Symptoms</th>
                <th>PhysicalExamination</th>
                <th>TreatmentPlan</th>
                <th>Diagnosis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.recordID}>
                  <td>{record.recordID}</td>
                  <td>{record.appointmentID}</td>
                  <td>{record.patientID}</td>
                  <td>{record.symptoms}</td>
                  <td>{record.physicalExamination}</td>
                  <td>{record.treatmentPlan}</td>
                  <td>{record.diagnosis}</td>
                  <td>
                    <span
                      className="me-2"
                      title="Edit"
                      style={{ cursor: "pointer", color: "#ffc107" }}
                      onClick={() => startEdit(record)}
                    >
                      <FaEdit />
                    </span>
                    <span
                      title="Deactivate"
                      style={{ cursor: "pointer", color: "#dc3545" }}
                      onClick={() => deleteRecord(record.recordID)}
                    >
                      <FaTrash />
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && !loading && (
                <tr>
                  <td colSpan="8">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DoctorRecords;
