import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  FaUserMd, FaUsers, FaCalendarAlt, FaFileAlt, FaFileMedical,
  FaVial, FaMoneyBillWave, FaClock, FaBell, FaUserCircle, FaSignOutAlt,FaTimes,FaBars,FaCog, FaEdit, FaTrash
} from "react-icons/fa";
import React, { useState, useEffect } from "react";
import Logo from '../../../Images/Logo.png';


const AdminDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formMode, setFormMode] = useState("add");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specializationID: "",
    experience: "",
    contactNumber: "",
    qualificationID: "",
    designation: "",
    username: "",
    email: "",
    password: "",
  });
  const [activePanel, setActivePanel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [specializations, setSpecializations] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchDoctors();
    fetchFormData();
  }, []);

  const fetchDoctors = () => {
    setLoading(true);
    axios
      .get("http://localhost:5093/api/Doctor", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDoctors(res.data?.["$values"] || res.data || []);
        setLoading(false);
        setCurrentPage(1); 
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setFeedback({ type: "error", message: "Failed to fetch doctors." });
      });
  };

  const fetchFormData = () => {
    axios
      .get("http://localhost:5093/api/Doctor/form-data", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSpecializations(res.data.specializations?.["$values"] ||res.data.specializations || []);
        setQualifications(res.data.qualifications?.["$values"] || res.data.qualifications || []);
      })
      .catch((err) => {
        console.error("Failed to fetch form data:", err);
      });
  };

  const onSearch = () => {
    if (!searchTerm.trim()) {
      fetchDoctors();
      setFeedback(null);
      return;
    }
    setLoading(true);

    const searchRequest = {
    name: searchTerm,
    specializationIds: [],
    qualificationIds: [],
    experienceRange: { minValue: 0, maxValue: 100 },
    sort: 0,
    pageNumber: 1,
    pageSize: 100,
    statusIds: showInactive ? [2] : [1], 
  };


    axios.post("http://localhost:5093/api/Doctor/search", searchRequest, {
  headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        const allDoctors = res.data?.doctors?.["$values"] || res.data?.doctors || [];
        const filteredDoctors = showInactive 
      ? allDoctors.filter(doc => Number(doc.statusID) === 2)
      : allDoctors.filter(doc => Number(doc.statusID) !== 2);
        setDoctors(filteredDoctors);
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
    fetchDoctors();
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEdit = (doctor) => {
    setFormMode("edit");
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || "",
      specializationID: doctor.specializationID ? String(doctor.specializationID) : "",
      experience: doctor.experience ? String(doctor.experience) : "",
      contactNumber: doctor.contactNumber || "",
      qualificationID: doctor.qualificationID ? String(doctor.qualificationID) : "",
      designation: doctor.designation || "",
      username: doctor.username || "",
      email: doctor.email || "",
      password: "",
    });
    setActivePanel("add");
    setFeedback(null);
  };

  const cancelEdit = () => {
    if (window.confirm("Discard changes?")) {
      setFormMode("add");
      setEditingDoctor(null);
      setFormData({
        name: "",
        specializationID: "",
        experience: "",
        contactNumber: "",
        qualificationID: "",
        designation: "",
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
      name: formData.name,
      specializationID: Number(formData.specializationID),
      experience: Number(formData.experience),
      contactNumber: formData.contactNumber,
      qualificationID: Number(formData.qualificationID),
      designation: formData.designation,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      roleID: 2,
      statusID: 1,
    };

    if (formMode === "add") {
      axios
        .post("http://localhost:5093/api/Doctor", submitData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchDoctors();
          setFormMode("add");
          setEditingDoctor(null);
          setFormData({
            name: "",
            specializationID: "",
            experience: "",
            contactNumber: "",
            qualificationID: "",
            designation: "",
            username: "",
            email: "",
            password: "",
          });
          setActivePanel(null);
          setFeedback({ type: "success", message: "Doctor added successfully." });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setFeedback({ type: "error", message: "Failed to add doctor." });
          setLoading(false);
        });
    } else if (formMode === "edit") {
      axios
        .put(`http://localhost:5093/api/Doctor/${editingDoctor.doctorID}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchDoctors();
          setFormMode("add");
          setEditingDoctor(null);
          setFormData({
            name: "",
            specializationID: "",
            experience: "",
            contactNumber: "",
            qualificationID: "",
            designation: "",
            username: "",
            email: "",
            password: "",
          });
          setActivePanel(null);
          setFeedback({ type: "success", message: "Doctor updated successfully." });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setFeedback({ type: "error", message: "Failed to update doctor." });
          setLoading(false);
        });
    }
  };

  const deleteDoctor = (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      setLoading(true);
      axios
        .delete(`http://localhost:5093/api/Doctor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchDoctors();
          setFeedback({ type: "success", message: "Doctor deleted successfully." });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setFeedback({ type: "error", message: "Failed to delete doctor." });
          setLoading(false);
        });
    }
  };

  const displayedDoctors = doctors.filter(doctor =>
    showInactive ? doctor.statusID === 2 : doctor.statusID !== 2
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentDoctors = displayedDoctors.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(displayedDoctors.length / recordsPerPage);

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
            <Link to="/admin/doctors" className="nav-link active">
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
          <h2>Doctors</h2>
          <div className="d-flex align-items-center gap-3">
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" onClick={() => navigate("/profile")}/>
            <button className="btn btn-outline-danger d-flex align-items-center gap-2" disabled={loading} onClick={() => navigate("/login")}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>
     

        <div className="d-flex align-items-center mb-3 gap-2 flex-wrap">
          <div className="flex-grow-1 d-flex justify-content-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              className="form-control w-50"
              style={{minWidth: 250}}
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
            onClick={() => { setShowInactive(!showInactive); setCurrentPage(1); }}
            disabled={loading}
          >
            {showInactive ? "Show Active Doctors" : "Show Inactive Doctors"}
          </button>

          {activePanel === "add" && formMode === "add" ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setActivePanel(null);
                setFormMode("add");
                setEditingDoctor(null);
                setFormData({
                  name: "",
                  specializationID: "",
                  experience: "",
                  contactNumber: "",
                  qualificationID: "",
                  designation: "",
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
              Add Doctor
            </button>
          )}
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        {activePanel === "add" && (
          <form onSubmit={submitForm} className="doctor-form mb-4">
            <h3>{formMode === "add" ? "Add New Doctor" : "Edit Doctor"}</h3>
            <div className="mb-2">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="form-control"
              />
            </div>

            <div className="mb-2">
              <select
                name="specializationID"
                value={formData.specializationID}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="form-select"
              >
                <option value="">Select Specialization</option>
                {specializations.map((spec) => (
                  <option key={spec.specializationID} value={spec.specializationID}>
                    {spec.specializationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <input
                type="number"
                name="experience"
                placeholder="Experience (years)"
                value={formData.experience}
                onChange={handleInputChange}
                disabled={loading}
                required
                min={0}
                max={60}
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
              <select
                name="qualificationID"
                value={formData.qualificationID}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="form-select"
              >
                <option value="">Select Qualification</option>
                {qualifications.map((qual) => (
                  <option key={qual.qualificationID} value={qual.qualificationID}>
                    {qual.qualificationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <input
                type="text"
                name="designation"
                placeholder="Designation"
                value={formData.designation}
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
                {formMode === "add" ? "Add Doctor" : "Update Doctor"}
              </button>

              {formMode === "edit" && !loading && (
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="doctor-list">
          {loading && <p>Loading doctors...</p>}
            <table className="table appointments-table">
            <thead style={{ backgroundColor: "blue", color: "white" }}>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Experience (Years)</th>
                <th>Contact</th>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDoctors.map((doc) => (
                <tr key={doc.doctorID}>
                  <td>{doc.doctorID}</td>
                  <td>{doc.name}</td>
                  <td>
                    {doc.specializationName
                      ? doc.specializationName
                      : specializations.find(
                          (spec) => Number(spec.specializationID) === Number(doc.specializationID)
                        )?.specializationName || doc.specializationID}
                  </td>
                  <td>{doc.experience}</td>
                  <td>{doc.contactNumber}</td>
                  <td>{doc.designation}</td>
                  <td>
                    <button
                      onClick={() => startEdit(doc)}
                      disabled={loading}
                      title="Edit"
                      className="btn btn-sm btn-outline-warning me-2"
                      style={{ padding: "4px 8px", fontSize: "14px" }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteDoctor(doc.doctorID)}
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
              {displayedDoctors.length === 0 && !loading && (
                <tr>
                  <td colSpan="8">No doctors found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {displayedDoctors.length > recordsPerPage && (
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

export default AdminDoctors;
