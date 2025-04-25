import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useRef } from "react";
import HomePage from "./components/HomePage";
import Aes from "./components/Aes";
import Des from "./components/Des";
import Caesar from "./components/Caesar";
import Affine from "./components/Affine";
import ComparisonReport from "./components/ComparisionReport";// Import your report!

export default function App() {
  const comparisonRef = useRef(); // Create the ref ONCE here

  return (
    <Router>
      <div>
        {/* All Routes for your pages */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/aes" element={<Aes comparisonRef={comparisonRef} />} />
          <Route path="/des" element={<Des comparisonRef={comparisonRef} />} />
          <Route
            path="/caesar"
            element={<Caesar comparisonRef={comparisonRef} />}
          />
          <Route
            path="/affine"
            element={<Affine comparisonRef={comparisonRef} />}
          />
        </Routes>

        {/* Comparison Report visible at bottom always */}
        <div style={{ width: "90%", margin: "40px auto" }}>
          <ComparisonReport ref={comparisonRef} />
        </div>
      </div>
    </Router>
  );
}
