import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
} from "react-bootstrap";
import { FaEdit, FaUserCircle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const gradientButtonStyle = {
  background: "linear-gradient(90deg,#006cff 0%,#10c0c6 100%)",
  color: "#fff",
  border: "none",
};

const AdminProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    userName: "admin",
    email: "admin@amazecare.com",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setMessage({ text: "Profile updated.", variant: "success" });
    setIsEditing(false);
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
        onClick={() => navigate("/admin-dashboard")}
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
                <h4 className="fw-bold mb-1">{profile.userName}</h4>
                <div className="text-muted">{profile.email}</div>
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

            {!isEditing ? (
              <Row className="gy-3">
                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Username</div>
                    <div>{profile.userName}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="p-3 shadow-sm rounded-3">
                    <div className="fw-semibold text-muted mb-1">Email</div>
                    <div>{profile.email}</div>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Form>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="userName">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="userName"
                      value={profile.userName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Row>

                <div className="d-flex justify-content-end">
                    <Button
                    variant="primary"
                    className=" me-2 rounded-pill px-4"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    className=" rounded-pill px-4"
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

export default AdminProfile;
