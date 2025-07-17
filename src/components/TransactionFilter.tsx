import React from "react";

interface TransactionFilterProps {
  search: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  search,
  dateFrom,
  dateTo,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
}) => (
  <div className="transaction-filter-grid">
    <div className="filter-field">
      <input
        type="text"
        placeholder="Sök..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="filter-input"
      />
    </div>
    <div className="filter-field">
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className="filter-input"
        placeholder="Från datum"
      />
    </div>
    <div className="filter-field">
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className="filter-input"
        placeholder="Till datum"
      />
    </div>
  </div>
);

export default TransactionFilter;