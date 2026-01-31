import { useState, useEffect } from "react";

// STYLE CONFIGURATION
const styles = {
  container: { maxWidth: "800px", margin: "20px auto", fontFamily: "Arial, sans-serif", color: "#333" },
  form: { display: "grid", gap: "10px", padding: "20px", background: "#f4f4f4", borderRadius: "8px", marginBottom: "20px" },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ccc" },
  button: { padding: "10px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  deleteBtn: { background: "#e00", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer", marginLeft: "10px" },
  editBtn: { background: "#fca311", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer" },
  pagination: { display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" },
  pageBtn: { padding: "8px 16px", background: "#eee", border: "1px solid #ddd", cursor: "pointer" },
  activePageBtn: { padding: "8px 16px", background: "#0070f3", color: "white", border: "1px solid #0070f3" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
  th: { textAlign: "left", borderBottom: "2px solid #ddd", padding: "10px" },
  td: { borderBottom: "1px solid #ddd", padding: "10px" }
};

export default function ItemManager() {
  const API_URL = "http://localhost:3000/api/item";
  
  // STATE
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // FORM STATE
  const [formData, setFormData] = useState({ _id: null, itemName: "", itemCategory: "", itemPrice: "", status: "Active" });
  const [isEditing, setIsEditing] = useState(false);

  // 1. READ (Fetch with Pagination)
  const fetchItems = async (pageNum = 1) => {
    setLoading(true);
    try {
      // Fetch 5 items per page
      const res = await fetch(`${API_URL}?page=${pageNum}&limit=5`);
      const data = await res.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
      setPage(data.currentPage);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. CREATE & 3. UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    
    // If editing, we update. If creating, we insert.
    const body = isEditing 
      ? JSON.stringify(formData) 
      : JSON.stringify({ 
          itemName: formData.itemName, 
          itemCategory: formData.itemCategory, 
          itemPrice: formData.itemPrice, 
          status: formData.status 
        });

    try {
      const res = await fetch(API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body
      });

      if (res.ok) {
        alert(isEditing ? "Item Updated!" : "Item Created!");
        resetForm();
        fetchItems(page); // Refresh list
      }
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  // 4. DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchItems(page);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // HELPER: Populate form for editing
  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
  };

  // HELPER: Reset form
  const resetForm = () => {
    setFormData({ _id: null, itemName: "", itemCategory: "", itemPrice: "", status: "Active" });
    setIsEditing(false);
  };

  return (
    <div style={styles.container}>
      <h1>📦 Item Management System</h1>

      {/* --- FORM SECTION --- */}
      <form style={styles.form} onSubmit={handleSubmit}>
        <h3>{isEditing ? "Edit Item" : "Add New Item"}</h3>
        <input name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleChange} style={styles.input} required />
        <input name="itemCategory" placeholder="Category" value={formData.itemCategory} onChange={handleChange} style={styles.input} required />
        <input name="itemPrice" type="number" placeholder="Price" value={formData.itemPrice} onChange={handleChange} style={styles.input} required />
        <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" style={styles.button}>{isEditing ? "Update Item" : "Create Item"}</button>
          {isEditing && <button type="button" onClick={resetForm} style={{...styles.button, background: "#666"}}>Cancel</button>}
        </div>
      </form>

      {/* --- LIST SECTION --- */}
      {loading ? <p>Loading...</p> : (
        <table style={styles.table}>
          <thead>
            <tr>
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
                <td style={styles.td}>{item.itemName}</td>
                <td style={styles.td}>{item.itemCategory}</td>
                <td style={styles.td}>${item.itemPrice}</td>
                <td style={styles.td}>
                  <span style={{ 
                    padding: "4px 8px", borderRadius: "12px", fontSize: "12px",
                    background: item.status === "Active" ? "#d4edda" : "#f8d7da",
                    color: item.status === "Active" ? "#155724" : "#721c24"
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(item)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(item._id)} style={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- PAGINATION CONTROLS --- */}
      <div style={styles.pagination}>
        <button 
          disabled={page <= 1} 
          onClick={() => setPage(page - 1)}
          style={styles.pageBtn}
        >
          Previous
        </button>
        <span style={{ alignSelf: "center" }}>Page {page} of {totalPages}</span>
        <button 
          disabled={page >= totalPages} 
          onClick={() => setPage(page + 1)}
          style={styles.pageBtn}
        >
          Next
        </button>
      </div>
    </div>
  );
}