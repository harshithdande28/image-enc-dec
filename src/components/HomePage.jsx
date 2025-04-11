// HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    fontFamily: "Roboto, Arial, sans-serif",
    padding: "20px"
  };

  const cardStyle = {
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: "40px",
    margin: "20px",
    maxWidth: "700px",
    width: "100%",
    textAlign: "center"
  };

  const logoStyle = {
    fontSize: "64px",
    fontWeight: "bold",
    color: "#4285F4",
    marginBottom: "10px"
  };

  const welcomeStyle = {
    fontSize: "24px",
    fontWeight: "normal",
    color: "#202124",
    marginBottom: "20px"
  };

  const descriptionStyle = {
    fontSize: "16px",
    color: "#5F6368",
    lineHeight: "1.6",
    marginBottom: "30px"
  };

  const linkContainerStyle = {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "20px"
  };

  const linkStyle = {
    padding: "12px 24px",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#fff",
    backgroundColor: "#4285F4",
    fontSize: "16px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>Encryption Hub</div>
        <div style={welcomeStyle}>
          Welcome to the File Encryption Portal
        </div>
        <div style={descriptionStyle}>
          Secure your files with a variety of encryption techniques. Our application
          supports four ciphers:
          <br /><br />
          <strong>AES:</strong> A modern, secure standard for data encryption.
          <br />
          <strong>DES:</strong> A classic algorithm that laid the groundwork for encryption.
          <br />
          <strong>Caesar Cipher:</strong> A simple byte-shift technique adapted for images.
          <br />
          <strong>Affine Cipher:</strong> Combines multiplication and addition modulo 256.
        </div>
        <div style={linkContainerStyle}>
          <Link to="/aes" style={linkStyle}>
            AES Encryption
          </Link>
          <Link to="/des" style={linkStyle}>
            DES Encryption
          </Link>
          <Link to="/caesar" style={linkStyle}>
            Caesar Cipher
          </Link>
          <Link to="/affine" style={linkStyle}>
            Affine Cipher
          </Link>
        </div>
      </div>
    </div>
  );
}
