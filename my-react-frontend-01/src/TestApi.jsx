/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";

export default function App() {
  const API_URL = "http://localhost:3000/api/item"; // Or http://127.0.0.1:3000/api/item
  
  const [items, setItems] = useState([]);
  const [debugLog, setDebugLog] = useState("Initializing...");

  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      
      // DEBUG: Print exactly what we got to the screen
      setDebugLog(JSON.stringify(data));

      // 1. EXTRACT DATA SAFELY
      let correctArray = [];
      if (data.items && Array.isArray(data.items)) {
        // Case: Backend sends { items: [...] }
        correctArray = data.items;
      } else if (Array.isArray(data)) {
        // Case: Backend sends [...]
        correctArray = data;
      } else {
        console.error("Data format is wrong:", data);
      }

      setItems(correctArray);

    } catch (err) {
      setDebugLog("Error: " + err.message);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div style={{ padding: "20px", background: "#222", color: "white", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1>✅ App.jsx Fixed Version</h1>
      
      {/* DEBUGGER */}
      <div style={{ background: "#000", padding: "10px", marginBottom: "20px", fontSize: "12px", color: "#0f0" }}>
        <strong>Backend Data:</strong> {debugLog}
      </div>

      <button onClick={fetchItems} style={{ padding: "10px 20px", marginBottom: "20px", cursor: "pointer" }}>
        Refresh List
      </button>

      {/* THE LIST */}
      <h3>My Items:</h3>
      <ul>
        {/* SAFETY SHIELD: This line prevents the crash */}
        {Array.isArray(items) && items.map((item, index) => (
          <li key={item._id || index} style={{ marginBottom: "10px", borderBottom: "1px solid #444", paddingBottom: "5px" }}>
            <strong>{item.itemName || "(No Name)"}</strong> — 
            <span style={{ color: "cyan" }}> ${item.itemPrice || 0}</span>
          </li>
        ))}
      </ul>
      
      {/* If array is empty, show a message */}
      {Array.isArray(items) && items.length === 0 && (
        <p style={{ color: "yellow" }}>The list is empty (or failed to load).</p>
      )}
    </div>
  );
}