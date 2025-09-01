import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserMd, FaUsers, FaCalendarAlt, FaFileAlt, FaFileMedical,
  FaVial, FaMoneyBillWave, FaClock, FaBell, FaUserCircle, FaSignOutAlt,FaTimes,FaBars,FaCog, FaEdit, FaTrash
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Logo from '../../../Images/Logo.png';

const AdminPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formMode, setFormMode] = useState("add");
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    genderID: "",
    bloodGroup: "",
    contactNumber: "",
    address: "",
    username: "",
    email: "",
    password: "",
  });
  const [activePanel, setActivePanel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [genders, setGenders] = useState([]);

  const [showInactive, setShowInactive] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchPatients();
    fetchFormData();
  }, []);

  const fetchPatients = () => {
    setLoading(true);
    axios
      .get("http://localhost:5093/api/Patient", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPatients(res.data?.["$values"] || res.data || []);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setFeedback({ type: "error", message: "Failed to fetch patients." });
      });
  };

  const fetchFormData = () => {
    axios
      .get("http://localhost:5093/api/Patient/masters", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setGenders(res.data.genders?.["$values"] || res.data.genders || []);
      })
      .catch((err) => {
        console.error("Failed to fetch form data:", err);
      });
  };

  const onSearch = () => {
    if (!searchTerm.trim()) {
      fetchPatients();
      setFeedback(null);
      return;
    }
    setLoading(true);
    const searchRequest = {
      fullName: searchTerm,
      genderIds: [],
      bloodGroups: [],
      ageRange: { minValue: 0, maxValue: 120 },
      sort: 0,
      pageNumber: 1,
      pageSize: 100,
      statusIds: showInactive ? [2] : [1],
    };

    axios
      .post("http://localhost:5093/api/Patient/search", searchRequest, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const allPatients = res.data?.patients?.["$values"] || res.data?.patients || [];
        const filteredPatients = showInactive
          ? allPatients.filter((patient) => Number(patient.statusID) === 2)
          : allPatients.filter((patient) => Number(patient.statusID) !== 2);
        setPatients(filteredPatients);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setFeedback({ type: "error", message: "Search failed." });
      });
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFeedback(null);
    fetchPatients();
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEdit = (patient) => {
    setFormMode("edit");
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName || "",
      dob: patient.dob ? patient.dob.split("T")[0] : "",
      genderID: patient.genderID ? String(patient.genderID) : "",
      bloodGroup: patient.bloodGroup || "",
      contactNumber: patient.contactNumber || "",
      address: patient.address || "",
      username: patient.username || "",
      email: patient.email || "",
      password: "",
    });
    setActivePanel("add");
    setFeedback(null);
  };

  const cancelEdit = () => {
    if (window.confirm("Discard changes?")) {
      setFormMode("add");
      setEditingPatient(null);
      setFormData({
        fullName: "",
        dob: "",
        genderID: "",
        bloodGroup: "",
        contactNumber: "",
        address: "",
        username: "",
        email: "",
        password: "",
      });
      setActivePanel(null);
      setFeedback(null);
    }
  };

  const submitForm = (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      fullName: formData.fullName,
      dob: formData.dob,
      genderID: Number(formData.genderID),
      bloodGroup: formData.bloodGroup,
      contactNumber: formData.contactNumber,
      address: formData.address,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      roleID: 3, 
      statusID: 1,
    };

    if (formMode === "add") {
      axios
        .post("http://localhost:5093/api/Patient", submitData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchPatients();
          setFormMode("add");
          setEditingPatient(null);
          setFormData({
            fullName: "",
            dob: "",
            genderID: "",
            bloodGroup: "",
            contactNumber: "",
            address: "",
            username: "",
            email: "",
            password: "",
          });
          setActivePanel(null);
          setFeedback({ type: "success", message: "Patient added successfully." });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setFeedback({ type: "error", message: "Failed to add patient." });
          setLoading(false);
        });
    } else if (formMode === "edit") {
      axios
        .put(`http://localhost:5093/api/Patient/${editingPatient.patientID}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchPatients();
          setFormMode("add");
          setEditingPatient(null);
          setFormData({
            fullName: "",
            dob: "",
            genderID: "",
            bloodGroup: "",
            contactNumber: "",
            address: "",
            username: "",
            email: "",
            password: "",
          });
          setActivePanel(null);
          setFeedback({ type: "success", message: "Patient updated successfully." });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setFeedback({ type: "error", message: "Failed to update patient." });
          setLoading(false);
        });
    }
  };

  const deletePatient = (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      setLoading(true);
      axios
        .delete(`http://localhost:5093/api/Patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchPatients();
          setFeedback({ type: "success", message: "Patient deleted successfully." });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setFeedback({ type: "error", message: "Failed to delete patient." });
          setLoading(false);
        });
    }
  };

  const displayedPatients = patients.filter((patient) =>
    showInactive ? patient.statusID === 2 : patient.statusID !== 2
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentPatients = displayedPatients.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(displayedPatients.length / recordsPerPage);

  const changePage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
      <nav className="admin-sidebar d-flex flex-column p-3">
        <div className="sidebar-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h3 className="mb-4">AmazeCare Admin</h3>
        <ul className="nav flex-column ">
          <li className="nav-item mb-2 " >
            <Link to="/admin-dashboard" className="nav-link ">
              <FaFileAlt className="me-2" /> Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/doctors" className="nav-link">
              <FaUserMd className="me-2" /> Doctors
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/patients" className="nav-link active">
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
          <h2>Patients</h2>
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

        <div className="d-flex align-items-center mb-3 gap-2 flex-wrap">
          <div className="flex-grow-1 d-flex justify-content-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              className="form-control w-50"
              style={{ minWidth: 250 }}
            />
            <button onClick={onSearch} disabled={loading} type="button" className="btn btn-primary">
              Search
            </button>
            <button onClick={clearSearch} disabled={loading} type="button" className="btn btn-secondary">
              Clear
            </button>
          </div>

          <button
            className="btn btn-outline-info ms-auto"
            onClick={() => {
              setShowInactive(!showInactive);
              setCurrentPage(1);
            }}
            disabled={loading}
          >
            {showInactive ? "Show Active Patients" : "Show Inactive Patients"}
          </button>

          {activePanel === "add" && formMode === "add" ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setActivePanel(null);
                setFormMode("add");
                setEditingPatient(null);
                setFormData({
                  fullName: "",
                  dob: "",
                  genderID: "",
                  bloodGroup: "",
                  contactNumber: "",
                  address: "",
                  username: "",
                  email: "",
                  password: "",
                });
                setFeedback(null);
              }}
              disabled={loading}
            >
              Cancel
            </button>
          ) : (
            <button
              className="btn"
              style={{ backgroundColor: "#0049b7", color: "white" }}
              onClick={() => {
                setActivePanel("add");
                setFormMode("add");
                setFeedback(null);
              }}
              disabled={loading}
              type="button"
            >
              Add Patient
            </button>
          )}
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        {activePanel === "add" && (
          <form onSubmit={submitForm} className="patient-form mb-4">
            <h3>{formMode === "add" ? "Add New Patient" : "Edit Patient"}</h3>
            <div className="mb-2">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="form-control"
              />
            </div>

            <div className="mb-2">
              <input
                type="date"
                name="dob"
                placeholder="Date of Birth"
                value={formData.dob}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="form-control"
              />
            </div>

            <div className="mb-2">
              <select
                name="genderID"
                value={formData.genderID}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="form-select"
              >
                <option value="">Select Gender</option>
                {genders.map((gender) => (
                  <option key={gender.genderID} value={gender.genderID}>
                    {gender.genderName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <input
                type="text"
                name="bloodGroup"
                placeholder="Blood Group"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                disabled={loading}
                className="form-control"
              />
            </div>

            <div className="mb-2">
              <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="form-control"
              />
            </div>

            <div className="mb-2">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={loading}
                className="form-control"
              />
            </div>

            {formMode === "add" && (
              <>
                <div className="mb-2">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="form-control"
                  />
                </div>

                <div className="mb-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="form-control"
                  />
                </div>

                <div className="mb-2">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="form-control"
                  />
                </div>
              </>
            )}

            <div>
              <button type="submit" disabled={loading} className="btn btn-primary me-2">
                {formMode === "add" ? "Add Patient" : "Update Patient"}
              </button>

              {formMode === "edit" && !loading && (
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="patient-list">
          {loading && <p>Loading patients...</p>}
          <table className="table table-striped">
            <thead style={{ backgroundColor: "blue", color: "white" }}>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.map((patient) => (
                <tr key={patient.patientID}>
                  <td>{patient.patientID}</td>
                  <td>{patient.fullName}</td>
                  <td>{patient.dob ? patient.dob.split("T")[0] : ""}</td>
                  <td>
                    {patient.genderName
                      ? patient.genderName
                      : genders.find((g) => Number(g.genderID) === Number(patient.genderID))?.genderName || patient.genderID}
                  </td>
                  <td>{patient.bloodGroup}</td>
                  <td>{patient.contactNumber}</td>
                  <td>{patient.address}</td>
                  <td>
                    <button
                      onClick={() => startEdit(patient)}
                      disabled={loading}
                      title="Edit"
                      className="btn btn-sm btn-outline-warning me-2"
                      style={{ padding: "4px 8px", fontSize: "14px" }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deletePatient(patient.patientID)}
                      disabled={loading}
                      title="Delete"
                      className="btn btn-sm btn-outline-danger"
                      style={{ padding: "4px 8px", fontSize: "14px" }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {displayedPatients.length === 0 && !loading && (
                <tr>
                  <td colSpan="8">No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {displayedPatients.length > recordsPerPage && (
            <div className="pagination-controls mt-3 d-flex justify-content-center gap-2">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-outline-primary"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`btn ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => changePage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-outline-primary"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPatients;
