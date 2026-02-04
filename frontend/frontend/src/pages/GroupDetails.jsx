import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/dashboard.css";

export default function GroupDetails() {
  const { id } = useParams();

  // ================= STATES =================
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");

  const [newMember, setNewMember] = useState("");
  const [smartText, setSmartText] = useState("");

  // ================= FILTER STATES =================
  const [search, setSearch] = useState("");
  const [participantFilter, setParticipantFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");



  // ================= FETCH DATA =================
  const fetchData = async () => {
    const exp = await api.get(`/api/expenses/${id}`);
    setExpenses(exp.data);

    const bal = await api.get(`/api/expenses/balances/${id}`);
    setBalances(bal.data);

    const setRes = await api.get(`/api/expenses/settlements/${id}`);
    setSettlements(setRes.data);

    const grp = await api.get("/api/groups");
    const current = grp.data.find((g) => g._id === id);
    setParticipants(current?.participants || []);
  };

  useEffect(() => {
    fetchData();
  }, []);



  // ================= HELPERS =================
  const getName = (pid) =>
    participants.find((p) => p._id === pid)?.name || pid;



  // ================= MINTSENSE AI =================
  const mintSense = async () => {
    if (!smartText) return;

    const res = await api.post("/api/ai/parse-expense", {
      text: smartText,
      participants,
    });

    const { description, amount, payer } = res.data;

    if (!description || !amount || !payer) {
      alert("Couldn't understand expense");
      return;
    }

    await api.post("/api/expenses", {
      description,
      amount,
      group: id,
      payer,
      participants: participants.map((p) => p._id),
      splitMode: "equal",
    });

    setSmartText("");
    fetchData();
  };



  // ================= ADD EXPENSE =================
  const addExpense = async () => {
    if (!description || !amount || !payer) return;

    await api.post("/api/expenses", {
      description,
      amount: Number(amount),
      group: id,
      payer,
      participants: participants.map((p) => p._id),
      splitMode: "equal",
    });

    setShowModal(false);
    setDescription("");
    setAmount("");
    setPayer("");

    fetchData();
  };



  // ================= MEMBERS =================
  const addMember = async () => {
    if (!newMember) return;

    await api.post(`/api/groups/${id}/participants`, { name: newMember });
    setNewMember("");
    fetchData();
  };

  const deleteMember = async (pid) => {
    await api.delete(`/api/groups/${id}/participants/${pid}`);
    fetchData();
  };



  // ================= FILTER =================
  const filteredExpenses = expenses.filter((e) => {
    if (search && !e.description.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (participantFilter && e.payer !== participantFilter)
      return false;

    if (minAmount && e.amount < Number(minAmount))
      return false;

    if (maxAmount && e.amount > Number(maxAmount))
      return false;

    if (fromDate && new Date(e.createdAt) < new Date(fromDate))
      return false;

    if (toDate && new Date(e.createdAt) > new Date(toDate))
      return false;

    return true;
  });



  // ================= UI =================
  return (
    <div className="page">
      <h2>Group Details</h2>



      {/* ================= PARTICIPANTS ================= */}
      <div className="card">
        <h3>Participants</h3>

        {participants.map((p) => (
          <span key={p._id} className="chip">
            {p.name}
            <span className="chip-close" onClick={() => deleteMember(p._id)}>
              ✕
            </span>
          </span>
        ))}

        <div className="member-actions">
          <input
            placeholder="New member"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
          />

          <button className="btn btn-primary" onClick={addMember}>
            Add
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Expense
          </button>
        </div>
      </div>



      {/* ================= FILTERS ================= */}
      <div className="card">
        <h3>Search & Filters</h3>

        <div className="filter-bar">
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={participantFilter}
            onChange={(e) => setParticipantFilter(e.target.value)}
          >
            <option value="">All</option>
            {participants.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <input type="number" placeholder="Min ₹" onChange={(e) => setMinAmount(e.target.value)} />
          <input type="number" placeholder="Max ₹" onChange={(e) => setMaxAmount(e.target.value)} />
          <input type="date" onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>



      {/* ================= MINTSENSE ================= */}
      <div className="card">
        <h3>MintSense AI ✨</h3>

        <div className="smart-bar">
          <input
            placeholder='Type: "Paid 450 for pizza with Aman"'
            value={smartText}
            onChange={(e) => setSmartText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && mintSense()}
          />
          <button className="btn btn-primary" onClick={mintSense}>
            Add Smart
          </button>
        </div>
      </div>



      {/* ================= EXPENSES ================= */}
      <div className="card">
        <h3>Expenses</h3>

        {filteredExpenses.map((e) => (
          <div key={e._id} className="expense-row">
            <span>{e.description}</span>
            <span>₹{e.amount}</span>
          </div>
        ))}
      </div>



      {/* ================= BALANCES ================= */}
      <div className="card">
        <h3>Balances</h3>
        {Object.entries(balances).map(([pid, amt]) => (
          <div key={pid}>
            {getName(pid)} :
            <span className={amt >= 0 ? "positive" : "negative"}>
              {" "}₹{amt}
            </span>
          </div>
        ))}
      </div>



      {/* ================= SETTLEMENTS ================= */}
      <div className="card">
        <h3>Settlements</h3>
        {settlements.map((s, i) => (
          <div key={i}>
            {getName(s.from)} → {getName(s.to)} ₹{s.amount}
          </div>
        ))}
      </div>



      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Expense</h3>

            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              placeholder="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select value={payer} onChange={(e) => setPayer(e.target.value)}>
              <option value="">Select payer</option>
              {participants.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button className="btn btn-primary" onClick={addExpense}>
              Save
            </button>

            <button className="btn btn-danger" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
