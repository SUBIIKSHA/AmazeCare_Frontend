// DoctorDashboard.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card, Navbar, Offcanvas } from "react-bootstrap";
import {
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaNotesMedical,
  FaFileMedicalAlt,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";


function DoctorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [recentPatientVisit, setRecentPatientVisit] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const doctorId = sessionStorage.getItem("doctorID");
  const doctorName = sessionStorage.getItem("doctorName") || "Doctor";
  const token = sessionStorage.getItem("token");

  const STATUS_NAMES = {
    1: "Pending",
    2: "Scheduled",
    3: "Completed",
    4: "Cancelled",
    5: "Rejected",
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!doctorId) return;

    const fetchAppointments = () => {
      axios
        .get(`http://localhost:5093/api/Appointment/byDoctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          let appts = res.data;
          if (appts && appts.$values) appts = appts.$values;
          if (!Array.isArray(appts)) appts = [];

          setAppointments(appts);

          const now = new Date();
          const futureAppointments = appts.filter(
            (appt) => new Date(appt.AppointmentDateTime) > now
          );
          const nextAppointment =
            futureAppointments.length > 0
              ? futureAppointments.reduce((a, b) =>
                  new Date(a.AppointmentDateTime) < new Date(b.AppointmentDateTime)
                    ? a
                    : b
                )
              : null;
          setUpcomingAppointment(nextAppointment);

          const pastCompleted = appts.filter(
            (appt) =>
              new Date(appt.AppointmentDateTime) < now &&
              appt.Status &&
              typeof appt.Status.StatusName === "string" &&
              appt.Status.StatusName.toLowerCase() === "completed"
          );
          const lastPatientVisit =
            pastCompleted.length > 0
              ? pastCompleted.reduce((a, b) =>
                  new Date(a.AppointmentDateTime) > new Date(b.AppointmentDateTime)
                    ? a
                    : b
                )
              : null;
          setRecentPatientVisit(lastPatientVisit);
        })
        .catch(console.error);
    };

    fetchAppointments();

    if (location.state?.reloadAppointments) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [doctorId, token, location.state?.reloadAppointments, navigate]);

  useEffect(() => {
    // Example notifications - in real app, fetch from API
    setNotifications([
      { id: 1, message: "New lab results available for patient John Doe." },
      { id: 2, message: "Appointment reminder: Jane Smith tomorrow at 9:00 AM." },
    ]);
  }, []);

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
      {/* Sidebar for Desktop */}
      <nav className="admin-sidebar d-flex flex-column p-3">
        <h3 className="mb-4">AmazeCare Doctor</h3>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/doctor-dashboard" className="nav-link active">
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
            <Link to="/doctor/medical-notes" className="nav-link">
              <FaNotesMedical className="me-2" /> Medical Notes
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/doctor/records" className="nav-link">
              <FaFileMedicalAlt className="me-2" /> Medical Records
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* Navbar for Mobile */}
      <Navbar bg="light" expand="md" className="shadow-sm d-md-none">
        <Navbar.Brand>AmazeCare</Navbar.Brand>
        <Navbar.Toggle aria-controls="doctor-sidebar" />
        <Navbar.Offcanvas id="doctor-sidebar" placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
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
                <Link to="/doctor/medical-notes" className="nav-link">
                  <FaNotesMedical className="me-2" /> Medical Notes
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/doctor/records" className="nav-link">
                  <FaFileMedicalAlt className="me-2" /> Medical Records
                </Link>
              </li>
            </ul>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Navbar>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar bg="light" className="shadow-sm px-3 px-md-4 py-3 d-none d-md-flex doctor-navbar">
          <Navbar.Brand className="fw-bold">Overview</Navbar.Brand>
          <div className="ms-auto d-flex align-items-center gap-3">
            <FaBell size={24} className="text-secondary cursor-pointer" title="Notifications" />
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" />
            <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </Navbar>

        <main className="doctor-main-content flex-grow-1 p-3 p-md-4 overflow-auto">
          {/* Welcome */}
          <div className="d-flex align-items-center mb-4 justify-content-between flex-wrap gap-3">
            <h2 className="mb-0">Welcome, {doctorName}</h2>
          </div>

          {/* Summary Cards */}
          <Row className="dashboard-cards g-3 mb-4">
            <Col xs={12} md={6}>
              <Card className="h-100 shadow-sm text-center">
                <Card.Body>
                  <FaCalendarAlt size={20} className="mb-3 text-primary" />
                  <Card.Title>Next Appointment</Card.Title>
                  <Card.Text>
                    {upcomingAppointment
                      ? `${upcomingAppointment.Patient?.Name || "N/A"} - ${new Date(
                          upcomingAppointment.AppointmentDateTime
                        ).toLocaleDateString()}`
                      : "No upcoming appointments"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={6}>
              <Card className="h-100 shadow-sm text-center">
                <Card.Body>
                  <FaUserInjured size={20} className="mb-3 text-primary" />
                  <Card.Title>Recent Patient Visit</Card.Title>
                  <Card.Text>
                    {recentPatientVisit
                      ? `${new Date(recentPatientVisit.AppointmentDateTime).toLocaleDateString()} - ${
                          recentPatientVisit.VisitReason || "N/A"
                        }`
                      : "No recent patient visits"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Notifications */}
          <section className="mb-4">
            <h4>Notifications</h4>
            {notifications.length === 0 ? (
              <p>No notifications available</p>
            ) : (
              <ul className="list-group">
                {notifications.map((note) => (
                  <li key={note.id} className="list-group-item">
                    {note.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Appointments Table */}
          <section>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Appointments</Card.Title>
                <div className="table-responsive mt-3">
                  <table className="table table-striped">
                    <thead className="color-table">
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Visit Reason</th>
                        <th>Symptoms</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan={7}>No appointments available</td>
                        </tr>
                      ) : (
                        appointments.map((appt, index) => {
                          const date = appt.AppointmentDateTime
                            ? new Date(appt.AppointmentDateTime).toLocaleDateString()
                            : "N/A";
                          const time = appt.AppointmentDateTime
                            ? new Date(appt.AppointmentDateTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A";

                          const patientName = appt.Patient?.Name || "N/A";
                          const statusName =
                            STATUS_NAMES[appt.StatusID] || appt.Status?.StatusName || "Unknown";

                          let badgeClass = "bg-secondary";
                          switch (statusName.toLowerCase()) {
                            case "pending":
                              badgeClass = "bg-warning";
                              break;
                            case "scheduled":
                              badgeClass = "bg-info";
                              break;
                            case "completed":
                              badgeClass = "bg-success";
                              break;
                            case "cancelled":
                              badgeClass = "bg-secondary";
                              break;
                            case "rejected":
                              badgeClass = "bg-danger";
                              break;
                            default:
                              badgeClass = "bg-secondary";
                          }

                          return (
                            <tr key={appt.AppointmentID || index}>
                              <td>{appt.AppointmentID}</td>
                              <td>{date}</td>
                              <td>{time}</td>
                              <td>{patientName}</td>
                              <td>{appt.VisitReason || "N/A"}</td>
                              <td>{appt.Symptoms || "N/A"}</td>
                              <td>
                                <span className={`badge ${badgeClass}`}>{statusName}</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DoctorDashboard;
