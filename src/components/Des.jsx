import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import CryptoJS from "crypto-js";

export default function Des() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [encryptionMode, setEncryptionMode] = useState("CBC");
  const [ivInput, setIvInput] = useState("");
  const [outputEncoding, setOutputEncoding] = useState("Base64");
  const [encryptedResults, setEncryptedResults] = useState([]);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [decryptedResults, setDecryptedResults] = useState([]);

  // Automatically scroll to the top after decryption
  useEffect(() => {
    if (decryptedResults.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [decryptedResults]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setEncryptedResults([]);
    setDecryptedResults([]);
  };

  // Auto-generate an IV for DES (8 bytes)
  const generateIV = () => {
    const ivWordArray = CryptoJS.lib.WordArray.random(8);
    setIvInput(ivWordArray.toString(CryptoJS.enc.Hex));
  };

  // Encrypt each selected file using DES
  const encryptFiles = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }
    if (!encryptionKey || encryptionKey.length < 16) {
      alert("Encryption key must be at least 16 characters.");
      return;
    }
    const results = [];
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const wordArray = CryptoJS.lib.WordArray.create(reader.result);
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        // Derive a 64-bit key (8 bytes) for DES using PBKDF2
        const derivedKey = CryptoJS.PBKDF2(encryptionKey, salt, {
          keySize: 64 / 32,
          iterations: 1000,
        });
        let iv,
          config = { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
        if (encryptionMode === "CBC") {
          if (ivInput) {
            iv = CryptoJS.enc.Hex.parse(ivInput);
          } else {
            iv = CryptoJS.lib.WordArray.random(8);
            setIvInput(iv.toString(CryptoJS.enc.Hex));
          }
          config.iv = iv;
          config.mode = CryptoJS.mode.CBC;
        } else if (encryptionMode === "ECB") {
          config.mode = CryptoJS.mode.ECB;
        }
        const encrypted = CryptoJS.DES.encrypt(wordArray, derivedKey, config);
        const encryptedStr =
          outputEncoding === "Hex"
            ? encrypted.ciphertext.toString(CryptoJS.enc.Hex)
            : encrypted.toString();
        const resultObj = {
          fileName: file.name,
          encryptedData: encryptedStr,
          salt: salt.toString(CryptoJS.enc.Hex),
          iv: iv ? iv.toString(CryptoJS.enc.Hex) : "",
        };
        results.push(resultObj);
        if (results.length === selectedFiles.length) {
          setEncryptedResults(results);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  // Download the encrypted result as a JSON file (including salt and IV)
  const downloadEncryptedFile = (result) => {
    const dataToDownload = JSON.stringify(result, null, 2);
    const blob = new Blob([dataToDownload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.fileName + "_encrypted_des.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Decrypt a specific encrypted result using the user-supplied decryption key
  const decryptFile = (result) => {
    if (!decryptionKey || decryptionKey.length < 16) {
      alert("Decryption key must be at least 16 characters.");
      return;
    }
    try {
      const salt = CryptoJS.enc.Hex.parse(result.salt);
      const derivedKey = CryptoJS.PBKDF2(decryptionKey, salt, {
        keySize: 64 / 32,
        iterations: 1000,
      });
      let config = { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
      if (encryptionMode === "CBC") {
        const iv = CryptoJS.enc.Hex.parse(result.iv);
        config.iv = iv;
        config.mode = CryptoJS.mode.CBC;
      } else if (encryptionMode === "ECB") {
        config.mode = CryptoJS.mode.ECB;
      }
      let ciphertext;
      if (outputEncoding === "Hex") {
        ciphertext = CryptoJS.enc.Hex.parse(result.encryptedData);
        ciphertext = CryptoJS.lib.CipherParams.create({ ciphertext });
      } else {
        ciphertext = result.encryptedData;
      }
      const decrypted = CryptoJS.DES.decrypt(ciphertext, derivedKey, config);
      const decryptedWordArray = decrypted;
      const typedArray = new Uint8Array(decryptedWordArray.sigBytes);
      for (let i = 0; i < decryptedWordArray.sigBytes; i++) {
        typedArray[i] =
          (decryptedWordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }
      const blob = new Blob([typedArray]);
      const url = URL.createObjectURL(blob);
      const decObj = { fileName: result.fileName, decryptedUrl: url };
      setDecryptedResults((prev) => [...prev, decObj]);
    } catch (error) {
      console.error("Decryption error", error);
      alert(
        "Decryption failed. Please check your decryption key and parameters."
      );
    }
  };

  // Updated styling for an appealing UI
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

  const selectStyle = {
    margin: "12px 0",
    padding: "12px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
  };

  const textareaStyle = {
    width: "100%",
    height: "150px",
    marginTop: "12px",
    padding: "12px",
    fontFamily: "monospace",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    resize: "none",
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
        <h1 style={headingStyle}>DES File Encryption</h1>
        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          style={inputStyle}
          accept="image/*"
        />
        <Input
          type="password"
          placeholder="Enter encryption key"
          value={encryptionKey}
          onChange={(e) => setEncryptionKey(e.target.value)}
          style={inputStyle}
        />
        <select
          value={encryptionMode}
          onChange={(e) => setEncryptionMode(e.target.value)}
          style={selectStyle}
        >
          <option value="CBC">CBC</option>
          <option value="ECB">ECB</option>
        </select>
        {encryptionMode === "CBC" && (
          <>
            <Input
              type="text"
              placeholder="Enter IV (hex)"
              value={ivInput}
              onChange={(e) => setIvInput(e.target.value)}
              style={inputStyle}
            />
            <button style={buttonStyle} onClick={generateIV}>
              Auto Generate IV
            </button>
          </>
        )}
        <select
          value={outputEncoding}
          onChange={(e) => setOutputEncoding(e.target.value)}
          style={selectStyle}
        >
          <option value="Base64">Base64</option>
          <option value="Hex">Hex</option>
        </select>
        <button style={buttonStyle} onClick={encryptFiles}>
          Encrypt Files
        </button>
      </div>
      {encryptedResults.length > 0 && (
        <div style={cardStyle}>
          <h2
            style={{
              ...headingStyle,
              fontSize: "28px",
              marginBottom: "16px",
              color: "#333",
            }}
          >
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
              <p>Encrypted Data:</p>
              <textarea
                readOnly
                value={result.encryptedData}
                style={textareaStyle}
              />
              <p style={{ color: "black" }}>Salt: {result.salt}</p>
              {encryptionMode === "CBC" && (
                <p style={{ color: "black" }}>IV: {result.iv}</p>
              )}
              <button
                style={buttonStyle}
                onClick={() => copyToClipboard(result.encryptedData)}
              >
                Copy to Clipboard
              </button>
              <button
                style={buttonStyle}
                onClick={() => downloadEncryptedFile(result)}
              >
                Download
              </button>
              <button style={buttonStyle} onClick={() => decryptFile(result)}>
                Decrypt
              </button>
            </div>
          ))}
        </div>
      )}
      {decryptedResults.length > 0 && (
        <div style={cardStyle}>
          <h2
            style={{
              ...headingStyle,
              fontSize: "28px",
              marginBottom: "16px",
              color: "#333",
            }}
          >
            Decrypted Files
          </h2>
          {decryptedResults.map((dec, idx) => (
            <div key={idx} style={{ marginBottom: "12px" }}>
              <strong>{dec.fileName}</strong>
              <br />
              <a
                href={dec.decryptedUrl}
                download={dec.fileName}
                style={{
                  ...buttonStyle,
                  textDecoration: "none",
                  display: "inline-block",
                  marginTop: "8px",
                }}
              >
                Download Decrypted File
              </a>
            </div>
          ))}
        </div>
      )}
      <div style={cardStyle}>
        <Input
          type="password"
          placeholder="Enter decryption key"
          value={decryptionKey}
          onChange={(e) => setDecryptionKey(e.target.value)}
          style={inputStyle}
        />
      </div>
    </div>
  );
}
