import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const navigate = useNavigate();


  // fetch groups
  const logout = () => {
  localStorage.removeItem("token"); // remove JWT
  navigate("/");                   // go to login
};

  const fetchGroups = async () => {
    const res = await api.get("/api/groups");
    setGroups(res.data);
  };
   
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/");
    return;
  }

  fetchGroups();
}, []);


  // create group
  const createGroup = async () => {
    if (!name) return;

    await api.post("/api/groups", {
      name,
      participants: [],
    });

    setName("");
    fetchGroups();
  };

  // delete group
  const deleteGroup = async (id) => {
    await api.delete(`/api/groups/${id}`);
    fetchGroups();
  };

  return (
    <div className="dashboard">
      <div className="top-bar">
  <h2>Your Groups</h2>

  <div className="top-actions">
    <input
      placeholder="Group name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

    <button onClick={createGroup}>Create</button>

    <button className="logout-btn" onClick={logout}>
      Logout
    </button>
  </div>
</div>


      <div className="group-grid">
        {groups.map((g) => (
          <div
  key={g._id}
  className="group-card"
  onClick={() => navigate(`/group/${g._id}`)}
  style={{ cursor: "pointer" }}
>
            <h3>{g.name}</h3>

            <div className="participants">
              {g.participants.map((p) => p.name).join(", ") || "No members"}
            </div>

            <button
              className="delete-btn"
              onClick={(e) => {
  e.stopPropagation();   // 🔥 important
  deleteGroup(g._id);
}}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
