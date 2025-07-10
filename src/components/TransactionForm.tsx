import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TransactionFilter from "./TransactionFilter";
import type { Transaction, Category } from "../types"; // Create a types.ts for shared types

interface TransactionFormProps {
  transactions: Transaction[];
  fetchTransactions: () => void;
  isLoggedIn: boolean;
}

const getCategoryClass = (name: string) =>
  "category-color-" +
  name
    .toLowerCase()
    .replace(/[^a-ö0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const TransactionForm: React.FC<TransactionFormProps> = ({
  transactions,
  fetchTransactions,
  isLoggedIn,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(""); // <-- tom sträng betyder "Alla kategorier"

  const [search, setSearch] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 10000]);

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Hämta kategorier
  useEffect(() => {
    axios
      .get("https://localhost:7233/api/category")
      .then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) setCategory(res.data[0].id);
      })
      .catch((err) => {
        console.error("Kunde inte hämta kategorier:", err);
      });
  }, []);

  // Summering
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  useEffect(() => {
    setFilteredTransactions(
      transactions.filter((tx) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          tx.description?.toLowerCase().includes(searchLower) ||
          tx.category?.name?.toLowerCase().includes(searchLower);
        const txDate = tx.date?.slice(0, 10);
        const matchesFrom = !dateFrom || txDate >= dateFrom;
        const matchesTo = !dateTo || txDate <= dateTo;
        return matchesSearch && matchesFrom && matchesTo;
      })
    );
  }, [search, dateFrom, dateTo, transactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo]);

  // Handlers
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!category) {
        alert("Välj en kategori!");
        return;
      }
      const transaction = {
        date,
        amount: Number(amount),
        type,
        description,
        categoryId:
          typeof categories[0]?.id === "number"
            ? Number(category)
            : category,
      };
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "https://localhost:7233/api/transaction",
          transaction,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDate(() => {
          const today = new Date();
          return today.toISOString().split("T")[0];
        });
        setAmount("");
        setType("expense");
        setDescription("");
        setCategory(categories[0]?.id || "");
        fetchTransactions();
      } catch (err) {
        console.error("Kunde inte spara transaktion:", err);
        alert(
          "Kunde inte spara transaktion. Kontrollera att alla fält är ifyllda och giltiga."
        );
      }
    },
    [category, amount, date, description, type, categories, fetchTransactions]
  );

  const handleDelete = useCallback(
    async () => {
      if (!selectedTransaction) return;
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://localhost:7233/api/transaction/${selectedTransaction.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setShowDeleteModal(false);
        setSelectedTransaction(null);
        fetchTransactions();
      } catch (err) {
        alert("Kunde inte ta bort transaktion.");
      }
    },
    [selectedTransaction, fetchTransactions]
  );

  // Beräkna vilka transaktioner som ska visas på aktuell sida
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Funktion för att öppna modal
  const handleTransactionClick = (tx: any) => {
    setSelectedTransaction(tx);
    setShowDeleteModal(true);
  };

  return (
    <>
      <div className="transaction-form-header"></div>
      <form onSubmit={handleSubmit} className="transaction-form">
        <h2 className="form-title">Lägg till transaktion</h2>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Datum"
          required
        />
        <input
          type="number"
          placeholder="Belopp (SEK)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
        />
        <input type="hidden" value="expense" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Beskrivning"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Spara</button>
      </form>

      {/* Filter */}
      <TransactionFilter
        search={search}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={setSearch}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {/* Transaktionslista */}
      <ul className="transaction-list">
        {currentTransactions.map((tx) => (
          <li
            key={tx.id}
            className={`transaction-row ${tx.type}`}
            onClick={() => handleTransactionClick(tx)}
            title="Klicka för att visa detaljer"
          >
            <div className="transaction-info">
              <div className="top-line">
                <span className="description">{tx.description}</span>
              </div>
              <div className="bottom-line">
                <span className="date">{tx.date?.slice(0, 10)}</span>
                <span
                  className={`category ${getCategoryClass(
                    tx.category?.name || ""
                  )}`}
                >
                  {tx.category?.name}
                </span>
              </div>
            </div>
            <div className="transaction-amount">
              <span className={tx.type}>
                {Number(tx.amount).toLocaleString("sv-SE")} kr
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="pagination">
        <span style={{ color: "#aaa", fontSize: "0.98rem" }}>
          Visar{" "}
          {filteredTransactions.length === 0 ? 0 : indexOfFirst + 1}
          –
          {Math.min(indexOfLast, filteredTransactions.length)}
          {" av "}
          {filteredTransactions.length}
        </span>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Föregående
        </button>
        <span>
          Sida {currentPage} av {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Nästa
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTransaction && (
        <div
          className="delete-modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Ta bort transaktion?</h3>
            <p>
              <b>{selectedTransaction.description}</b>
              <br />
              {selectedTransaction.date?.slice(0, 10)}
              <br />
              {Number(selectedTransaction.amount).toLocaleString("sv-SE")} kr
            </p>
            <button onClick={handleDelete}>Ta bort</button>
            <button onClick={() => setShowDeleteModal(false)}>Avbryt</button>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionForm;
