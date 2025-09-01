import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import AdminDashboard from './Components/Dashboard/Admin/AdminDashboard';
import DoctorDashboard from './Components/Dashboard/Doctor/DoctorDashboard';
import PatientDashboard from './Components/Dashboard/Patient/PatientDashboard';
import PatientDoctors from './Components/Dashboard/Patient/PatientDoctors';
import PatientRecords from './Components/Dashboard/Patient/PatientRecords';
import PatientBillings from './Components/Dashboard/Patient/PatientBillings';
import PatientPrescriptions from './Components/Dashboard/Patient/PatientPrescriptions';
import AdminDoctors from './Components/Dashboard/Admin/AdminDoctors';
import AdminPatients from './Components/Dashboard/Admin/AdminPatients';
import AdminAppointments from './Components/Dashboard/Admin/AdminAppointments';
import AdminRecords from './Components/Dashboard/Admin/AdminRecords';
import AdminPrescriptions from './Components/Dashboard/Admin/AdminPrescriptions';
import AdminBillings from './Components/Dashboard/Admin/AdminBillings';
import AdminTests from './Components/Dashboard/Admin/AdminTests';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/patients" element={<AdminPatients />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/records" element={<AdminRecords />} />
        <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />
        <Route path="/admin/billings" element={<AdminBillings />} />
        <Route path="/admin/tests" element={<AdminTests />} />

        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient/doctors" element={<PatientDoctors />} />
        <Route path="/patient/records" element={<PatientRecords />} />
        <Route path="/patient/billings" element={<PatientBillings />} />
        <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
