import React, { useState, forwardRef, useImperativeHandle } from "react";

const ComparisonReport = forwardRef((props, ref) => {
  const [comparisons, setComparisons] = useState([]);

  useImperativeHandle(ref, () => ({
    addComparison(cipherName, encryptedData, startTime, endTime) {
      const timeTaken = (endTime - startTime).toFixed(2);
      const outputSize = encryptedData.length;

      let securityLevel = "";
      if (cipherName === "AES") securityLevel = "Very High";
      else if (cipherName === "DES") securityLevel = "Moderate";
      else if (cipherName === "Affine Cipher") securityLevel = "Very Low";
      else if (cipherName === "Caesar Cipher") securityLevel = "Very Low";

      setComparisons((prev) => [
        ...prev,
        { cipherName, timeTaken, outputSize, securityLevel },
      ]);
    },
  }));

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h2 style={{ marginBottom: "20px" }}>Comparison Report</h2>
      {comparisons.length === 0 ? (
        <p>No data to compare yet. Encrypt files to see results here.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Cipher Name</th>
              <th style={thStyle}>Time Taken (ms)</th>
              <th style={thStyle}>Output Size (chars)</th>
              <th style={thStyle}>Security Level</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((item, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{item.cipherName}</td>
                <td style={tdStyle}>{item.timeTaken}</td>
                <td style={tdStyle}>{item.outputSize}</td>
                <td style={tdStyle}>{item.securityLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
});

export default ComparisonReport;

const thStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  backgroundColor: "#f5f5f5",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "center",
};
