import { useState, useEffect } from "react";
import axios from "axios";
import Filter from "./Filter";

function Dashboard({ user }) {
  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupCreated, setGroupCreated] = useState(null);

  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expenseSuccess, setExpenseSuccess] = useState(null);
  const [filters, setFilters] = useState({ paidBy: "", desc: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");
    loadGroups(token);
  }, []);

  const loadGroups = async (token) => {
    try {
      const res = await axios.get("https://smart-expense-splitter.onrender.com/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load groups");
    }
  };

  useEffect(() => {
    const group = groups.find((g) => g._id === selectedGroupId);
    if (group) {
      setGroupCreated(group);
      loadExpenses(group._id);
    }
  }, [selectedGroupId, groups]);

  const addMember = () => {
    if (memberName.trim()) {
      setMembers([...members, memberName.trim()]);
      setMemberName("");
    }
  };

  const createGroup = async () => {
    if (!groupName || members.length === 0) return alert("Fill all fields!");
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    try {
      const res = await axios.post(
        "https://smart-expense-splitter.onrender.com/api/groups",
        { name: groupName, members },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroups([...groups, res.data]);
      setSelectedGroupId(res.data._id);
      setGroupName("");
      setMembers([]);
      setPaidBy("");
      setSplitBetween([]);
      setExpenseSuccess(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    }
  };

  const toggleSplit = (member) => {
    if (splitBetween.includes(member)) {
      setSplitBetween(splitBetween.filter((m) => m !== member));
    } else {
      setSplitBetween([...splitBetween, member]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  const submitExpense = async () => {
    if (!groupCreated || !expenseDesc || !expenseAmount || !paidBy || splitBetween.length === 0) {
      alert("Please fill all fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    try {
      const formData = new FormData();
      formData.append("groupId", groupCreated._id?.toString());
      formData.append("description", expenseDesc);
      formData.append("amount", expenseAmount);
      formData.append("paidBy", paidBy);
      splitBetween.forEach((p) => formData.append("splitBetween[]", p));
      if (image) formData.append("image", image);

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      await axios.post("https://smart-expense-splitter.onrender.com/api/expenses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenseSuccess("✅ Expense added!");
      setExpenseDesc("");
      setExpenseAmount("");
      setPaidBy("");
      setSplitBetween([]);
      setImage(null);
      setPreview(null);
      loadExpenses(groupCreated._id);
    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    }
  };

  const loadExpenses = async (groupId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    try {
      const params = {};
      if (filters.paidBy) params.paidBy = filters.paidBy;
      if (filters.desc) params.desc = filters.desc;

      const res = await axios.get(`https://smart-expense-splitter.onrender.com/api/groups/${groupId}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load expenses");
    }
  };

  const handleApplyFilter = (f) => {
    setFilters(f);
    if (groupCreated) loadExpenses(groupCreated._id);
  };

  return (
    <div className="relative min-h-screen bg-no-repeat bg-center bg-cover font-body text-montraText"
      style={{
        backgroundImage: "url('/Background-image.jpg')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        filter: "brightness(1.2)",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"></div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
      >
        Logout
      </button>

      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-heading text-white mb-6 text-center">
          Smart Expense Splitter
        </h1>

        {groups.length > 0 && (
          <select
            value={selectedGroupId || ""}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="mb-6 p-2 rounded w-full text-black"
          >
            <option value="">Select a group</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        )}

        {/* Create Group */}
        <div className="bg-montraCard backdrop-blur-lg p-6 rounded-2xl shadow-lg mb-8 border border-white/10">
          <h2 className="text-xl font-bold mb-4">Create a Group</h2>
          <input
            type="text"
            placeholder="Group Name"
            className="w-full bg-transparent border border-white/20 p-2 rounded text-white mb-3"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Member Name"
              className="w-full bg-transparent border border-white/20 p-2 rounded text-white"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
            />
            <button
              onClick={addMember}
              className="bg-montraAccent text-white px-4 rounded hover:opacity-90"
            >
              Add
            </button>
          </div>
          <div className="mb-3 text-sm text-gray-300">
            <p className="font-medium mb-1">Members:</p>
            {members.map((m, i) => (
              <p key={i}>• {m}</p>
            ))}
          </div>
          <button
            onClick={createGroup}
            className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600"
          >
            Create Group
          </button>
        </div>

        {/* Add Expense */}
        {groupCreated && (
          <div className="bg-montraCard backdrop-blur-lg p-6 rounded-2xl shadow-lg mb-8 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <input
              type="text"
              placeholder="Description"
              className="w-full bg-transparent border border-white/20 p-2 rounded text-white mb-3"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-full bg-transparent border border-white/20 p-2 rounded text-white mb-3"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
            />
            <select
              className="w-full bg-transparent border border-white/20 p-2 rounded text-white mb-3"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              <option value="">Who Paid?</option>
              {groupCreated.members.map((m, i) => (
                <option key={i} value={m} className="text-black">
                  {m}
                </option>
              ))}
            </select>
            <div className="mb-3">
              <p className="font-medium mb-1">Split Between:</p>
              {groupCreated.members.map((m, i) => (
                <label key={i} className="block text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={splitBetween.includes(m)}
                    onChange={() => toggleSplit(m)}
                    className="mr-2"
                  />
                  {m}
                </label>
              ))}
            </div>
            <div className="mb-3">
              <p className="font-medium mb-1">Attach Image (optional):</p>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 w-full h-auto rounded shadow border border-white/10"
                />
              )}
            </div>
            <button
              onClick={submitExpense}
              className="bg-montraAccent text-white w-full py-2 rounded hover:opacity-90"
            >
              Submit Expense
            </button>
            {expenseSuccess && (
              <p className="text-green-400 mt-3 text-sm text-center">{expenseSuccess}</p>
            )}
          </div>
        )}

        {groupCreated && (
          <Filter onApplyFilter={handleApplyFilter} members={groupCreated.members} />
        )}

        {/* Expense Breakdown */}
        {expenses.length > 0 && (
          <div className="bg-montraCard backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4">Expense Breakdown</h2>
            {expenses.map((exp, idx) => {
              const perPerson = exp.amount / exp.splitBetween.length;
              return (
                <div key={idx} className="mb-4 border-b border-white/10 pb-4">
                  <h3 className="text-lg font-semibold text-white">{exp.description}</h3>
                  <p className="text-sm text-gray-300 mb-1">
                    Paid by <span className="font-semibold">{exp.paidBy}</span> — ₹{exp.amount}
                  </p>
                  {exp.image && (
                    <img
                      src={exp.image}
                      alt="Expense"
                      className="w-full rounded-md mb-2 border border-white/10"
                    />
                  )}
                  {exp.splitBetween.map((person, i) =>
                    person !== exp.paidBy && (
                      <p key={i} className="text-sm text-gray-400">
                        {person} owes{" "}
                        <span className="text-montraAccent font-semibold">{exp.paidBy}</span> ₹
                        {perPerson.toFixed(2)}
                      </p>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;