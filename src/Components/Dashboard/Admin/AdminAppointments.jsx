import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const AdminAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [statusFilter, setStatusFilter] = useState(""); // filter value

  // Pagination states
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

    // Client-side filtering by patient or doctor name on current appointments
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

  // Pagination calculations
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
        JSON.stringify(newDateTimeISO), // raw JSON string body
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
        <h3 className="mb-4">AmazeCare Admin</h3>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/admin-dashboard" className="nav-link">
              Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">
            <a href="/admin/doctors" className="nav-link">Doctors</a>
          </li>
          <li className="nav-item mb-2">
            <a href="/admin/patients" className="nav-link">Patients</a>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/appointments" className="nav-link active">
              Appointments
            </Link>
          </li>
          <li className="nav-item mb-2">
            <a href="#reports" className="nav-link">Reports</a>
          </li>
          <li className="nav-item mb-2">
            <a href="#settings" className="nav-link">Settings</a>
          </li>
        </ul>
      </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Appointments</h2>
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

        {/* Search and Status Filter Section */}
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

        {/* Feedback */}
        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        {/* Appointment List */}
        <div className="appointment-list">
          {loading && <p>Loading appointments...</p>}
          <table className="table table-striped">
            <thead style={{ backgroundColor: "blue", color: "white" }}>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Symptoms</th>
                <th>Visit Reason</th>
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
                  <td>{appt.patientName || appt.patient?.fullName || "Unknown"}</td>
                  <td>{appt.doctorName || appt.doctor?.name || "Unknown"}</td>
                  <td>{appt.symptoms}</td>
                  <td>{appt.visitReason}</td>
                  <td>{appt.appointmentDateTime ? new Date(appt.appointmentDateTime).toLocaleDateString() : ""}</td>
                  <td>{appt.appointmentDateTime ? new Date(appt.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</td>
                  <td>{getStatusName(appt.statusID) || appt.status}</td>
                  <td>
                    {(appt.statusID !== 4 /* Cancelled */ && appt.statusName !== "Cancelled") && (
                      <>
                        <button
                          onClick={() => handleRescheduleClick(appt)}
                          disabled={loading}
                          title="Reschedule"
                          className="btn btn-sm btn-outline-primary me-2"
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
                      </>
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

          {/* Pagination */}
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
