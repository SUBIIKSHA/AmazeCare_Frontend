import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown, DropdownButton } from "react-bootstrap";
import {
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaVials,
  FaCreditCard,
  FaUserCircle,
  FaBell
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";
import Logo from '../../../Images/Logo.png';



function DoctorAppointments() {
  const navigate = useNavigate();
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const token = sessionStorage.getItem("token");
  const doctorId = sessionStorage.getItem("doctorID");

  useEffect(() => {
    fetchAppointments();
    fetchMasterData();
  }, []);

  const fetchAppointments = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5093/api/Appointment/byDoctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let data = res.data;
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

        setAllAppointments(appointmentsArray);
        setAppointments(appointmentsArray);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(() => {
        setLoading(false);
        setFeedback({ type: "error", message: "Failed to fetch appointments." });
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

  useEffect(() => {
    let filtered = allAppointments;

    if (statusFilter) {
      filtered = filtered.filter(
        (appt) =>
          appt.statusName === statusFilter ||
          appt.status?.statusName === statusFilter ||
          getStatusName(appt.statusID) === statusFilter
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((appt) => {
        const patientName =
          (appt.patient?.fullName || appt.patientName || "").toString().toLowerCase();
        const doctorName =
          (appt.doctor?.name || appt.doctorName || "").toString().toLowerCase();
        return patientName.includes(term) || doctorName.includes(term);
      });
    }

    setAppointments(filtered);
    setCurrentPage(1);
  }, [statusFilter, searchTerm, allAppointments]);

  const getStatusName = (statusID) => statuses.find((s) => s.statusID === statusID)?.statusName || "";

  const handleStatusFilter = (e) => setStatusFilter(e.target.value);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const onSearch = () => setCurrentPage(1);

  const clearSearch = () => {
    setSearchTerm("");
    setStatusFilter("");
    setFeedback(null);
  };

  const indexLastRecord = currentPage * recordsPerPage;
  const indexFirstRecord = indexLastRecord - recordsPerPage;

  const currentAppointments = appointments.slice(indexFirstRecord, indexLastRecord);
  const totalPages = Math.ceil(appointments.length / recordsPerPage);

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const updateStatus = (id, endpoint, successMsg) => {
    if (!window.confirm(`Are you sure you want to ${successMsg.toLowerCase()} this appointment?`))
      return;
    setLoading(true);
    axios
      .put(`http://localhost:5093/api/Appointment/${endpoint}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchAppointments();
        setFeedback({ type: "success", message: `Appointment ${successMsg.toLowerCase()} successfully.` });
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: "error", message: `Failed to ${successMsg.toLowerCase()} appointment.` });
        setLoading(false);
      });
  };

  const approve = (id) => updateStatus(id, "approve", "Approved");
  const reject = (id) => updateStatus(id, "reject", "Rejected");
  const complete = (id) => updateStatus(id, "complete", "Completed");
  const cancel = (id) => updateStatus(id, "cancel", "Cancelled");

  const handleRescheduleClick = (appointment) => {
    const currentDateTime = appointment.appointmentDateTime
      ? new Date(appointment.appointmentDateTime).toISOString().slice(0, 16)
      : "";
    const newDateTime = window.prompt("Enter new date & time (YYYY-MM-DDThh:mm)", currentDateTime);
    if (!newDateTime) return;
    const isoDateTime = new Date(newDateTime).toISOString();
    setLoading(true);
    axios
      .put(`http://localhost:5093/api/Appointment/reschedule/${appointment.appointmentID}`, JSON.stringify(isoDateTime), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })
      .then(() => {
        fetchAppointments();
        setFeedback({ type: "success", message: "Appointment rescheduled successfully." });
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: "error", message: "Failed to reschedule appointment." });
        setLoading(false);
      });
  };
      const getBadgeClass = (statusName) => {
        switch (statusName?.toLowerCase()) {
          case "pending":
            return "bg-warning text-dark";
          case "scheduled":
            return "bg-info text-dark";
          case "completed":
            return "bg-success text-light";
          case "cancelled":
            return "bg-secondary text-light";
          case "rejected":
            return "bg-danger text-light";
          default:
            return "bg-secondary text-light";
        }
      };

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
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
            <Link to="/doctor/appointments" className="nav-link active">
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
        <Link to="/doctor/tests" className="nav-link">
          <FaVials className="me-2" /> Tests
        </Link>
      </li>
      
        </ul>
      </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Appointments</h2>
          <div className="d-flex align-items-center gap-3">
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" onClick={() => navigate("/profile")} />
            <button className="btn btn-outline-danger" disabled={loading} onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <div className="d-flex align-items-center mb-3 gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by patient..."
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={loading}
            className="form-control"
            style={{ maxWidth: 250 }}
          />
          <button className="btn btn-primary" disabled={loading} onClick={onSearch}>
            Search
          </button>
          <button className="btn btn-secondary" disabled={loading} onClick={clearSearch}>
            Clear
          </button>
          <select
            className="form-select ms-auto"
            style={{ maxWidth: 200 }}
            disabled={loading}
            onChange={handleStatusFilter}
            value={statusFilter}
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

        {loading && <p>Loading appointments...</p>}

          <table className="table appointments-table">
          <thead style={{ backgroundColor: "#0049b7", color: "white" }}>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Symptoms</th>
              <th>Visit Reason</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && !loading ? (
              <tr><td colSpan="9">No appointments found.</td></tr>
            ) : (
              appointments.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage).map(appt => (
                <tr key={appt.appointmentID}>
                  <td>{appt.appointmentID}</td>
                  <td>{appt.patient?.fullName || appt.patientName || "Unknown"}</td>
                  <td>{appt.symptoms}</td>
                  <td>{appt.visitReason}</td>
                  <td>{appt.appointmentDateTime ? new Date(appt.appointmentDateTime).toLocaleDateString() : ""}</td>
                  <td>{appt.appointmentDateTime ? new Date(appt.appointmentDateTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ""}</td>
                  <td>
                  <span className={`badge ${getBadgeClass(getStatusName(appt.statusID) || appt.status)}`}>
                    {getStatusName(appt.statusID) || appt.status}
                  </span>
                </td>
                  <td>
                    {(appt.statusID === 1) && (
                        <DropdownButton id={`actions-dropdown-${appt.appointmentID}`}  variant="secondary" size="sm"align="end"renderMenuOnMount={true} >
                        <Dropdown.Item onClick={() => approve(appt.appointmentID)}>Approve</Dropdown.Item>
                        <Dropdown.Item onClick={() => reject(appt.appointmentID)}>Reject</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleRescheduleClick(appt)}>Reschedule</Dropdown.Item>
                        <Dropdown.Item onClick={() => cancel(appt.appointmentID)}>Cancel</Dropdown.Item>
                        </DropdownButton>
                    )}
                    {(appt.statusID === 2) && (
                        <DropdownButton id={`actions-dropdown-${appt.appointmentID}`}  variant="secondary" size="sm" renderMenuOnMount={true}>
                        <Dropdown.Item onClick={() => complete(appt.appointmentID)}>Complete</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleRescheduleClick(appt)}>Reschedule</Dropdown.Item>
                        <Dropdown.Item onClick={() => cancel(appt.appointmentID)}>Cancel</Dropdown.Item>
                        </DropdownButton>
                    )}
                    {[3,4,5].includes(appt.statusID) && <span className="text-muted">-</span>}
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {appointments.length > recordsPerPage && (
          <nav>
            <ul className="pagination justify-content-center mt-3">
              <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                <button className="page-link" onClick={() => changePage(currentPage -1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item${currentPage === i+1 ? " active" : ""}`}>
                  <button className="page-link" onClick={() => changePage(i+1)}>{i+1}</button>
                </li>
              ))}
              <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`}>
                <button className="page-link" onClick={() => changePage(currentPage +1)}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </main>
    </div>
  );
}

export default DoctorAppointments;
