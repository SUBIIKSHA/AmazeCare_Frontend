import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";
import axios from "axios";
import { Link } from 'react-router-dom';
import { FaUserMd, FaUsers, FaCalendarAlt, FaFileAlt, FaFileMedical, FaVial, FaMoneyBillWave, FaClock, FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:5093/api/Doctor", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:5093/api/Patient", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:5093/api/Appointment/all", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:5093/api/MedicalRecord", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:5093/api/Prescription", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:5093/api/RecommendedTest", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:5093/api/Billing", {
        headers: { Authorization: `Bearer ${token}` }
      }),
    ])
      .then(([
        doctorsRes, patientsRes, appointmentsRes,
        medicalRecordsRes, prescriptionsRes, testsRes, billingsRes
      ]) => {
        const doctors = doctorsRes.data?.["$values"] || [];
        const patients = patientsRes.data?.["$values"] || [];
        const rawAppointments = appointmentsRes.data?.["$values"] || [];
        const medicalRecords = medicalRecordsRes.data?.["$values"] || [];
        const prescriptions = prescriptionsRes.data?.["$values"] || [];
        const tests = testsRes.data?.["$values"] || [];
        const billings = billingsRes.data?.["$values"] || [];

        const formattedAppointments = rawAppointments.map(appt => ({
        id: appt.appointmentID,
        status: appt.status ? appt.status.toUpperCase() : "UNKNOWN",
        patientName: appt.patientName || "Unknown Patient",
        type: appt.visitReason || "General",
        date: appt.appointmentDateTime
          ? new Date(appt.appointmentDateTime).toLocaleDateString()
          : "Invalid Date",
        time: appt.appointmentDateTime
          ? new Date(appt.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "Invalid Time",
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

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
      <nav className="admin-sidebar d-flex flex-column p-3">
        <h3 className="mb-4">AmazeCare Admin</h3>
        <ul className="nav flex-column">
          <li className="nav-item mb-2"><Link to="/admin-dashboard" className="nav-link active">Dashboard</Link></li>
          <li className="nav-item mb-2"><Link to="/admin/doctors" className="nav-link">Doctors</Link></li>
          <li className="nav-item mb-2"><a href="/admin/patients" className="nav-link">Patients</a></li>
          <li className="nav-item mb-2"><a href="/admin/appointments" className="nav-link">Appointments</a></li>
          <li className="nav-item mb-2"><a href="/admin/records" className="nav-link">Records</a></li>
          <li className="nav-item mb-2"><a href="#settings" className="nav-link">Settings</a></li>
        </ul>
      </nav>

      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Dashboard Overview</h2>
          <div className="d-flex align-items-center gap-3">
            <FaBell size={24} className="text-secondary cursor-pointer" title="Notifications" />
            <FaUserCircle size={24} className="text-secondary cursor-pointer" title="Profile" />
            <button className="btn btn-outline-danger d-flex align-items-center gap-2">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        <section className="dashboard-cards row g-4 mb-4">
          <div className="col-md-3">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body d-flex flex-column align-items-center">
                <FaUserMd size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Doctors</h5>
                <p className="card-text">{stats.doctorsCount} registered</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body d-flex flex-column align-items-center">
                <FaUsers size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Patients</h5>
                <p className="card-text">{stats.patientsCount} registered</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body d-flex flex-column align-items-center">
                <FaCalendarAlt size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Total Appointments</h5>
                <p className="card-text">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body d-flex flex-column align-items-center">
                <FaClock size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Pending Appointments</h5>
                <p className="card-text">{stats.pendingAppointments}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-cards row g-4 mb-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body">
                <FaFileAlt size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Recent Medical Records</h5>
                <p className="card-text">{stats.recentMedicalRecords} new records</p>
                <button className="btn btn-primary">View Records</button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body">
              <FaFileMedical size={20} className="mb-3 text-primary" />
              <h5 className="card-title">Prescriptions Issued</h5>
              <p className="card-text">{stats.prescriptionsIssued} total</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/admin/prescriptions")}
              >
                View Prescriptions
              </button>
            </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body">
                <FaVial size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Recommended Tests</h5>
                <p className="card-text">{stats.recommendedTests} pending</p>
                <button className="btn btn-primary"
                onClick={() => navigate("/admin/tests")}>View Tests</button>
              </div>
            </div>
          </div>
        </section>

        <section className="billing-overview mb-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between">
              <div className="text-center">
                <FaMoneyBillWave size={20} className="mb-3 text-primary" />
                <h5 className="card-title">Billing Overview</h5>
                <p>Total Revenue: ${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <button className="btn btn-primary align-self-center" onClick={() => navigate("/admin/billings")}>View Billing</button>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section className="dashboard-analytics row g-4 mb-4">
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Weekly Appointments</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[
                    { date: 'Mon', appointments: 3 },
                    { date: 'Tue', appointments: 5 },
                    { date: 'Wed', appointments: 7 },
                    { date: 'Thu', appointments: 4 },
                    { date: 'Fri', appointments: 6 },
                    { date: 'Sat', appointments: 2 },
                    { date: 'Sun', appointments: 1 },
                  ]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="appointments" stroke="#0049b7" strokeWidth={3} />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Monthly Revenue</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { month: 'Jan', revenue: 2400 },
                    { month: 'Feb', revenue: 1398 },
                    { month: 'Mar', revenue: 9800 },
                    { month: 'Apr', revenue: 3908 },
                    { month: 'May', revenue: 4800 },
                    { month: 'Jun', revenue: 3800 },
                    { month: 'Jul', revenue: 4300 },
                  ]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#06c0b8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center">Recent Appointments</h5>
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead className="color-table">
                    <tr>
                      <th>Patient Name</th>
                      <th>Appointment Type</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map(appt => (
                      <tr key={appt.id}>
                        <td>{appt.patientName}</td>
                        <td>{appt.type}</td>
                        <td>{appt.date}</td>
                        <td>{appt.time}</td>
                        <td>{appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}</td>
                      </tr>
                    ))}
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
