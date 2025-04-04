import React, { useState } from "react";
import Aes from "./Aes";
import Des from "./Des";
// import Substitution from "./Substitution"; // Uncomment if you have a substitution cipher component

export default function HomePage() {
  const [selectedEncryption, setSelectedEncryption] = useState(null);

  const handleSelection = (type) => {
    setSelectedEncryption(type);
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
    padding: "20px",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
  };

  const titleStyle = {
    fontSize: "32px",
    marginBottom: "16px",
    color: "#333",
    fontWeight: "bold",
  };

  const subtitleStyle = {
    fontSize: "18px",
    marginBottom: "24px",
    color: "#555",
  };

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    margin: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "#4a90e2",
    color: "white",
    transition: "background-color 0.3s ease",
  };

  // Updated Back button style for better visibility
  const backButtonStyle = {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#e74c3c",
    color: "white",
    zIndex: 10,
  };

  return (
    <div style={containerStyle}>
      {selectedEncryption ? (
        <div style={{ width: "100%", position: "relative" }}>
          <button
            style={backButtonStyle}
            onClick={() => setSelectedEncryption(null)}
          >
            &larr; Back
          </button>
          <div style={{ marginTop: "60px" }}>
            {selectedEncryption === "AES" && <Aes />}
            {selectedEncryption === "DES" && <Des />}
            {/* Uncomment the line below if you have a substitution cipher component */}
            {/* {selectedEncryption === "Substitution" && <Substitution />} */}
          </div>
        </div>
      ) : (
        <div style={cardStyle}>
          <h1 style={titleStyle}>File Encryption</h1>
          <p style={subtitleStyle}>Select encryption type:</p>
          <button style={buttonStyle} onClick={() => handleSelection("AES")}>
            AES Encryption
          </button>
          <button style={buttonStyle} onClick={() => handleSelection("DES")}>
            DES Encryption
          </button>
          {/* Uncomment if you have a substitution cipher option */}
          {/* <button style={buttonStyle} onClick={() => handleSelection("Substitution")}>
            Substitution Cipher
          </button> */}
        </div>
      )}
    </div>
  );
}
