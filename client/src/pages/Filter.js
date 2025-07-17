import React, { useState } from "react";

function Filter({ onApplyFilter, members }) {
  const [paidBy, setPaidBy] = useState("");
  const [desc, setDesc] = useState("");

  const handleSearch = () => {
    onApplyFilter({ paidBy, desc });
  };

  return (
    <div className="bg-montraCard backdrop-blur-lg p-4 rounded-2xl shadow-lg mb-6 border border-white/10">
      <h2 className="text-lg font-bold mb-3 text-white">Filter Expenses</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="bg-transparent border border-white/20 p-2 rounded text-white flex-1"
        >
          <option value="">Filter by Paid By</option>
          {members.map((m, i) => (
            <option key={i} value={m} className="text-black">
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="bg-transparent border border-white/20 p-2 rounded text-white flex-1"
        />

        <button
          onClick={handleSearch}
          className="bg-montraAccent text-white px-4 py-2 rounded hover:opacity-90"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default Filter;