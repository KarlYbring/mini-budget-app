import { useState, useEffect } from "react";
import "./App.css";
import TransactionForm from "./components/TransactionForm";
import axios from "axios";
import SummaryBox from "./components/SummaryBox";
import LogoBox from "./components/LogoBox";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { jwtDecode } from "jwt-decode";
import type { Transaction, Category } from "./types";

const TRANSACTIONS_PER_PAGE = 10;

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [visibleCount] = useState(TRANSACTIONS_PER_PAGE);
  const [filterCategory] = useState(""); // "" = visa alla
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hämta kategorier
  useEffect(() => {
    axios
      .get("https://localhost:7233/api/category")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Kunde inte hämta kategorier:", err));
  }, []);

  // Hämta transaktioner
  const fetchTransactions = () => {
    const token = localStorage.getItem("token");
    axios
      .get("https://localhost:7233/api/transaction", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setTransactions(res.data))
      .catch((err) =>
        console.error("Kunde inte hämta transaktioner:", err)
      );
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Summera utgifter per kategori (endast type === "expense")
  const categorySums: { [category: string]: number } = {};
  categories.forEach((cat) => {
    categorySums[cat.name] = 0;
  });
  transactions.forEach((tx) => {
    const catName = tx.category?.name;
    if (tx.type === "expense" && catName && categorySums.hasOwnProperty(catName)) {
      categorySums[catName] += tx.amount;
    }
  });

  // Antag att filteredTransactions är din lista som ska visas
  const filteredTransactions = transactions.filter((tx) => {
    // Visa alla om filterCategory är tomt
    if (!filterCategory) return true;
    // Annars filtrera på kategori-namn
    return tx.category?.name === filterCategory;
  });

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);

  // Kontrollera token vid app-start
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp > now) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem("token");
        }
      } catch {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      }
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false); // <-- Lägg till denna rad!
  }, []);

  // Logga in-funktion
  const handleLogin = () => {
    setIsLoggedIn(true);
    fetchTransactions(); // Hämta transaktioner för nya användaren direkt!
  };

  // Logga ut-funktion
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setTransactions([]); // Töm transaktioner direkt vid utloggning
  };

  if (loading) return <div>Laddar...</div>;

  return (
    <Router>
      <div className="min-h-screen">
        <main className="container">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onRegister={handleLogin} />} />
            <Route
              path="*"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <div className="container">
                    <div className="main-content" style={{ display: "flex", gap: "2rem" }}>
                      <div className="left-panel" style={{ flex: 1, minWidth: 180 }}>
                        <LogoBox />
                      </div>
                      <div className="center-panel" style={{ flex: 2 }}>
                        <TransactionForm
                          transactions={transactions}
                          fetchTransactions={fetchTransactions}
                          isLoggedIn={isLoggedIn}
                        />
                      </div>
                      <div className="right-panel" style={{ flex: 1, minWidth: 260 }}>
                        <SummaryBox
                          categories={categories.map((cat) => cat.name)}
                          summary={categorySums}
                        />
                      </div>
                    </div>
                    <div className="transaction-list">
                      {visibleTransactions.map((tx) => (
                        <div key={tx.id}>{/* Din transaktionsrad här */}</div>
                      ))}
                    </div>
                    {/* Lägg till detta block direkt under transaktionslistan/pagination */}
                    {isLoggedIn && (
                      <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
                        <button
                          className="logout-btn"
                          onClick={handleLogout}
                          style={{
                            background: "#2380f7",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.75rem 2.5rem",
                            fontSize: "1.1rem",
                            fontFamily: "Inter, sans-serif",
                            cursor: "pointer",
                            fontWeight: 500,
                            boxShadow: "0 2px 8px #0002",
                            transition: "background 0.2s"
                          }}
                        >
                          Logga ut
                        </button>
                      </div>
                    )}
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
