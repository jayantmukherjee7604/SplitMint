const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/groups", require("./routes/group.routes"));
app.use("/api/expenses", require("./routes/expense.routes"));
app.use("/api/ai", require("./routes/ai.routes"));


app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
