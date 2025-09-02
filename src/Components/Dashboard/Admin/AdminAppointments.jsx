import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserMd, FaUsers, FaCalendarAlt, FaFileAlt, FaFileMedical,
  FaVial, FaMoneyBillWave, FaClock, FaBell, FaUserCircle, FaSignOutAlt,FaTimes,FaBars,FaCog, FaEdit, FaTrash
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Logo from '../../../Images/Logo.png';
import "./AdminDashboard.css";



const AdminAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [statusFilter, setStatusFilter] = useState(""); 

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchAppointments();
    fetchMasterData();
  }, []);

  const fetchAppointments = () => {
    setLoading(true);
    axios
      .get("http://localhost:5093/api/Appointment/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        let appointmentsArray = [];

        if (Array.isArray(data)) {
          appointmentsArray = data;
        } else if (data?.appointments) {
          appointmentsArray = Array.isArray(data.appointments)
            ? data.appointments
            : data.appointments["$values"] || [];
        } else if (data?.["$values"]) {
          appointmentsArray = data["$values"];
        }

        setAppointments(appointmentsArray);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setFeedback({ type: "error", message: "Failed to fetch appointments." });
      });
  };

  const fetchAppointmentsByStatus = (statusID) => {
    setLoading(true);
    axios
      .get(`http://localhost:5093/api/Appointment/byStatus/${statusID}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("fetchAppointments API response:", res.data);
        const data = res.data;
        const appointmentsArray = Array.isArray(data) ? data : data?.["$values"] || [];
        console.log("Extracted appointments by status:", appointmentsArray);
        setAppointments(appointmentsArray);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Error fetching by status:", err);
        setFeedback({ type: "error", message: "Failed to filter by status." });
        setLoading(false);
      });
  };

  const fetchMasterData = () => {
    setStatuses([
      { statusID: 1, statusName: "Pending" },
      { statusID: 2, statusName: "Scheduled" },
      { statusID: 3, statusName: "Completed" },
      { statusID: 4, statusName: "Cancelled" },
      { statusID: 5, statusName: "Rejected" },
    ]);
  };
  
  const getStatusClass = (statusName) => {
  switch (statusName?.toLowerCase()) {
    case "pending":
      return "badge status-pending";
    case "completed":
      return "badge status-completed";
    case "cancelled":
      return "badge status-cancelled";
    case "scheduled":
      return "badge status-scheduled";
    case "rejected":
      return "badge status-rejected";
    default:
      return "badge bg-secondary";
  }
};

  const handleStatusFilterChange = (e) => {
    const selectedStatusName = e.target.value;
    setStatusFilter(selectedStatusName);
    setCurrentPage(1);

    if (selectedStatusName) {
      const statusObj = statuses.find((s) => s.statusName === selectedStatusName);
      if (statusObj) {
        fetchAppointmentsByStatus(statusObj.statusID);
      }
    } else {
      fetchAppointments();
    }
  };

  const onSearch = () => {
    if (!searchTerm.trim()) {
      setFeedback(null);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = appointments.filter(
      (appt) =>
        (appt.patientName && appt.patientName.toLowerCase().includes(normalizedSearch)) ||
        (appt.doctorName && appt.doctorName.toLowerCase().includes(normalizedSearch))
    );

    setAppointments(filtered);
    setLoading(false);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setStatusFilter("");
    setFeedback(null);
    fetchAppointments();
  };

  const displayedAppointments = appointments;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentAppointments = displayedAppointments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(displayedAppointments.length / recordsPerPage);

  const changePage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  const cancelAppointment = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setLoading(true);
      axios
        .put(`http://localhost:5093/api/Appointment/cancel/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchAppointments();
          setFeedback({ type: "success", message: "Appointment canceled successfully." });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setFeedback({ type: "error", message: "Failed to cancel appointment." });
          setLoading(false);
        });
    }
  };

  const handleRescheduleClick = (appointment) => {
  const currentDateTimeLocal = appointment.appointmentDateTime
    ? new Date(appointment.appointmentDateTime).toISOString().slice(0, 16)
    : "";
  const newDateTimeInput = window.prompt(
    "Enter new appointment date & time (YYYY-MM-DDTHH:mm):",
    currentDateTimeLocal
  );
  if (newDateTimeInput) {
    const newDateTimeISO = new Date(newDateTimeInput).toISOString();
    setLoading(true);
    axios
      .put(
        `http://localhost:5093/api/Appointment/reschedule/${appointment.appointmentID}`,
        JSON.stringify(newDateTimeISO), 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        fetchAppointments();
        setFeedback({ type: "success", message: "Appointment rescheduled successfully." });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        setFeedback({ type: "error", message: "Failed to reschedule appointment." });
        setLoading(false);
      });
  }
};


  const getStatusName = (statusID) => statuses.find((s) => s.statusID === statusID)?.statusName || "";

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
            <Link to="/admin/patients" className="nav-link">
              <FaUsers className="me-2" /> Patients
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/appointments" className="nav-link active">
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
          <h2>Appointments</h2>
          <div className="d-flex align-items-center gap-3">
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" onClick={() => navigate("/profile")} />
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
              placeholder="Search by patient or doctor name..."
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

          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="form-select ms-auto"
            disabled={loading}
            style={{ maxWidth: 200 }}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.statusID} value={status.statusName}>
                {status.statusName}
              </option>
            ))}
          </select>
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        <div className="appointment-list" >
          {loading && <p>Loading appointments...</p>}
          <div style={{ overflowX: "auto", width: "100%"}}>
           <table className="table appointments-table" style={{ minWidth: "900px" }}>
            <thead style={{ backgroundColor: "blue", color: "white" }}>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Symptoms</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appt) => (
                <tr key={appt.appointmentID}>
                  <td>{appt.appointmentID}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{appt.patientName || appt.patient?.fullName || "Unknown"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{appt.doctorName || appt.doctor?.name || "Unknown"}</td>
                  <td>{appt.symptoms}</td>
                  <td>{appt.appointmentDateTime ? new Date(appt.appointmentDateTime).toLocaleDateString() : ""}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{appt.appointmentDateTime ? new Date(appt.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</td>
                  <td>
                  <span className={getStatusClass(getStatusName(appt.statusID) || appt.status)}>
                    {getStatusName(appt.statusID) || appt.status}
                  </span>
                </td>

                  <td style={{ minWidth: "90px" }}>
                  {(appt.statusID !== 4 && appt.statusName !== "Cancelled") && (
                    <div className="d-flex align-items-center justify-content-center" style={{ gap: "6px" }}>
                      <button
                        onClick={() => handleRescheduleClick(appt)}
                        disabled={loading}
                        title="Reschedule"
                        className="btn btn-sm btn-outline-primary"
                        style={{ padding: "4px 8px", fontSize: "14px" }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => cancelAppointment(appt.appointmentID)}
                        disabled={loading}
                        title="Cancel"
                        className="btn btn-sm btn-outline-danger"
                        style={{ padding: "4px 8px", fontSize: "14px" }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </td>

                </tr>
              ))}
              {displayedAppointments.length === 0 && !loading && (
                <tr>
                  <td colSpan="9">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          {displayedAppointments.length > recordsPerPage && (
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

export default AdminAppointments;
