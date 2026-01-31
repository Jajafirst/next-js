import { useEffect, useRef, useState } from "react";

export default function App() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editId, setEditId] = useState(null);

  const itemNameRef = useRef();
  const itemCategoryRef = useRef(); // Back to Dropdown
  const itemPriceRef = useRef();
  const itemStatusRef = useRef();

  const API_URL = "http://localhost:3000/api/item";

  // 1. LOAD DATA
  async function loadItems(pageNum) {
    try {
      const response = await fetch(`${API_URL}?page=${pageNum}&limit=5`);
      const data = await response.json();

      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
        setTotalPages(data.totalPages || 1);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Load Error:", err);
    }
  }

  // 2. DELETE
  async function onItemDelete(id) {
    if (!confirm("Delete this item?")) return;
    await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    loadItems(page);
  }

  // 3. EDIT CLICK
  function onEditClick(item) {
    setEditId(item._id);
    itemNameRef.current.value = item.itemName || "";
    itemPriceRef.current.value = item.itemPrice || "";
    
    // FIX: Set Status (Ignore Case)
    itemStatusRef.current.value = (item.status || "ACTIVE").trim().toUpperCase();

    // FIX: Try to set Category. 
    // If the item has a category NOT in the list (like "gaming"), 
    // the dropdown will default to the first option (Stationary).
    // This forces you to pick a valid category!
    itemCategoryRef.current.value = item.itemCategory || "Stationary";
  }

  // 4. CANCEL
  function onCancelEdit() {
    setEditId(null);
    itemNameRef.current.value = "";
    itemPriceRef.current.value = "";
    itemCategoryRef.current.value = "Stationary"; // Reset to default
    itemStatusRef.current.value = "ACTIVE";
  }

  // 5. SAVE
  async function onItemSave() {
    const body = {
      itemName: itemNameRef.current.value,
      itemCategory: itemCategoryRef.current.value,
      itemPrice: Number(itemPriceRef.current.value),
      status: itemStatusRef.current.value, 
    };

    if (editId) {
      body._id = editId;
      await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditId(null);
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    // Reset inputs
    itemNameRef.current.value = "";
    itemPriceRef.current.value = "";
    loadItems(page);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems(page);
  }, [page]);

  // --- SMART COLOR LOGIC ---
  const getStatusStyle = (status) => {
    const cleanStatus = String(status || "ACTIVE").trim().toUpperCase();
    if (cleanStatus === "ACTIVE") {
      return { background: "rgba(0, 255, 0, 0.15)", color: "#00e676", border: "1px solid #00e676" }; 
    } else {
      return { background: "rgba(255, 0, 0, 0.15)", color: "#ff5252", border: "1px solid #ff5252" }; 
    }
  };

  // --- STYLES ---
  const styles = {
    container: { padding: "40px", fontFamily: "sans-serif",  color: "#e0e0e0", minHeight: "100vh" },
    header: { color: "#fff", borderBottom: "1px solid #333", paddingBottom: "15px", marginBottom: "30px" },
    table: { width: "100%", borderCollapse: "collapse", marginBottom: "20px", background: "#1e1e1e", borderRadius: "8px", overflow: "hidden" },
    th: { background: "#252525", color: "#00d4ff", padding: "15px", textAlign: "left", borderBottom: "2px solid #333", textTransform: "uppercase", fontSize: "14px" },
    td: { padding: "15px", borderBottom: "1px solid #333", color: "#ccc", fontSize: "15px" },
    badge: { padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block" },
    formCard: { background: "#1e1e1e", padding: "30px", borderRadius: "12px", border: "1px solid #333", maxWidth: "500px", marginTop: "40px" },
    label: { display: "block", marginBottom: "8px", color: "#888", fontSize: "13px", fontWeight: "bold" },
    input: { width: "100%", padding: "12px", marginBottom: "20px", background: "#2c2c2c", border: "1px solid #444", color: "#fff", borderRadius: "6px", fontSize: "16px" },
    btnEdit: { background: "#333", color: "#00d4ff", border: "1px solid #00d4ff", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", marginRight: "8px", fontWeight: "bold" },
    btnDelete: { background: "transparent", color: "#ff5252", border: "1px solid #ff5252", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
    btnSave: { background: editId ? "#ff9100" : "#0070f3", color: "white", border: "none", padding: "12px 24px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", marginRight: "10px" },
    btnCancel: { background: "transparent", color: "#aaa", border: "1px solid #555", padding: "12px 24px", borderRadius: "6px", cursor: "pointer", fontSize: "16px" },
    pagination: { display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" },
    btnPage: { padding: "8px 16px", background: "#333", color: "#fff", border: "1px solid #555", cursor: "pointer", borderRadius: "4px" }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Inventory System</h2>

      {/* --- TABLE --- */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td style={{...styles.td, fontSize:"11px", color:"#555"}}>{item._id}</td>
              <td style={{...styles.td, fontWeight: "bold", color: "#fff"}}>
                {item.itemName || "(No Name)"}
              </td>
              <td style={styles.td}>{item.itemCategory}</td>
              <td style={{...styles.td, color: "#00d4ff"}}>${item.itemPrice}</td>
              <td style={styles.td}>
                <span style={{ ...styles.badge, ...getStatusStyle(item.status) }}>
                  {item.status || "ACTIVE"}
                </span>
              </td>
              <td style={styles.td}>
                <button onClick={() => onEditClick(item)} style={styles.btnEdit}>Edit</button>
                <button onClick={() => onItemDelete(item._id)} style={styles.btnDelete}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- PAGINATION --- */}
      <div style={styles.pagination}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={styles.btnPage}>Previous</button>
        <span style={{ alignSelf: "center" }}>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={styles.btnPage}>Next</button>
      </div>

      {/* --- FORM --- */}
      <div style={styles.formCard}>
        <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#fff" }}>
          {editId ? "✏️ Edit Item" : "Add New Item"}
        </h3>
        
        <div>
          <label style={styles.label}>ITEM NAME</label>
          <input type="text" ref={itemNameRef} placeholder="e.g. Gaming Mouse" style={styles.input} />
        </div>
        
        {/* CHANGED BACK TO DROPDOWN */}
        <div>
          <label style={styles.label}>CATEGORY</label>
          <select ref={itemCategoryRef} style={styles.input}>
            <option value="Stationary">Stationary</option>
            <option value="Kitchenware">Kitchenware</option>
            <option value="Appliance">Appliance</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
          </select>
        </div>
        
        <div>
          <label style={styles.label}>PRICE ($)</label>
          <input type="number" ref={itemPriceRef} placeholder="e.g. 199" style={styles.input} />
        </div>

        <div>
          <label style={styles.label}>STATUS</label>
          <select ref={itemStatusRef} style={styles.input}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        
        <div style={{ marginTop: "10px" }}>
          <button onClick={onItemSave} style={styles.btnSave}>
            {editId ? "Update Database" : "Save New Item"}
          </button>
          {editId && (
            <button onClick={onCancelEdit} style={styles.btnCancel}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}