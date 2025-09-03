
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Navbar,
  Offcanvas
} from "react-bootstrap";
import {
  FaHome,
  FaCalendarAlt,
  FaFileMedical,
  FaPrescriptionBottleAlt,
  FaCreditCard,
  FaUserMd,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import Logo from '../../../Images/Logo.png';
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./PatientDashboard.css";

function PatientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [lastVisit, setLastVisit] = useState(null);

  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [bookingData, setBookingData] = useState({
    doctorID: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
    visitReason: "",
  });

  const [allDoctors, setAllDoctors] = useState([]);

  const patientId = sessionStorage.getItem("patientID");
  const username = sessionStorage.getItem("username") || "Patient";
  const token = sessionStorage.getItem("token");

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };
   const goToProfile = () => {
    navigate("/profile");
  };

  const STATUS_NAMES = {
    1: "Pending",
    2: "Scheduled",
    3: "Completed",
    4: "Cancelled",
    5: "Rejected",
  };

  useEffect(() => {
    if (!patientId) return;

    const fetchAppointments = () => {
      axios
        .get(`http://localhost:5093/api/Appointment/byPatient/${patientId}`, {
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
          const lastAppt =
            pastCompleted.length > 0
              ? pastCompleted.reduce((a, b) =>
                  new Date(a.AppointmentDateTime) > new Date(b.AppointmentDateTime)
                    ? a
                    : b
                )
              : null;
          setLastVisit(lastAppt);
        })
        .catch(console.error);
    };

    fetchAppointments();

    if (location.state?.reloadAppointments) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [patientId, token, location.state?.reloadAppointments, navigate]);

  useEffect(() => {
    axios
      .get("http://localhost:5093/api/Doctor", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let docs = res.data?.["$values"] || [];
        setAllDoctors(docs);
      })
      .catch(console.error);
  }, [token]);

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
      alert("Please select a doctor.");
      return;
    }

    const dateTimeISO = new Date(
      `${bookingData.appointmentDate}T${bookingData.appointmentTime}`
    ).toISOString();

    const payload = {
      patientID: Number(patientId),
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
        axios
          .get(`http://localhost:5093/api/Appointment/byPatient/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            let appts = res.data;
            if (appts && appts.$values) appts = appts.$values;
            setAppointments(appts || []);
          });
      })
      .catch((err) => {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to book appointment.");
      }
    });
  };

  return (
    <div className="admin-dashboard-wrapper d-flex flex-column flex-md-row vh-100">
      <nav className="admin-sidebar p-3 flex-shrink-0 d-none d-md-block">
        <div className="sidebar-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h3 className="mb-4">AmazeCare Patient</h3>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/patient-dashboard" className="nav-link active">
              <FaHome className="me-2" /> Overview
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/doctors" className="nav-link">
              <FaUserMd className="me-2" /> Doctors
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/records" className="nav-link">
              <FaFileMedical className="me-2" /> Medical Records
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/prescriptions" className="nav-link">
              <FaPrescriptionBottleAlt className="me-2" /> Prescriptions
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/patient/billings" className="nav-link">
              <FaCreditCard className="me-2" /> Billing
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex-grow-1 d-flex flex-column">
        <Navbar bg="light" className="shadow-sm px-3 px-md-4 py-3 d-none d-md-flex admin-navbar">
          <Navbar.Brand className="fw-bold">Overview</Navbar.Brand>
          <div className="ms-auto d-flex align-items-center gap-3">
            <FaUserCircle
              size={24}
              className="text-secondary cursor-pointer"
              title="Profile"
              onClick={goToProfile}
            />
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </Navbar>

        <main className="patient-main-content flex-grow-1 p-3 p-md-4 overflow-auto">
          <div className="d-flex align-items-center mb-4 justify-content-between flex-wrap gap-3">
            <h2 className="mb-0">Welcome, {username}</h2>
            <button
              className="btn btn-book"
              type="button"
              onClick={() => setShowBookingPanel(true)}
            >
              Book Appointment
            </button>
          </div>

          {showBookingPanel && (
            <div className="booking-panel p-4 rounded" style={{ maxWidth: '500px', margin: '20px auto' }}>
              <h3>Book Appointment</h3>
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
                  <button type="submit" className="btn btn-book">
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleBookingCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <Row className="dashboard-cards g-3 mb-4">
            <Col xs={12} md={4}>
              <Card className="h-100 shadow-sm text-center gradient-card card-next-appointment">
                <Card.Body>
                  <FaCalendarAlt size={20} className="mb-3 icon-white" />
                  <Card.Title>Upcoming Appointment</Card.Title>
                  <Card.Text>
                    {upcomingAppointment
                      ? `${upcomingAppointment.Doctor?.Name || "N/A"} - ${new Date(
                          upcomingAppointment.AppointmentDateTime
                        ).toLocaleDateString()}`
                      : "No upcoming appointment"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={4}>
              <Card className="h-100 shadow-sm text-center gradient-card card-recent-visit">
                <Card.Body>
                  <FaFileMedical size={20} className="mb-3 icon-white" />
                  <Card.Title>Last Visit</Card.Title>
                  <Card.Text>
                    {lastVisit
                      ? `${new Date(lastVisit.AppointmentDateTime).toLocaleDateString()} - ${
                          lastVisit.VisitReason || "N/A"
                        }`
                      : "No past visits found"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <section>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Appointments</Card.Title>
                <div className="table-responsive mt-3">
            <table className="table appointments-table">
                    <thead className="color-table">
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Doctor</th>
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

                          const doctorName = appt.Doctor?.Name || "N/A";
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
                              <td>{doctorName}</td>
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

export default PatientDashboard;
