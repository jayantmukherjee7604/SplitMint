const Expense = require("../models/Expense");


// helper for rounding
const round = (num) => Math.round(num * 100) / 100;


exports.addExpense = async (req, res) => {
  const { description, amount, group, payer, participants, splitMode, values } =
    req.body;

  let splits = [];

  // ===== EQUAL =====
  if (splitMode === "equal") {
    const share = round(amount / participants.length);

    splits = participants.map((p) => ({
      participant: p,
      share,
    }));
  }

  // ===== CUSTOM =====
  else if (splitMode === "custom") {
    splits = participants.map((p, i) => ({
      participant: p,
      share: round(values[i]),
    }));
  }

  // ===== PERCENTAGE =====
  else if (splitMode === "percentage") {
    splits = participants.map((p, i) => ({
      participant: p,
      share: round((amount * values[i]) / 100),
    }));
  }

  const expense = await Expense.create({
    description,
    amount,
    group,
    payer,
    splitMode,
    splits,
  });

  res.json(expense);
};

exports.getGroupExpenses = async (req, res) => {
  const expenses = await Expense.find({ group: req.params.groupId })
    .populate("payer")
    .populate("splits.participant");

  res.json(expenses);
};

exports.getBalances = async (req, res) => {
  const groupId = req.params.groupId;

  const expenses = await Expense.find({ group: groupId })
    .populate("payer")
    .populate("splits.participant");

  const balance = {};

  // initialize balances
  expenses.forEach((exp) => {
    exp.splits.forEach((s) => {
      balance[s.participant._id] = 0;
    });
  });

  // calculate
  expenses.forEach((exp) => {
    balance[exp.payer._id] += exp.amount;

    exp.splits.forEach((s) => {
      balance[s.participant._id] -= s.share;
    });
  });

  res.json(balance);
};

exports.getSettlements = async (req, res) => {
  const groupId = req.params.groupId;

  const expenses = await Expense.find({ group: groupId })
    .populate("payer")
    .populate("splits.participant");

  const balance = {};

  expenses.forEach((exp) => {
    exp.splits.forEach((s) => {
      balance[s.participant._id] = 0;
    });
  });

  expenses.forEach((exp) => {
    balance[exp.payer._id] += exp.amount;

    exp.splits.forEach((s) => {
      balance[s.participant._id] -= s.share;
    });
  });

  let debtors = [];
  let creditors = [];

  for (let id in balance) {
    if (balance[id] < 0) debtors.push({ id, amount: -balance[id] });
    if (balance[id] > 0) creditors.push({ id, amount: balance[id] });
  }

  const settlements = [];

  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);

    settlements.push({
      from: debtors[i].id,
      to: creditors[j].id,
      amount: Math.round(pay * 100) / 100,
    });

    debtors[i].amount -= pay;
    creditors[j].amount -= pay;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  res.json(settlements);
};
