const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const verifyToken = require("../middleware/auth");
const Group = require("../models/Group");
const Expense = require("../models/Expense");

// ✅ Create group
router.post("/groups", verifyToken, async (req, res) => {
  try {
    const { name, members } = req.body;
    const createdBy = req.user.id;

    const group = new Group({ name, members, createdBy });
    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// ✅ Get groups
router.get("/groups", verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.user.id });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load groups" });
  }
});

// ✅ Add expense
router.post("/expenses", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { groupId, description, amount, paidBy } = req.body;
    let splitBetween = req.body["splitBetween[]"];

    // Ensure it's an array
    if (!Array.isArray(splitBetween)) {
      splitBetween = [splitBetween];
    }

    const image = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
      : null;

    if (!groupId) {
      return res.status(400).json({ error: "groupId is required" });
    }

    const expense = new Expense({
      groupId,
      description,
      amount,
      paidBy,
      splitBetween,
      image,
    });

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// ✅ Get expenses
router.get("/groups/:groupId/expenses", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const filters = {};

    if (req.query.paidBy) filters.paidBy = req.query.paidBy;
    if (req.query.desc) filters.description = { $regex: req.query.desc, $options: "i" };

    const expenses = await Expense.find({ groupId, ...filters }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load expenses" });
  }
});

module.exports = router;