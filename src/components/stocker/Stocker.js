import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

// =========================================================================
// MAIN APP COMPONENT (Now connected to Firebase Firestore)
// =========================================================================
const Stocker = () => {
  // Local State for Inventory and Errors
  const [inventory, setInventory] = useState([]);
  const [formError, setFormError] = useState(null);

  // UI State for form inputs
  const [tireName, setTireName] = useState("");
  const [tireSize, setTireSize] = useState("");
  const [tireQuantity, setTireQuantity] = useState("");

  const userId = "MOCK-UI-USER-12345"; // Replace with Firebase Auth user later

  // --- Load Inventory from Firestore ---
  useEffect(() => {
    const q = collection(db, "inventory");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by name + size
      items.sort((a, b) =>
        (a.name + a.size).localeCompare(b.name + b.size)
      );
      setInventory(items);
    });

    return () => unsubscribe();
  }, []);

  // --- Add new tire type ---
  const addTire = useCallback(async (name, size, quantity) => {
    try {
      await addDoc(collection(db, "inventory"), {
        name: name.trim(),
        size: size.trim(),
        quantity,
      });
      return true;
    } catch (error) {
      console.error("Error adding tire:", error);
      setFormError("Could not add tire. Try again.");
      return false;
    }
  }, []);

  // --- Update quantity (Pull/Restock) ---
  const changeQuantity = useCallback(
    async (id, change) => {
      try {
        const tireRef = doc(db, "inventory", id);
        const currentTire = inventory.find((t) => t.id === id);
        if (!currentTire) return;

        const newQuantity = Math.max(0, currentTire.quantity + change);

        await updateDoc(tireRef, { quantity: newQuantity });
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    },
    [inventory]
  );

  // --- Delete tire type ---
  const deleteTire = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this tire type?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "inventory", id));
    } catch (error) {
      console.error("Error deleting tire:", error);
    }
  }, []);

  // --- Handle Add Tire Form ---
  const handleAddTire = async (e) => {
    e.preventDefault();

    const name = tireName.trim();
    const size = tireSize.trim();
    const quantity = parseInt(tireQuantity, 10);

    if (!name || !size || isNaN(quantity) || quantity < 0) {
      setFormError(
        "Please enter valid Name, Size, and Quantity (must be 0 or greater)."
      );
      return;
    }
    setFormError(null);

    const success = await addTire(name, size, quantity);

    if (success) {
      setTireName("");
      setTireSize("");
      setTireQuantity("");
    }
  };

  const totalTires = inventory.reduce((sum, tire) => sum + tire.quantity, 0);

  // --- UI Rendering ---
  return (
    <div className="app-container">
      {/* (styles unchanged, kept your original CSS) */}
      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        :root {
          --bg-dark: #1f2937;
          --card-dark: #374151;
          --text-light: #f3f4f6;
          --primary-color: #3b82f6;
          --danger-color: #ef4444;
          --success-color: #10b981;
          --warning-color: #f59e0b;
          --border-radius: 0.5rem;
        }
        * {
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }
        .app-container {
          min-height: 100vh;
          background-color: var(--bg-dark);
          color: var(--text-light);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .header {
          width: 100%;
          max-width: 800px;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--card-dark);
          margin-bottom: 1rem;
        }
        .header h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0;
          color: var(--primary-color);
        }
        .header p {
          font-size: 0.875rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }
        .user-info {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.5rem;
          word-break: break-all;
        }
        .stats {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
          width: 100%;
          max-width: 800px;
        }
        .stat-card {
          background-color: var(--card-dark);
          padding: 1rem;
          border-radius: var(--border-radius);
          flex: 1;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .stat-card h3 {
          margin-top: 0;
          font-size: 0.875rem;
          color: #d1d5db;
        }
        .stat-card p {
          font-size: 2rem;
          font-weight: 800;
          margin: 0.5rem 0 0;
          color: var(--success-color);
        }
        .form-card {
          background-color: var(--card-dark);
          padding: 1.5rem;
          border-radius: var(--border-radius);
          width: 100%;
          max-width: 800px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
        }
        .form-card h2 {
          margin-top: 0;
          font-size: 1.25rem;
          border-bottom: 1px solid #4b5563;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .form-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-group > div {
          flex: 1;
        }
        label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
          color: #d1d5db;
        }
        input[type="text"], input[type="number"] {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #4b5563;
          border-radius: var(--border-radius);
          background-color: #111827;
          color: var(--text-light);
          transition: border-color 0.2s;
        }
        input[type="text"]:focus, input[type="number"]:focus {
          outline: none;
          border-color: var(--primary-color);
        }
        button {
          cursor: pointer;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--border-radius);
          font-weight: 600;
          transition: background-color 0.2s, transform 0.1s;
          white-space: nowrap;
        }
        .btn-add {
          background-color: var(--primary-color);
          color: var(--text-light);
          width: 100%;
        }
        .btn-add:hover {
          background-color: #2563eb;
        }
        .btn-pull, .btn-restock, .btn-delete {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
        .btn-pull {
          background-color: var(--danger-color);
          color: var(--text-light);
        }
        .btn-pull:hover {
          background-color: #dc2626;
        }
        .btn-restock {
          background-color: var(--success-color);
          color: var(--bg-dark);
        }
        .btn-restock:hover {
          background-color: #059669;
        }
        .btn-delete {
          background-color: #6b7280;
          color: var(--text-light);
        }
        .btn-delete:hover {
          background-color: #4b5563;
        }
        .error-message {
          background-color: var(--danger-color);
          color: var(--text-light);
          padding: 0.75rem;
          border-radius: var(--border-radius);
          margin-bottom: 1rem;
          text-align: center;
        }
        .inventory-list {
          width: 100%;
          max-width: 800px;
        }
        .list-header {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr 1fr;
          padding: 0.75rem 1rem;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--primary-color);
          border-bottom: 2px solid #4b5563;
          margin-bottom: 0.5rem;
        }
        .tire-item {
          background-color: var(--card-dark);
          padding: 1rem;
          border-radius: var(--border-radius);
          margin-bottom: 0.5rem;
          display: grid;
          grid-template-columns: 2fr 1fr 2fr 1fr;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: background-color 0.2s;
        }
        .tire-item:hover {
          background-color: #4b5563;
        }
        .tire-info {
          font-weight: 600;
        }
        .tire-info .size {
          display: block;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .tire-quantity {
          font-size: 1.5rem;
          font-weight: 800;
          text-align: center;
          color: var(--warning-color);
        }
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
      `}</style>

      <header className="header">
        <h1>Night Room Inventory</h1>
        <p>This version is connected to Firebase. Data changes will persist.</p>
        <div className="user-info">Connected User ID: {userId}</div>
      </header>

      {(formError) && <div className="error-message">{formError}</div>}

      <section className="stats">
        <div className="stat-card">
          <h3>Total Tire Types</h3>
          <p>{inventory.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Stock Count</h3>
          <p>{totalTires}</p>
        </div>
      </section>

      <section className="form-card">
        <h2>Add New Tire Type</h2>
        <form onSubmit={handleAddTire}>
          <div className="form-group">
            <div>
              <label htmlFor="name">Brand / Model Name</label>
              <input
                id="name"
                type="text"
                value={tireName}
                onChange={(e) => setTireName(e.target.value)}
                placeholder="Michelin Agilis 51"
                required
              />
            </div>
            <div>
              <label htmlFor="size">Size Specification</label>
              <input
                id="size"
                type="text"
                value={tireSize}
                onChange={(e) => setTireSize(e.target.value)}
                placeholder="245/70R19.5"
                required
              />
            </div>
            <div>
              <label htmlFor="quantity">Initial Stock</label>
              <input
                id="quantity"
                type="number"
                value={tireQuantity}
                onChange={(e) => setTireQuantity(e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-add">
            <i className="fas fa-plus"></i> Add Tire to Inventory
          </button>
        </form>
      </section>

      <section className="inventory-list">
        <h2>Current Stock ({inventory.length} types)</h2>
        {inventory.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
            Inventory is empty. Add a tire type above!
          </p>
        ) : (
          <>
            <div className="list-header">
              <div>TIRE NAME / SIZE</div>
              <div style={{ textAlign: "center" }}>QTY</div>
              <div style={{ textAlign: "right" }}>ACTIONS</div>
              <div className="col-delete"></div>
            </div>
            {inventory.map((tire) => (
              <div key={tire.id} className="tire-item">
                <div className="tire-info">
                  {tire.name}
                  <span className="size">{tire.size}</span>
                </div>
                <div className="tire-quantity">{tire.quantity}</div>
                <div className="action-buttons">
                  <button
                    className="btn-pull"
                    onClick={() => changeQuantity(tire.id, -1)}
                    disabled={tire.quantity <= 0}
                  >
                    Pull ( -1 )
                  </button>
                  <button
                    className="btn-restock"
                    onClick={() => changeQuantity(tire.id, 1)}
                  >
                    Restock ( +1 )
                  </button>
                </div>
                <div className="btn-delete-container">
                  <button
                    className="btn-delete"
                    onClick={() => deleteTire(tire.id)}
                    title="Remove tire type completely"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
};

export default Stocker;
