import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaHome,
  FaCalendarAlt,
  FaFileMedical,
  FaSignOutAlt,
  FaPrescriptionBottleAlt,
  FaCreditCard,
  FaUserMd,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./PatientDashboard.css";
import Logo from '../../../Images/Logo.png';


const specializationMap = {
  1: "Cardiology",
  2: "Dermatology",
  3: "Neurology",
  4: "Pediatrics",
  5: "Orthopedics",
  6: "Oncology",
  7: "Psychiatry",
  8: "Ophthalmology",
};

const PatientDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [bookingData, setBookingData] = useState({
    doctorID: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
    visitReason: "",
  });

  const token = sessionStorage.getItem("token");
  const patientID = Number(sessionStorage.getItem("patientID"));

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = () => {
    setLoading(true);
    axios
      .get("http://localhost:5093/api/Doctor", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const allDoctors = res.data?.["$values"] || res.data ||[];
        const activeDoctors = allDoctors.filter((doc) => Number(doc.statusID) !== 2);
        setDoctors(activeDoctors);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setFeedback({ type: "error", message: "Failed to fetch doctors." });
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
      statusIds: [1], 
    };

    axios
      .post("http://localhost:5093/api/Doctor/search", searchRequest, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const allDoctors = res.data?.doctors?.["$values"] || res.data?.doctors || [];
        console.log(allDoctors)
        const activeDoctors = allDoctors.filter((doc) => Number(doc.statusID) !== 2);
        setDoctors(activeDoctors);
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

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(doctors.length / recordsPerPage);

  const changePage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingCancel = () => {
    setShowBookingPanel(false);
    setBookingData({
      doctorID: "",
      appointmentDate: "",
      appointmentTime: "",
      symptoms: "",
      visitReason: "",
    });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!bookingData.appointmentDate || !bookingData.appointmentTime) {
      alert("Please enter both date and time.");
      return;
    }
    if (!bookingData.doctorID) {
      alert("Please enter a doctor ID.");
      return;
    }

    const dateTimeISO = new Date(
      `${bookingData.appointmentDate}T${bookingData.appointmentTime}`
    ).toISOString();

    const payload = {
      patientID: patientID,
      doctorID: Number(bookingData.doctorID),
      appointmentDateTime: dateTimeISO,
      symptoms: bookingData.symptoms,
      visitReason: bookingData.visitReason,
    };

    axios
      .post("http://localhost:5093/api/Appointment/book", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Appointment booked successfully!");
        handleBookingCancel();
        navigate("/patient-dashboard", { state: { reloadAppointments: true } });
        fetchDoctors();
      })
      .catch((err) => {
        console.error("Booking failed:", err.response?.data || err.message);
        alert("Failed to book appointment: " + (err.response?.data?.message || "Unknown error"));
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
            <Link to="/patient/doctors" className="nav-link active">
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
            <Link to="/patient/billings" className="nav-link">
              <FaCreditCard className="me-2" />
              Billing
            </Link>
          </li>
        </ul>
      </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Doctors</h2>
          <div className="d-flex align-items-center gap-3">
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" onClick={() => navigate("/profile")}/>
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
              placeholder="Search doctors..."
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
            className="btn"
            style={{ backgroundColor: "#0062ff", color: "white" }}
            onClick={() => setShowBookingPanel(true)}
          >
            Book Appointment
          </button>
        </div>

        {showBookingPanel && (
          <div
            style={{
              background: "#f7faff",
              borderRadius: "12px",
              margin: "0 auto 2rem",
              maxWidth: 600,
              width: "100%",
              padding: "32px",
              boxShadow: "0 2px 24px rgba(0,0,0,0.08)",
            }}
          >
            <h3 className="text-center mb-4" style={{ fontWeight: 600 }}>
              Book Appointment
            </h3>
            <form onSubmit={handleBookingSubmit}>
              <div className="mb-3">
                <input
                  type="number"
                  name="doctorID"
                  value={bookingData.doctorID}
                  onChange={handleBookingChange}
                  required
                  className="form-control"
                  placeholder="Enter Doctor ID"
                  min="1"
                />
              </div>

              <div className="mb-3">
                <input
                  type="date"
                  name="appointmentDate"
                  value={bookingData.appointmentDate}
                  onChange={handleBookingChange}
                  required
                  className="form-control"
                  placeholder="Date"
                />
              </div>
              <div className="mb-3">
                <input
                  type="time"
                  name="appointmentTime"
                  value={bookingData.appointmentTime}
                  onChange={handleBookingChange}
                  required
                  className="form-control"
                  placeholder="Time"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  name="visitReason"
                  value={bookingData.visitReason}
                  onChange={handleBookingChange}
                  className="form-control"
                  placeholder="Visit Reason"
                />
              </div>
              <div className="mb-3">
                <textarea
                  name="symptoms"
                  rows={2}
                  value={bookingData.symptoms}
                  onChange={handleBookingChange}
                  className="form-control"
                  placeholder="Symptoms"
                />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  type="submit"
                  className="btn"
                  style={{ background: "linear-gradient(90deg,#0062ff,#33aeff)", color: "white", minWidth: "120px" }}
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ minWidth: "120px" }}
                  onClick={handleBookingCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

            <table className="table appointments-table">
          <thead style={{ backgroundColor: "blue", color: "white" }}>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Specialization</th>
              <th>Experience (Years)</th>
              <th>Designation</th>
            </tr>
          </thead>
          <tbody>
            {currentDoctors.length === 0 && !loading ? (
              <tr>
                <td colSpan="5">No doctors found.</td>
              </tr>
            ) : (
              currentDoctors.map((doc) => (
                <tr key={doc.doctorID}>
                  <td>{doc.doctorID}</td>
                  <td>{doc.name}</td>
                  <td>{specializationMap[doc.specializationID] || doc.specializationID || doc.specializationName}</td>
                  <td>{doc.experience}</td>
                  <td>{doc.designation}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {doctors.length > recordsPerPage && (
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
      </main>
    </div>
  );
};

export default PatientDoctors;
