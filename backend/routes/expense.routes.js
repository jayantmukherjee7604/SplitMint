const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

const {
  addExpense,
  getGroupExpenses,
  getBalances,
  getSettlements,
} = require("../controllers/expense.controller");


router.post("/", auth, addExpense);
router.get("/:groupId", auth, getGroupExpenses);
router.get("/balances/:groupId", auth, getBalances);
router.get("/settlements/:groupId", auth, getSettlements);


module.exports = router;
