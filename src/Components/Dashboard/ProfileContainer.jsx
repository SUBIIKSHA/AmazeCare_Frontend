import React from "react";
import DoctorProfile from "./Doctor/DoctorProfile";
import PatientProfile from "./Patient/PatientProfile";
import AdminProfile from "./Admin/AdminProfile";
const ProfileContainer = () => {
  const role = sessionStorage.getItem("role"); 
  const patientId = sessionStorage.getItem("patientID");
  const doctorId = sessionStorage.getItem("doctorID");

  switch (role) {
    case "patient":
      return <PatientProfile patientId={patientId} />;
    case "doctor":
      return <DoctorProfile doctorId={doctorId} />;
    case "admin":
      return <AdminProfile />; 
    default:
      return <p>User role not recognized</p>;
  }
};
export default ProfileContainer;
