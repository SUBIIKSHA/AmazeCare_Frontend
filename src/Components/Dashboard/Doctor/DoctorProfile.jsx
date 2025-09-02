import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Form,
} from "react-bootstrap";
import { FaEdit, FaUserCircle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const gradientButtonStyle = {
  background: "linear-gradient(90deg,#006cff 0%,#10c0c6 100%)",
  color: "#fff",
  border: "none",
};

const DoctorProfile = ({ doctorId }) => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    specializationName: "",
    experience: "",
    contactNumber: "",
    qualificationName: "",
    designation: "",
    userName: "",
  });

  const [specializations, setSpecializations] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [isEditing, setIsEditing] = useState(false);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const res = await axios.get("http://localhost:5093/api/Doctor/form-data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSpecializations(res.data.specializations?.["$values"] || res.data.specializations || []);
        setQualifications(res.data.qualifications?.["$values"] || res.data.qualifications || []);
      } catch (error) {
        console.error("Failed to fetch form data:", error);
      }
    };

    fetchFormData();
  }, [token]);

  useEffect(() => {
    if (!doctorId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5093/api/Doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data || {};

        const specializationName = specializations.find(
          (spec) => Number(spec.specializationID) === Number(data.specializationID)
        )?.specializationName || "";

        const qualificationName = qualifications.find(
          (qual) => Number(qual.qualificationID) === Number(data.qualificationID)
        )?.qualificationName || "";

        setProfile({
          name: data.name || "",
          specializationName,
          experience: data.experience || "",
          contactNumber: data.contactNumber || "",
          qualificationName,
          designation: data.designation || "",
          userName: data.userName || "",  
        });
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
        setMessage({ text: "Failed to load profile.", variant: "danger" });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [doctorId, token, specializations, qualifications]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: "", variant: "" });

    try {
      const saveData = {
        name: profile.name,
        specializationID: specializations.find(s => s.specializationName === profile.specializationName)?.specializationID || null,
        experience: profile.experience,
        contactNumber: profile.contactNumber,
        qualificationID: qualifications.find(q => q.qualificationName === profile.qualificationName)?.qualificationID || null,
        designation: profile.designation,
        userName: profile.userName,   
      };

      await axios.put(
        `http://localhost:5093/api/Doctor/${doctorId}`,
        saveData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: "Profile updated successfully.", variant: "success" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ text: "Failed to update profile.", variant: "danger" });
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        backgroundColor: "#3c78b4ff",
        minHeight: "100vh",
        paddingTop: "30px",
        paddingBottom: "30px",
        position: "relative",
      }}
    >
      <Button
        style={{
          ...gradientButtonStyle,
          position: "absolute",
          top: "30px",
          left: "30px",
          zIndex: 10,
          borderRadius: "30px",
          padding: "6px 16px",
          fontWeight: 500,
          fontSize: "0.9rem",
          boxShadow: "0 2px 8px rgba(0,123,255,0.07)",
        }}
        onClick={() => navigate("/doctor-dashboard")}
      >
        <FaArrowLeft className="me-2" size={14} /> Back to Dashboard
      </Button>

      <Container className="mb-5" style={{ maxWidth: "720px", marginTop: "50px" }}>
        <Card className="shadow-sm rounded-4 border-0">
          <Card.Body className="p-4">
            <div className="mb-3">
              <h2 className="fw-bold text-primary mb-1">Profile Settings</h2>
              <p className="text-secondary mb-4" style={{ fontSize: "1.15rem" }}>
                Manage your personal information and keep your details up to date.
              </p>
            </div>

            <Row className="align-items-center mb-4 g-3">
              <Col xs="auto" className="text-center">
                <div
                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                  style={{
                    width: 90,
                    height: 90,
                    boxShadow: "0 0 8px rgba(0,123,255,0.3)",
                  }}
                >
                  <FaUserCircle size={60} className="text-white" />
                </div>
              </Col>

              <Col>
                <h4 className="fw-bold mb-1">{profile.name || "Doctor Name"}</h4>
                <div className="text-muted">{profile.userName || "Username"}</div>
              </Col>

              <Col xs="auto" className="text-center text-md-end">
                {!isEditing && (
                  <Button
                    variant="primary"
                    className="rounded-pill px-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="me-2" /> Edit
                  </Button>
                )}
              </Col>
            </Row>

            {message.text && (
              <Alert
                variant={message.variant}
                onClose={() => setMessage({ text: "", variant: "" })}
                dismissible
                className="mb-4"
              >
                {message.text}
              </Alert>
            )}

            {loading && (
              <div className="text-center my-3">
                <Spinner animation="border" role="status" />
              </div>
            )}

            {!isEditing ? (
              <Row className="gy-3">
                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Name</div>
                    <div>{profile.name}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Specialization</div>
                    <div>{profile.specializationName}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Experience (years)</div>
                    <div>{profile.experience}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Contact Number</div>
                    <div>{profile.contactNumber}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Qualification</div>
                    <div>{profile.qualificationName}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Designation</div>
                    <div>{profile.designation}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Username</div>
                    <div>{profile.userName}</div>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Form>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="specializationName">
                    <Form.Label>Specialization</Form.Label>
                    <Form.Control
                      type="text"
                      name="specializationName"
                      value={profile.specializationName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="experience">
                    <Form.Label>Experience (years)</Form.Label>
                    <Form.Control
                      type="number"
                      name="experience"
                      value={profile.experience}
                      onChange={handleChange}
                      min={0}
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="contactNumber">
                    <Form.Label>Contact Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="contactNumber"
                      value={profile.contactNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="qualificationName">
                    <Form.Label>Qualification</Form.Label>
                    <Form.Control
                      type="text"
                      name="qualificationName"
                      value={profile.qualificationName}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="designation">
                    <Form.Label>Designation</Form.Label>
                    <Form.Control
                      type="text"
                      name="designation"
                      value={profile.designation}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    className=" me-2 rounded-pill px-4"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-pill px-4"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default DoctorProfile;
