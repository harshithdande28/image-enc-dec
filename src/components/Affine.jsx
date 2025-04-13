import React, { useState, useEffect } from "react";
import Input from "./ui/Input";

// Compute the multiplicative inverse of a modulo m using the Extended Euclidean Algorithm.
function getModularInverse(a, m) {
  let m0 = m,
    t,
    q;
  let x0 = 0,
    x1 = 1;
  if (m === 1) return 0;
  while (a > 1) {
    q = Math.floor(a / m);
    t = m;
    m = a % m;
    a = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }
  if (x1 < 0) x1 += m0;
  return x1;
}

// Encrypt an ArrayBuffer using the Affine cipher for binary image data.
function affineEncryptBuffer(buffer, a, b) {
  const bytes = new Uint8Array(buffer);
  const encryptedBytes = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    encryptedBytes[i] = (a * bytes[i] + b) % 256;
  }
  return encryptedBytes;
}

// Decrypt an ArrayBuffer using the Affine cipher.
// This function calculates the multiplicative inverse of 'a' modulo 256
// and then applies the decryption formula.
function affineDecryptBuffer(buffer, a, b) {
  const inv = getModularInverse(a, 256);
  if (!inv) {
    throw new Error("The multiplier 'a' is not invertible modulo 256.");
  }
  const bytes = new Uint8Array(buffer);
  const decryptedBytes = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    // (encryptedByte - b) may be negative; adding 256 ensures positivity.
    decryptedBytes[i] = (inv * ((bytes[i] - b + 256) % 256)) % 256;
  }
  return decryptedBytes;
}

export default function Affine() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  // Encryption parameters: multiplier (a) and offset (b)
  const [encryptionA, setEncryptionA] = useState("");
  const [encryptionB, setEncryptionB] = useState("");
  const [encryptedResults, setEncryptedResults] = useState([]);
  // Decryption parameters: multiplier (a) and offset (b)
  const [decryptionA, setDecryptionA] = useState("");
  const [decryptionB, setDecryptionB] = useState("");
  const [decryptedResults, setDecryptedResults] = useState([]);

  // Automatically scroll to the top after decryption to show results.
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

  // Encrypt selected image files using the affine cipher.
  const encryptFiles = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one image file.");
      return;
    }
    // Validate encryption parameters
    const a = parseInt(encryptionA, 10);
    const b = parseInt(encryptionB, 10);
    if (isNaN(a) || isNaN(b)) {
      alert("Please enter valid numeric values for multiplier and offset.");
      return;
    }
    // For invertibility modulo 256, the multiplier 'a' must be coprime with 256.
    // In practice, all odd numbers satisfy this condition.
    if (getModularInverse(a, 256) === 0) {
      alert("Multiplier 'a' must be an odd number (invertible modulo 256).");
      return;
    }
    const results = [];
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result;
          const encryptedBytes = affineEncryptBuffer(arrayBuffer, a, b);
          const encryptedBlob = new Blob([encryptedBytes], { type: file.type });
          const encryptedUrl = URL.createObjectURL(encryptedBlob);
          results.push({
            fileName: file.name,
            encryptedUrl: encryptedUrl,
            fileType: file.type,
            // Store encrypted bytes for later decryption.
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

  // Decrypt an encrypted image file using the affine cipher.
  const decryptFile = (result) => {
    const a = parseInt(decryptionA, 10);
    const b = parseInt(decryptionB, 10);
    if (isNaN(a) || isNaN(b)) {
      alert(
        "Please enter valid numeric values for decryption multiplier and offset."
      );
      return;
    }
    if (getModularInverse(a, 256) === 0) {
      alert(
        "Decryption multiplier 'a' must be an odd number (invertible modulo 256)."
      );
      return;
    }
    try {
      const decryptedBytes = affineDecryptBuffer(
        result.encryptedBytes.buffer,
        a,
        b
      );
      const decryptedBlob = new Blob([decryptedBytes], {
        type: result.fileType,
      });
      const decryptedUrl = URL.createObjectURL(decryptedBlob);
      const decObj = { fileName: result.fileName, decryptedUrl };
      setDecryptedResults((prev) => [...prev, decObj]);
    } catch (error) {
      console.error("Decryption error", error);
      alert("Decryption failed. Please check your parameters.");
    }
  };

  // Helper function to prompt a download in the browser.
  const downloadFile = (url, fileName) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Styling (consistent with your AES, DES, and Caesar components)
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
        <h1 style={headingStyle}>Affine Cipher Image Encryption</h1>
        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          style={inputStyle}
          accept="image/*"
        />
        <Input
          type="number"
          placeholder="Enter encryption multiplier (a)"
          value={encryptionA}
          onChange={(e) => setEncryptionA(e.target.value)}
          style={inputStyle}
        />
        <Input
          type="number"
          placeholder="Enter encryption offset (b)"
          value={encryptionB}
          onChange={(e) => setEncryptionB(e.target.value)}
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
                placeholder="Enter decryption multiplier (a)"
                value={decryptionA}
                onChange={(e) => setDecryptionA(e.target.value)}
                style={inputStyle}
              />
              <Input
                type="number"
                placeholder="Enter decryption offset (b)"
                value={decryptionB}
                onChange={(e) => setDecryptionB(e.target.value)}
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
