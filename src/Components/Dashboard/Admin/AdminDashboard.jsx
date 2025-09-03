import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserMd, FaUsers, FaCalendarAlt, FaFileAlt, FaFileMedical,
  FaVial, FaMoneyBillWave, FaClock, FaBell, FaUserCircle, FaSignOutAlt, FaTimes, FaBars, FaCog
} from "react-icons/fa";
import React, { useState, useEffect } from "react";
import Logo from '../../../Images/Logo.png';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    doctorsCount: 0,
    patientsCount: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    recentMedicalRecords: 0,
    prescriptionsIssued: 0,
    recommendedTests: 0,
    totalRevenue: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const token = sessionStorage.getItem("token");
  const goToProfile = () => {
    navigate("/profile");
    // Optionally close sidebar on profile click if on small screen
    setSidebarOpen(false);
  };

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:5093/api/Doctor", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5093/api/Patient", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5093/api/Appointment/all", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5093/api/MedicalRecord", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5093/api/Prescription", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5093/api/RecommendedTest", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5093/api/Billing", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([doctorsRes, patientsRes, appointmentsRes, medicalRecordsRes, prescriptionsRes, testsRes, billingsRes]) => {
        const doctors = doctorsRes.data?.["$values"] || doctorsRes.data || [];
        const patients = patientsRes.data?.["$values"] || patientsRes.data || [];
        const rawAppointments = appointmentsRes.data?.["$values"] || appointmentsRes.data || [];
        const medicalRecords = medicalRecordsRes.data?.["$values"] || medicalRecordsRes.data || [];
        const prescriptions = prescriptionsRes.data?.["$values"] || prescriptionsRes.data || [];
        const tests = testsRes.data?.["$values"] || testsRes.data || [];
        const billings = billingsRes.data?.["$values"] || billingsRes.data || [];

        const formattedAppointments = rawAppointments.map(appt => ({
          id: appt.appointmentID,
          status: appt.status ? appt.status.toUpperCase() : "UNKNOWN",
          patientName: appt.patientName || "Unknown Patient",
          type: appt.visitReason || "General",
          date: appt.appointmentDateTime ? new Date(appt.appointmentDateTime).toLocaleDateString() : "Invalid Date",
          time: appt.appointmentDateTime ? new Date(appt.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time",
        }));

        const totalAppointments = formattedAppointments.length;
        const pendingAppointments = formattedAppointments.filter(a => a.status === "PENDING").length;

        const recentAppts = formattedAppointments
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        const totalRevenue = billings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        setStats({
          doctorsCount: doctors.length,
          patientsCount: patients.length,
          totalAppointments,
          pendingAppointments,
          recentMedicalRecords: medicalRecords.length,
          prescriptionsIssued: prescriptions.length,
          recommendedTests: tests.length,
          totalRevenue,
        });

        setRecentAppointments(recentAppts);
      })
      .catch(error => {
        console.error("Error loading dashboard data:", error);
      });
  }, [token]);

  // Optional: close sidebar on window resize >= 992 to avoid sidebar stuck open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">

      {/* Sidebar */}
      <nav className={`admin-sidebar p-3 ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h3 className="mb-4">AmazeCare Admin</h3>
        <ul className="nav flex-column ">
          <li className="nav-item mb-2" >
            <Link to="/admin-dashboard" className="nav-link active" onClick={() => setSidebarOpen(false)}>
              <FaFileAlt className="me-2" /> Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/doctors" className="nav-link" onClick={()=>setSidebarOpen(false)}>
              <FaUserMd className="me-2" /> Doctors
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/patients" className="nav-link" onClick={()=>setSidebarOpen(false)}>
              <FaUsers className="me-2" /> Patients
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/appointments" className="nav-link" onClick={()=>setSidebarOpen(false)}>
              <FaCalendarAlt className="me-2" /> Appointments
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/profile" className="nav-link" onClick={() => { setSidebarOpen(false); navigate("/admin/profile"); }}>
              <FaCog className="me-2" /> Settings
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="admin-header d-flex justify-content-between align-items-center mb-4 px-3 py-2">
          <div className="d-flex align-items-center gap-3">
            {/* Sidebar Toggle Button on small screens */}
            <button
              className="btn btn-light d-lg-none p-2 rounded-circle shadow-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <h2 className="fw-bold m-0">Dashboard Overview</h2>
          </div>

          <div className="d-flex align-items-center gap-4">
            <FaUserCircle
              size={24}
              className="text-secondary cursor-pointer"
              title="Profile"
              onClick={goToProfile}
            />
            <button
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2 px-3 py-1 flex-shrink-0"
              onClick={() => { setSidebarOpen(false); navigate("/login"); }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        {/* Dashboard cards */}
        <section className="dashboard-cards row g-4 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body d-flex flex-column align-items-center">
                <FaUserMd size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Doctors</h5>
                <p className="card-text">{stats.doctorsCount} registered</p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body d-flex flex-column align-items-center">
                <FaUsers size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Patients</h5>
                <p className="card-text">{stats.patientsCount} registered</p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body d-flex flex-column align-items-center">
                <FaCalendarAlt size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Total Appointments</h5>
                <p className="card-text">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body d-flex flex-column align-items-center">
                <FaClock size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Pending Appointments</h5>
                <p className="card-text">{stats.pendingAppointments}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Other cards */}
        <section className="dashboard-cards row g-4 mb-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body">
                <FaFileAlt size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Recent Medical Records</h5>
                <p className="card-text">{stats.recentMedicalRecords} new records</p>
                <button className="btn btn-primary" onClick={() => { setSidebarOpen(false); navigate("/admin/records"); }}>
                  View Records
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body">
                <FaFileMedical size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Prescriptions Issued</h5>
                <p className="card-text">{stats.prescriptionsIssued} total</p>
                <button className="btn btn-primary" onClick={() => { setSidebarOpen(false); navigate("/admin/prescriptions"); }}>
                  View Prescriptions
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body">
                <FaVial size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Tests</h5>
                <p className="card-text">{stats.recommendedTests} total</p>
                <button className="btn btn-primary" onClick={() => { setSidebarOpen(false); navigate("/admin/tests"); }}>
                  View Tests
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Billing Overview */}
        <section className="billing-overview mb-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="text-center mb-3 mb-md-0">
                <FaMoneyBillWave size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Billing Overview</h5>
                <p>Total Revenue: ${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setSidebarOpen(false); navigate("/admin/billings"); }}>
                View Billing
              </button>
            </div>
          </div>
        </section>

        {/* Recent Appointments */}
        <section>
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center">Recent Appointments</h5>
              <div className="table-responsive">
                <table className="table appointments-table">
                  <thead className="color-table">
                    <tr>
                      <th>ID</th>
                      <th>Patient Name</th>
                      <th>Appointment Type</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map(appt => {
                      let statusClass = "badge ";
                      switch (appt.status) {
                        case "PENDING":
                          statusClass += "status-pending";
                          break;
                        case "COMPLETED":
                          statusClass += "status-completed";
                          break;
                        case "CANCELLED":
                          statusClass += "status-cancelled";
                          break;
                        case "SCHEDULED":
                          statusClass += "status-scheduled";
                          break;
                        case "REJECTED":
                          statusClass += "status-rejected";
                          break;
                        default:
                          statusClass += "bg-secondary";
                      }

                      return (
                        <tr key={appt.id}>
                          <td>{appt.id}</td>
                          <td>{appt.patientName}</td>
                          <td>{appt.type}</td>
                          <td>{appt.date}</td>
                          <td>{appt.time}</td>
                          <td>
                            <span className={statusClass}>
                              {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;
