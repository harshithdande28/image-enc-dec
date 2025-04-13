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
