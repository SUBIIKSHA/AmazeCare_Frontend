import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserMd, FaUsers, FaCalendarAlt, FaFileAlt, FaFileMedical,
  FaVial, FaMoneyBillWave, FaClock, FaBell, FaUserCircle, FaSignOutAlt, FaCog,
  FaEdit, FaTrash
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Logo from '../../../Images/Logo.png';

const AdminBillings = () => {
  const navigate = useNavigate();
  const [billings, setBillings] = useState([]);
  const [activePanel, setActivePanel] = useState(null); 
  const [formData, setFormData] = useState({
    appointmentID: "",
    billingDate: "",
    statusID: "",
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = () => {
    setLoading(true);
    axios.get("http://localhost:5093/api/Billing", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setBillings(res.data?.["$values"] || res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setFeedback({ type: "error", message: "Failed to fetch billing records." });
      });
  };

  const fetchByDateRange = () => {
    if (!dateFrom || !dateTo) {
      setFeedback({ type: "error", message: "Please select both From and To dates." });
      return;
    }
    setLoading(true);
    axios.get(`http://localhost:5093/api/Billing/date-range?from=${dateFrom}&to=${dateTo}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setBillings(res.data?.["$values"] || res.data || []);
        setLoading(false);
        setFeedback({ type: "success", message: `Loaded billing records from ${dateFrom} to ${dateTo}.` });
      })
      .catch(() => {
        setLoading(false);
        setFeedback({ type: "error", message: "Failed to load billing records for date range." });
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitForm = (e) => {
    e.preventDefault();
    setLoading(true);

    const billingDateTime = formData.billingDate ? new Date(formData.billingDate).toISOString() : null;

    const payload = {
      ...formData,
      billingDate: billingDateTime,
    };

    axios.post("http://localhost:5093/api/Billing", payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        fetchBillings();
        setActivePanel(null);
        setFormData({
          appointmentID: "",
          billingDate: "",
          statusID: "",
        });
        setFeedback({ type: "success", message: "Billing record added successfully." });
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: "error", message: "Failed to add billing record." });
        setLoading(false);
      });
  };

  const cancelAddOrFilter = () => {
    setActivePanel(null);
    setFormData({
      appointmentID: "",
      billingDate: "",
      statusID: "",
    });
    setDateFrom("");
    setDateTo("");
    setFeedback(null);
    fetchBillings(); 
  };

  const handleEdit = (billingID) => {
  };

  const handleDelete = (billingID) => {
  };

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
      <nav className="admin-sidebar d-flex flex-column p-3">
        <div className="sidebar-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h3 className="mb-4">AmazeCare Admin</h3>
        <ul className="nav flex-column ">
          <li className="nav-item mb-2" >
            <Link to="/admin-dashboard" className="nav-link active">
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
          <h2>Billing</h2>
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

        <div style={{ display: "flex", justifyContent: "flex-end" }} className="mb-4">
          <button
            className={`btn btn-outline-primary me-2${activePanel === "filter" ? " active" : ""}`}
            onClick={() => setActivePanel(activePanel === "filter" ? null : "filter")}
            disabled={loading}
            type="button"
          >
            Filter by Date Range
          </button>
          <button
            className={`btn btn-outline-success${activePanel === "add" ? " active" : ""}`}
            onClick={() => setActivePanel(activePanel === "add" ? null : "add")}
            disabled={loading}
            type="button"
          >
            Add Billing
          </button>
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        {activePanel === "filter" && (
          <div className="date-filter-section mb-4 d-flex align-items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="form-control"
              placeholder="From date"
              disabled={loading}
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="form-control"
              placeholder="To date"
              disabled={loading}
            />
            <button onClick={fetchByDateRange} className="btn btn-primary" disabled={loading}>Filter</button>
            <button onClick={cancelAddOrFilter} className="btn btn-secondary" disabled={loading}>Clear</button>
          </div>
        )}

        {activePanel === "add" && (
          <form onSubmit={submitForm} className="billing-form mb-4" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <input
              type="number"
              name="appointmentID"
              placeholder="Appointment ID"
              value={formData.appointmentID}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
              required
            />
            <input
              type="date"
              name="billingDate"
              placeholder="Billing Date"
              value={formData.billingDate}
              onChange={handleInputChange}
              disabled={loading}
              className="form-control mb-2"
              required
            />
            <select
              name="statusID"
              value={formData.statusID}
              onChange={handleInputChange}
              disabled={loading}
              required
              className="form-control mb-2"
            >
              <option value="">Select Status</option>
              <option value="1">Pending</option>
              <option value="2">Paid</option>
              <option value="3">Cancelled</option>
              <option value="4">Refunded</option>
            </select>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary me-2"
              >
                Add Billing
              </button>
              <button
                type="button"
                onClick={cancelAddOrFilter}
                disabled={loading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="billing-list">
          {loading && <p>Loading billing records...</p>}
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Billing ID</th>
                <th>Patient ID</th>
                <th>Appointment ID</th>
                <th>Billing Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th> 
              </tr>
            </thead>
            <tbody>
              {billings.map(bill => (
                <tr key={bill.billingID}>
                  <td>{bill.billingID}</td>
                  <td>{bill.patientID}</td>
                  <td>{bill.appointmentID}</td>
                  <td>{bill.billingDate?.slice(0, 10)}</td>
                  <td>{bill.totalAmount}</td>
                  <td>{bill.statusName}</td>
                  <td>
                    <button className="btn btn-link p-0 me-2" aria-label="Edit">
                      <FaEdit />
                    </button>
                    <button className="btn btn-link p-0 text-danger" aria-label="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {billings.length === 0 && !loading && (
                <tr>
                  <td colSpan="7">No billing records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminBillings;
