import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const Tech = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tech list
  const [tech] = useState([
    { id: 2719, name: "Mariano" },
    { id: 2720, name: "Alejandro" },
    { id: 2721, name: "Carlos" },
  ]);

  // --- Load Inventory ---
  useEffect(() => {
    const q = collection(db, "inventory");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        items.sort((a, b) =>
          (a.name + a.size).localeCompare(b.name + b.size)
        );
        setInventory(items);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Error:", err);
        setError("Failed to load inventory. Check console for details.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --- Handle Pull (requires Tech ID) ---
  const handlePull = async (tireId) => {
    const techIdInput = prompt("Enter your Tech ID:");
    if (!techIdInput) return;

    const techEntry = tech.find((t) => t.id === Number(techIdInput));
    if (!techEntry) {
      alert("Invalid Tech ID. Try again.");
      return;
    }

    const currentTire = inventory.find((t) => t.id === tireId);
    if (!currentTire || (currentTire.quantity || 0) <= 0) {
      alert("No stock available.");
      return;
    }

    try {
      // Update inventory
      const tireRef = doc(db, "inventory", tireId);
      const newQuantity = Math.max(0, (currentTire.quantity || 0) - 1);
      await updateDoc(tireRef, { quantity: newQuantity });

      // Log pull
      const logRef = collection(db, "tireLogs");
      await addDoc(logRef, {
        techId: techEntry.id,
        techName: techEntry.name,
        tire: `${currentTire.name} ${currentTire.size}`,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error pulling tire:", err);
    }
  };

  // --- Restock (no tech needed) ---
  const handleRestock = async (tireId) => {
    try {
      const tireRef = doc(db, "inventory", tireId);
      const currentTire = inventory.find((t) => t.id === tireId);
      const newQuantity = (currentTire.quantity || 0) + 1;
      await updateDoc(tireRef, { quantity: newQuantity });
    } catch (err) {
      console.error("Error restocking:", err);
    }
  };

  // --- Delete Tire ---
  const deleteTire = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this tire type?")) return;
    try {
      await deleteDoc(doc(db, "inventory", id));
    } catch (err) {
      console.error("Error deleting tire:", err);
    }
  }, []);

  const totalTires = inventory.reduce((sum, tire) => sum + (tire.quantity || 0), 0);

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: "center", padding: "4rem" }}>
        Loading Inventory... ⚙️
      </div>
    );
  }

  return (
    <div className="app-container">
      <style jsx="true">{`
        /* ✅ Keeping your full CSS */
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
          margin-bottom: 2rem;
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
        button {
          cursor: pointer;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--border-radius);
          font-weight: 600;
          transition: background-color 0.2s, transform 0.1s;
          white-space: nowrap;
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
        <h1>Night Room Inventory (Live Data)</h1>
        <p>This component is fetching and updating data in real-time from Firebase Firestore.</p>
        <div className="user-info">Connection Status: Live</div>
      </header>

      {error && <div className="error-message">{error}</div>}

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

      {/* Inventory List */}
      <section className="inventory-list">
        <h2>Current Stock ({inventory.length} types)</h2>
        {inventory.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
            Inventory is empty. (Add tires using the original form.)
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
                <div className="tire-quantity">{tire.quantity || 0}</div>
                <div className="action-buttons">
                  <button
                    className="btn-pull"
                    onClick={() => handlePull(tire.id)}
                    disabled={(tire.quantity || 0) <= 0}
                  >
                    Pull ( -1 )
                  </button>
                  <button
                    className="btn-restock"
                    onClick={() => handleRestock(tire.id)}
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

export default Tech;
