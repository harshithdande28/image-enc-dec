import React, { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import CryptoJS from "crypto-js";

// (Optional) Helper function to generate a random IV
const generateRandomIV = (bytes = 16) => {
  const ivWordArray = CryptoJS.lib.WordArray.random(bytes);
  return ivWordArray.toString(CryptoJS.enc.Hex);
};

export default function Aes() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [encryptionMode, setEncryptionMode] = useState("CBC");
  const [ivInput, setIvInput] = useState("");
  const [outputEncoding, setOutputEncoding] = useState("Base64");
  const [encryptedResults, setEncryptedResults] = useState([]);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [decryptedResults, setDecryptedResults] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setEncryptedResults([]);
    setDecryptedResults([]);
  };

  // Auto-generate an IV (if needed)
  const generateIV = () => {
    const ivHex = generateRandomIV(16);
    setIvInput(ivHex);
  };

  // Encrypt each selected file using AES
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
        // Derive a 128-bit key using PBKDF2 from the user-supplied encryption key
        const derivedKey = CryptoJS.PBKDF2(encryptionKey, salt, {
          keySize: 128 / 32,
          iterations: 1000,
        });
        let iv,
          config = { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
        if (encryptionMode === "CBC") {
          if (ivInput) {
            iv = CryptoJS.enc.Hex.parse(ivInput);
          } else {
            iv = CryptoJS.lib.WordArray.random(16);
            setIvInput(iv.toString(CryptoJS.enc.Hex));
          }
          config.iv = iv;
          config.mode = CryptoJS.mode.CBC;
        } else if (encryptionMode === "ECB") {
          config.mode = CryptoJS.mode.ECB;
        }
        const encrypted = CryptoJS.AES.encrypt(wordArray, derivedKey, config);
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

  // Copy text to the clipboard
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
    a.download = result.fileName + "_encrypted.json";
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
        keySize: 128 / 32,
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
      const decrypted = CryptoJS.AES.decrypt(ciphertext, derivedKey, config);
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
      alert("Decryption failed. Please check your decryption key and parameters.");
    }
  };

  // Inline styling (consistent with previous designs)
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
    minHeight: "100vh",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "600px",
    width: "100%",
    marginBottom: "20px",
  };

  const headingStyle = {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#333",
  };

  const inputStyle = {
    margin: "8px 0",
    padding: "8px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  };

  const selectStyle = {
    margin: "8px 0",
    padding: "8px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  };

  const textareaStyle = {
    width: "100%",
    height: "150px",
    marginTop: "8px",
    padding: "8px",
    fontFamily: "monospace",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    resize: "none",
  };

  const buttonStyle = {
    padding: "10px 20px",
    margin: "8px",
    fontSize: "16px",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>AES File Encryption</h1>
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
          <h2 style={{ ...headingStyle, fontSize: "22px", marginBottom: "16px" }}>
            Encrypted Results
          </h2>
          {encryptedResults.map((result, idx) => (
            <div
              key={idx}
              style={{ border: "1px solid #ddd", padding: "8px", marginBottom: "8px" }}
            >
              <strong>{result.fileName}</strong>
              <p>Encrypted Data:</p>
              <textarea readOnly value={result.encryptedData} style={textareaStyle} />
              <p>Salt: {result.salt}</p>
              {encryptionMode === "CBC" && <p>IV: {result.iv}</p>}
              <button style={buttonStyle} onClick={() => copyToClipboard(result.encryptedData)}>
                Copy to Clipboard
              </button>
              <button style={buttonStyle} onClick={() => downloadEncryptedFile(result)}>
                Download
              </button>
              <button style={buttonStyle} onClick={() => decryptFile(result)}>
                Decrypt
              </button>
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
      {decryptedResults.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ ...headingStyle, fontSize: "22px", marginBottom: "16px" }}>
            Decrypted Files
          </h2>
          {decryptedResults.map((dec, idx) => (
            <div key={idx} style={{ marginBottom: "8px" }}>
              <strong>{dec.fileName}</strong>
              <br />
              <a href={dec.decryptedUrl} download={dec.fileName}>
                Download Decrypted File
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
