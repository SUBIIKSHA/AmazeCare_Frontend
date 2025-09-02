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

const GENDER_MAP = {
  1: "Male",
  2: "Female",
  3: "Other",
};
const gradientButtonStyle = {
  background: "linear-gradient(90deg,#006cff 0%,#10c0c6 100%)",
  color: "#fff",
  border: "none",
};

const PatientProfile = ({ patientId }) => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: "",
    dob: "",
    genderID: "",
    bloodGroup: "",
    contactNumber: "",
    address: "",
    userName: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [isEditing, setIsEditing] = useState(false);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!patientId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5093/api/Patient/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data) {
          setProfile({
            fullName: response.data.fullName || "",
            dob: response.data.dob || "",
            genderID: response.data.genderID || "",
            bloodGroup: response.data.bloodGroup || "",
            contactNumber: response.data.contactNumber || "",
            address: response.data.address || "",
            userName: response.data.userName || "",
          });
        }
      } catch (error) {
        console.error("Error fetching patient profile:", error);
        setMessage({ text: "Failed to load profile.", variant: "danger" });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [patientId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: "", variant: "" });

    try {
      await axios.put(
        `http://localhost:5093/api/Patient/${patientId}`,
        profile,
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
    <div style={{ backgroundColor: "#3c78b4ff", minHeight: "100vh", paddingTop: "30px", paddingBottom: "30px" }}>
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
  onClick={() => navigate("/patient-dashboard")}
>
  <FaArrowLeft className="me-2" size={14} />  
  Back to Dashboard
</Button>

      <Container className="mb-5" style={{ maxWidth: "720px", marginTop: "50px" }}>
        <Card className="shadow-sm rounded-4 border-0">
          <Card.Body className="p-4">
            <div className="mb-3" >
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
                <h4 className="fw-bold mb-1">{profile.fullName || "Patient Name"}</h4>
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
                    <div className="fw-semibold text-muted mb-1">Full Name</div>
                    <div>{profile.fullName}</div>
                  </Card>
                </Col>
                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Date of Birth</div>
                    <div>{profile.dob ? profile.dob.slice(0, 10) : ""}</div>
                  </Card>
                </Col>
                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Gender</div>
                    <div>{GENDER_MAP[profile.genderID] || "Unknown"}</div>
                  </Card>
                </Col>
                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Blood Group</div>
                    <div>{profile.bloodGroup}</div>
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
                    <div className="fw-semibold text-muted mb-1">Username</div>
                    <div>{profile.userName}</div>
                  </Card>
                </Col>
                <Col xs={12}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Address</div>
                    <div>{profile.address}</div>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Form>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="fullName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="dob">
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="dob"
                      value={profile.dob ? profile.dob.slice(0, 10) : ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="genderID">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="genderID"
                      value={profile.genderID}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="1">Male</option>
                      <option value="2">Female</option>
                      <option value="3">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group as={Col} controlId="bloodGroup">
                    <Form.Label>Blood Group</Form.Label>
                    <Form.Control
                      type="text"
                      name="bloodGroup"
                      value={profile.bloodGroup}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="contactNumber">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNumber"
                    value={profile.contactNumber}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    className="me-2 rounded-pill px-4"
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

export default PatientProfile;
