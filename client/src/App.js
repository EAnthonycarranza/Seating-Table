import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SeatingChart from "./components/SeatingChart";
import GuestEditor from "./components/GuestEditor";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SeatingChart />} />
          <Route path="/admin" element={<GuestEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;