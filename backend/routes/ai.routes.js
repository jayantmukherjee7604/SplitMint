const router = require("express").Router();

router.post("/parse-expense", (req, res) => {
  const { text, participants } = req.body;

  const lower = text.toLowerCase();

  // ===============================
  // 1. Extract Amount (supports 450 or ₹450)
  // ===============================
  const amountMatch = lower.match(/₹?\s?(\d+)/);
  const amount = amountMatch ? Number(amountMatch[1]) : 0;


  // ===============================
  // 2. Detect payer
  // ===============================
  let payer = null;

  for (const p of participants) {
    if (lower.includes(p.name.toLowerCase())) {
      payer = p._id;
      break;
    }
  }

  // fallback: first participant
  if (!payer && participants.length > 0) {
    payer = participants[0]._id;
  }


  // ===============================
  // 3. Detect participants mentioned
  // ===============================
  const involved = [];

  for (const p of participants) {
    if (lower.includes(p.name.toLowerCase())) {
      involved.push(p._id);
    }
  }

  const finalParticipants =
    involved.length > 0 ? involved : participants.map((p) => p._id);


  // ===============================
  // 4. Smart category detection
  // ===============================
  let category = "General";

  if (/pizza|food|dinner|lunch|cafe|restaurant/.test(lower)) category = "Food";
  else if (/uber|taxi|bus|flight|petrol|fuel|train/.test(lower)) category = "Travel";
  else if (/movie|game|netflix|party|beer|bat|drinks/.test(lower)) category = "Entertainment";
  else if (/rent|house|flat|electricity|wifi/.test(lower)) category = "Bills";


  // ===============================
  // 5. Clean description
  // ===============================
  let description = lower
    .replace(/₹?\s?\d+/g, "")
    .replace(/paid|spent|for|with|split|by|on/g, "")
    .trim();


  // Capitalize first letter
  description =
    description.charAt(0).toUpperCase() + description.slice(1);


  // ===============================
  // 6. Response
  // ===============================
  res.json({
    description,
    amount,
    payer,
    participants: finalParticipants,
    category,
  });
});

module.exports = router;
