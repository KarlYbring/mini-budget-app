import React from "react";

type CategorySummary = {
  [category: string]: number;
};

interface SummaryBoxProps {
  summary?: CategorySummary;
  categories: string[]; // Ny prop: komplett lista av kategorier
}

const SummaryBox: React.FC<SummaryBoxProps> = ({ summary, categories }) => {
  const safeSummary = summary ?? {};

  // Summera totalsaldo
  const total = categories.reduce(
    (sum, cat) => sum + (safeSummary[cat] ?? 0),
    0
  );

  return (
    <div className="summary-box">
      <div style={{ padding: 0, margin: 0, listStyle: "none" }}>
        {categories.map((cat) => (
          <div className="summary-category-row" key={cat}>
            <span className={`category-label category-color-${cat.toLowerCase()}`}>{cat}</span>
            <span className="summary-amount">
              {summary?.[cat]?.toLocaleString("sv-SE") ?? 0} kr
            </span>
          </div>
        ))}
      </div>
      <div className="summary-total">
        <span>Utgifter : </span>
        <span>{total.toLocaleString("sv-SE", { style: "currency", currency: "SEK" })}</span>
      </div>
    </div>
  );
};

export default SummaryBox;