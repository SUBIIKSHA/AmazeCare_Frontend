import React, { useEffect, useState } from "react";
import axios from "axios";

const masterTests = [
  {
    testID: 1,
    testName: "Blood Test",
    price: 300.00,
    instructions: "Fasting recommended for accurate results"
  },
  {
    testID: 2,
    testName: "X-Ray",
    price: 500.00,
    instructions: "Remove any metal objects before test"
  },
  {
    testID: 3,
    testName: "MRI",
    price: 2500.00,
    instructions: "Inform technician if you have metal implants"
  },
  {
    testID: 4,
    testName: "ECG",
    price: 400.00,
    instructions: "Stay still and relaxed during the procedure"
  },
  {
    testID: 5,
    testName: "CT Scan",
    price: 2000.00,
    instructions: "Contrast dye may be used"
  },
  {
    testID: 6,
    testName: "Urine Test",
    price: 100.00,
    instructions: "Use the first morning sample"
  },
  {
    testID: 7,
    testName: "Liver Function Test",
    price: 800.00,
    instructions: "Avoid alcohol 24 hours before test"
  },
  {
    testID: 8,
    testName: "Thyroid Test",
    price: 600.00,
    instructions: "No special preparation needed"
  }
];

const AdminRecommendedTests = () => {
  const [recommendedTests, setRecommendedTests] = useState([]);
  const [formData, setFormData] = useState({ prescriptionID: "", testID: "" });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const token = sessionStorage.getItem("token");

  // Fetch recommended tests
  const fetchRecommendedTests = () => {
    setLoading(true);
    axios
      .get("http://localhost:5093/api/RecommendedTest", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRecommendedTests(res.data?.["$values"] || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setFeedback({ type: "error", message: "Failed to load recommended tests." });
      });
  };

  useEffect(() => {
    fetchRecommendedTests();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (!formData.prescriptionID || !formData.testID) {
      setFeedback({ type: "error", message: "Both Prescription ID and Test must be selected." });
      return;
    }
    setLoading(true);
    axios
      .post("http://localhost:5093/api/RecommendedTest", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchRecommendedTests();
        setFormData({ prescriptionID: "", testID: "" });
        setFeedback({ type: "success", message: "Recommended test added." });
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: "error", message: "Failed to add recommended test." });
        setLoading(false);
      });
  };

  // Returns master test details for a given testID
  const getTestDetails = (testID) => {
    return masterTests.find(test => test.testID === testID) || {};
  };

  return (
    <div className="admin-dashboard-wrapper d-flex vh-100 text-center">
      <main className="admin-main-content flex-grow-1 p-4 overflow-auto">
        <header className="mb-4">
          <h2>Recommended Tests</h2>
        </header>

        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        <form onSubmit={submitForm} className="mb-4" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <input
            type="number"
            name="prescriptionID"
            placeholder="Prescription ID"
            value={formData.prescriptionID}
            onChange={handleInputChange}
            disabled={loading}
            required
            className="form-control mb-2"
          />

          <select
            name="testID"
            value={formData.testID}
            onChange={handleInputChange}
            disabled={loading}
            required
            className="form-control mb-2"
          >
            <option value="">Select Test</option>
            {masterTests.map((test) => (
              <option key={test.testID} value={test.testID}>
                {test.testName}
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading} className="btn btn-primary w-100">
            Add Recommended Test
          </button>
        </form>

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Recommended Test ID</th>
              <th>Prescription ID</th>
              <th>Test ID</th>
              <th>Test Name</th>
              <th>Price</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {recommendedTests.map((rt) => {
              const details = getTestDetails(rt.testID);
              return (
                <tr key={rt.recommendedTestID}>
                  <td>{rt.recommendedTestID}</td>
                  <td>{rt.prescriptionID}</td>
                  <td>{rt.testID}</td>
                  <td>{details.testName || rt.testName}</td>
                  <td>{details.price}</td>
                  <td>{details.instructions}</td>
                </tr>
              );
            })}
            {recommendedTests.length === 0 && !loading && (
              <tr>
                <td colSpan="6">No recommended tests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminRecommendedTests;
