import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const AdminRecords = () => {
  const [records, setRecords] = useState([]);
  const [activePanel, setActivePanel] = useState(null); // 'add' | null
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    patientID: "",
    doctorID: "",
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

  useEffect(() => {
    fetchRecords();
  }, []);

  function fetchRecords() {
    setLoading(true);
    axios.get("http://localhost:5093/api/MedicalRecord", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setRecords(res.data?.["$values"] || []);
      setLoading(false);
    }).catch(err => {
      setLoading(false);
      setFeedback({ type: "error", message: "Failed to fetch records." });
    });
  }

  function handleInputChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function startEdit(record) {
    setFormMode("edit");
    setEditingRecord(record);
    setFormData({
      patientID: record.patientID || "",
      doctorID: record.doctorID || "",
      appointmentID: record.appointmentID || "",
      symptoms: record.symptoms || "",
      physicalExamination: record.physicalExamination || "",
      treatmentPlan: record.treatmentPlan || "",
      diagnosis: record.diagnosis || "",
      createdAt: record.createdAt ? record.createdAt.slice(0, 10) : "",
    });
    setActivePanel('add');
    setFeedback(null);
  }

  function cancelEdit() {
    setFormMode("add");
    setEditingRecord(null);
    setFormData({
      patientID: "",
      doctorID: "",
      appointmentID: "",
      symptoms: "",
      physicalExamination: "",
      treatmentPlan: "",
      diagnosis: "",
      createdAt: "",
    });
    setActivePanel(null);
    setFeedback(null);
  }

  function submitForm(e) {
    e.preventDefault();
    setLoading(true);
    if (formMode === "add") {
      axios.post("http://localhost:5093/api/MedicalRecord", formData, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        fetchRecords();
        cancelEdit();
        setFeedback({ type: "success", message: "Medical record added successfully." });
        setLoading(false);
      }).catch(err => {
        setFeedback({ type: "error", message: "Failed to add medical record." });
        setLoading(false);
      });
    } else if (formMode === "edit") {
      axios.put(`http://localhost:5093/api/MedicalRecord/${editingRecord.recordID}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        fetchRecords();
        cancelEdit();
        setFeedback({ type: "success", message: "Medical record updated successfully." });
        setLoading(false);
      }).catch(err => {
        setFeedback({ type: "error", message: "Failed to update medical record." });
        setLoading(false);
      });
    }
  }

  function deleteRecord(id) {
    if (window.confirm("Are you sure you want to deactivate this medical record?")) {
      setLoading(true);
      axios.delete(`http://localhost:5093/api/MedicalRecord/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        fetchRecords();
        setFeedback({ type: "success", message: "Record deactivated successfully." });
        setLoading(false);
      }).catch(err => {
        setFeedback({ type: "error", message: "Failed to deactivate record." });
        setLoading(false);
      });
    }
  }

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
      <nav className="admin-sidebar d-flex flex-column p-3">
        <h3 className="mb-4">AmazeCare Admin</h3>
        <ul className="nav flex-column">
          <li className="nav-item mb-2"><Link to="/admin-dashboard" className="nav-link">Dashboard</Link></li>
          <li className="nav-item mb-2"><Link to="/admin/doctors" className="nav-link">Doctors</Link></li>
          <li className="nav-item mb-2"><a href="/admin/patients" className="nav-link">Patients</a></li>
          <li className="nav-item mb-2"><a href="/admin/appointments" className="nav-link">Appointments</a></li>
          <li className="nav-item mb-2"><a href="/admin/records" className="nav-link active">Records</a></li>
          <li className="nav-item mb-2"><a href="#settings" className="nav-link">Settings</a></li>
        </ul>
      </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Medical Records</h2>
          <button
            className={`btn btn-outline-success${activePanel === 'add' ? ' active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'add' ? null : 'add')}
            disabled={loading}
            type="button"
          >Add Record</button>
        </header>

        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        {activePanel === 'add' && (
          <form onSubmit={submitForm} className="medical-record-form mb-4">
            <h3>{formMode === "add" ? "Add Medical Record" : "Edit Medical Record"}</h3>
            <input
              type="number"
              name="patientID"
              placeholder="Patient ID"
              value={formData.patientID}
              onChange={handleInputChange}
              disabled={loading}
              required
              className="form-control mb-2"
            />
            <input
              type="number"
              name="doctorID"
              placeholder="Doctor ID"
              value={formData.doctorID}
              onChange={handleInputChange}
              disabled={loading}
              required
              className="form-control mb-2"
            />
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
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">Cancel</button>
                )}

            </div>
          </form>
        )}

        <div className="medical-record-list">
          {loading && <p>Loading records...</p>}
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>AppointmentID</th>
                <th>PatientID</th>
                <th>DoctorID</th>
                <th>Symptoms</th>
                <th>PhysicalExamination</th>
                <th>TreatmentPlan</th>
                <th>Diagnosis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.recordID}>
                  <td>{record.recordID}</td>
                  <td>{record.appointmentID}</td>
                  <td>{record.patientID}</td>
                  <td>{record.doctorID}</td>
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
                  <td colSpan="9">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminRecords;
