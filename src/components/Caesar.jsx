import React, { useState, useEffect } from "react";
import Input from "./ui/Input";

// Encrypts an ArrayBuffer using a byte‑shift (Caesar cipher) for binary data.
function caesarEncryptBuffer(buffer, shift) {
  const bytes = new Uint8Array(buffer);
  const encryptedBytes = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    encryptedBytes[i] = (bytes[i] + shift) % 256;
  }
  return encryptedBytes;
}

// Decrypts an ArrayBuffer using a byte‑shift.
// (Decryption subtracts the shift; we add 256 before modding to avoid negatives.)
function caesarDecryptBuffer(buffer, shift) {
  const bytes = new Uint8Array(buffer);
  const decryptedBytes = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    decryptedBytes[i] = (bytes[i] - shift + 256) % 256;
  }
  return decryptedBytes;
}

export default function Caesar() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [encryptionShift, setEncryptionShift] = useState(""); // must be a number
  const [encryptedResults, setEncryptedResults] = useState([]);
  const [decryptionShift, setDecryptionShift] = useState("");
  const [decryptedResults, setDecryptedResults] = useState([]);

  // Automatically scroll to top after decryption
  useEffect(() => {
    if (decryptedResults.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [decryptedResults]);

  // Handle image file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setEncryptedResults([]);
    setDecryptedResults([]);
  };

  // Encrypt each selected image file using the Caesar cipher
  const encryptFiles = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one image file.");
      return;
    }
    if (encryptionShift === "" || isNaN(encryptionShift)) {
      alert("Please enter a valid numeric shift for encryption.");
      return;
    }
    const shift = parseInt(encryptionShift, 10) % 256;
    const results = [];
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result;
          const encryptedBytes = caesarEncryptBuffer(arrayBuffer, shift);
          // Create a Blob for the encrypted image
          const encryptedBlob = new Blob([encryptedBytes], { type: file.type });
          const encryptedUrl = URL.createObjectURL(encryptedBlob);
          results.push({
            fileName: file.name,
            encryptedUrl: encryptedUrl,
            fileType: file.type,
            // Store the encrypted bytes for decryption.
            encryptedBytes,
          });
          if (results.length === selectedFiles.length) {
            setEncryptedResults(results);
          }
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Decrypt a specific encrypted image file using the Caesar cipher
  const decryptFile = (result) => {
    if (decryptionShift === "" || isNaN(decryptionShift)) {
      alert("Please enter a valid numeric shift for decryption.");
      return;
    }
    const shift = parseInt(decryptionShift, 10) % 256;
    try {
      // Since we stored the encrypted bytes from the original read,
      // we can directly perform the decryption.
      const decryptedBytes = caesarDecryptBuffer(
        result.encryptedBytes.buffer,
        shift
      );
      const decryptedBlob = new Blob([decryptedBytes], {
        type: result.fileType,
      });
      const decryptedUrl = URL.createObjectURL(decryptedBlob);
      const decObj = { fileName: result.fileName, decryptedUrl: decryptedUrl };
      setDecryptedResults((prev) => [...prev, decObj]);
    } catch (error) {
      console.error("Decryption error", error);
      alert("Decryption failed. Please verify the shift value.");
    }
  };

  // Helper function to trigger the browser download for a file
  const downloadFile = (url, fileName) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Styling similar to AES and DES components
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    minHeight: "100vh",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    color: "#fff",
  };

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    maxWidth: "600px",
    width: "100%",
    marginBottom: "20px",
  };

  const headingStyle = {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "rgb(66, 133, 244)",
  };

  const inputStyle = {
    margin: "12px 0",
    padding: "12px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "6px",
    border: "1px solid #ccc",
    color: "black",
  };

  const buttonStyle = {
    padding: "12px 24px",
    margin: "12px 8px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#4a90e2",
    color: "#fff",
    transition: "background-color 0.3s ease",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Caesar Cipher Image Encryption</h1>
        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          style={inputStyle}
          accept="image/*"
        />
        <Input
          type="number"
          placeholder="Enter encryption shift (numeric)"
          value={encryptionShift}
          onChange={(e) => setEncryptionShift(e.target.value)}
          style={inputStyle}
        />
        <button style={buttonStyle} onClick={encryptFiles}>
          Encrypt Files
        </button>
      </div>
      {encryptedResults.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ ...headingStyle, fontSize: "28px", color: "#333" }}>
            Encrypted Results
          </h2>
          {encryptedResults.map((result, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "6px",
                backgroundColor: "#f9f9f9",
                textAlign: "left",
              }}
            >
              <strong>{result.fileName}</strong>
              <br />
              <button
                style={buttonStyle}
                onClick={() =>
                  downloadFile(
                    result.encryptedUrl,
                    result.fileName + "_encrypted"
                  )
                }
              >
                Download Encrypted File
              </button>
              <Input
                type="number"
                placeholder="Enter decryption shift (numeric)"
                value={decryptionShift}
                onChange={(e) => setDecryptionShift(e.target.value)}
                style={inputStyle}
              />
              <button style={buttonStyle} onClick={() => decryptFile(result)}>
                Decrypt
              </button>
            </div>
          ))}
        </div>
      )}
      {decryptedResults.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ ...headingStyle, fontSize: "28px", color: "#333" }}>
            Decrypted Images
          </h2>
          {decryptedResults.map((dec, idx) => (
            <div
              key={idx}
              style={{ marginBottom: "12px", textAlign: "center" }}
            >
              <strong>{dec.fileName}</strong>
              <br />
              <img
                src={dec.decryptedUrl}
                alt={dec.fileName}
                style={{ maxWidth: "100%", marginTop: "10px" }}
              />
              <br />
              <button
                style={buttonStyle}
                onClick={() =>
                  downloadFile(dec.decryptedUrl, dec.fileName + "_decrypted")
                }
              >
                Download Decrypted File
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
