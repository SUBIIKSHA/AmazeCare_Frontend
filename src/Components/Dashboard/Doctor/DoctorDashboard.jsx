
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card, Navbar, Offcanvas } from "react-bootstrap";
import {
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaNotesMedical,
  FaFileMedicalAlt,
  FaUserCircle,
  FaPrescriptionBottleAlt,
  FaVials,
  FaBell,
  FaCreditCard,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [recentPatientVisit, setRecentPatientVisit] = useState(null);

  const doctorId = sessionStorage.getItem("doctorID");
  const doctorName = sessionStorage.getItem("username") || "Doctor";
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
            (appt) => new Date(appt.appointmentDateTime) > now
          );
          const nextAppointment =
            futureAppointments.length > 0
              ? futureAppointments.reduce((a, b) =>
                  new Date(a.appointmentDateTime) < new Date(b.appointmentDateTime)
                    ? a
                    : b
                )
              : null;
          setUpcomingAppointment(nextAppointment);

          const pastCompleted = appts.filter(
            (appt) =>
              new Date(appt.appointmentDateTime) < now &&
              appt.status &&
              typeof appt.status.statusName === "string" &&
              appt.status.statusName.toLowerCase() === "completed"
          );
          const lastPatientVisit =
            pastCompleted.length > 0
              ? pastCompleted.reduce((a, b) =>
                  new Date(a.appointmentDateTime) > new Date(b.appointmentDateTime)
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

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
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


      <div className="flex-grow-1 d-flex flex-column">
        <Navbar bg="light" className="shadow-sm px-3 px-md-4 py-3 d-none d-md-flex doctor-navbar">
          <Navbar.Brand className="fw-bold">Overview</Navbar.Brand>
          <div className="ms-auto d-flex align-items-center gap-3">
          <FaBell size={22} className="icon-hover text-secondary" title="Notifications" />
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" />
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </Navbar>

        <main className="doctor-main-content flex-grow-1 p-3 p-md-4 overflow-auto">
          <div className="d-flex align-items-center mb-4 justify-content-between flex-wrap gap-3">
            <h2 className="mb-0">Welcome, {doctorName}</h2>
          </div>

          <Row className="dashboard-cards g-3 mb-4">
          <Col xs={12} md={6}>
            <Card className="h-100 text-center gradient-card card-next-appointment">
              <Card.Body>
                <FaCalendarAlt size={28} className="mb-3 icon-white" />
                <Card.Title>Next Appointment</Card.Title>
                <Card.Text>
                  {upcomingAppointment
                    ? `${upcomingAppointment.patient?.fullName || "N/A"} - ${new Date(
                        upcomingAppointment.appointmentDateTime
                      ).toLocaleDateString()}`
                    : "No upcoming appointments"}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card className="h-100 text-center gradient-card card-recent-visit">
              <Card.Body>
                <FaUserInjured size={28} className="mb-3 icon-white" />
                <Card.Title>Recent Patient Visit</Card.Title>
                <Card.Text>
                  {recentPatientVisit
                    ? `${new Date(recentPatientVisit.appointmentDateTime).toLocaleDateString()} - ${
                        recentPatientVisit.visitReason || "N/A"
                      }`
                    : "No recent patient visits"}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

         <section>
      <Card className="shadow-sm border-0 appointments-card">
        <Card.Body>
          <Card.Title className="mb-3">Appointments</Card.Title>
          <div className="table-responsive">
            <table className="table appointments-table">

          <thead className="table-custom-header">
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
                <td colSpan={7} className="text-center py-3">
                  No appointments available
                </td>
              </tr>
            ) : (
              appointments.map((appt, index) => {
                const date = appt.appointmentDateTime
                  ? new Date(appt.appointmentDateTime).toLocaleDateString()
                  : "N/A";
                const time = appt.appointmentDateTime
                  ? new Date(appt.appointmentDateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A";

                const patientName = appt.patient?.fullName || "N/A";
                const statusName =
                  STATUS_NAMES[appt.statusID] || appt.status?.statusName || "Unknown";

                let badgeClass = "bg-secondary text-light";
                switch (statusName.toLowerCase()) {
                  case "pending":
                    badgeClass = "bg-warning text-dark";
                    break;
                  case "scheduled":
                    badgeClass = "bg-info text-dark";
                    break;
                  case "completed":
                    badgeClass = "bg-success text-light";
                    break;
                  case "cancelled":
                    badgeClass = "bg-secondary text-light";
                    break;
                  case "rejected":
                    badgeClass = "bg-danger text-light";
                    break;
                  default:
                    badgeClass = "bg-secondary text-light";
                }

                return (
                  <tr key={appt.appointmentID || index} className="table-row-hover">
                    <td>{appt.appointmentID}</td>
                    <td>{date}</td>
                    <td>{time}</td>
                    <td>{patientName}</td>
                    <td>{appt.visitReason || "N/A"}</td>
                    <td>{appt.symptoms || "N/A"}</td>
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
