import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./components/HomePage";
import Aes from "./components/Aes";
import Des from "./components/Des";
import Caesar from "./components/Caesar";
import Affine from "./components/Affine";
function App() {
  return (
    <Router>
      <nav style={{ padding: "16px", background: "#f2f2f2" }}>
        <ul
          style={{
            display: "flex",
            gap: "16px",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/aes">AES Encryption</Link>
          </li>
          <li>
            <Link to="/des">DES Encryption</Link>
          </li>
          <li>
            <Link to="/caesar">Caesar Cipher</Link>
          </li>
          <li>
            <Link to="/affine">Affine Cipher</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/aes" element={<Aes />} />
        <Route path="/des" element={<Des />} />
        <Route path="/caesar" element={<Caesar />} />
        <Route path="/affine" element={<Affine />} />
      </Routes>
    </Router>
  );
}

export default App;
