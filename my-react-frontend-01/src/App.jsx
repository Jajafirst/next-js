import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TestApi from "./TestApi";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test_api" element={<TestApi />} />
        <Route path="/" element={<Navigate to="/test_api" replace />} />
      </Routes>
    </BrowserRouter>
  );
}