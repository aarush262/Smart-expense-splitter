const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "expenses",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

// =====================
// 🔐 PROTECTED ROUTES
// =====================

// 📌 Create Group
router.post("/groups", verifyToken, async (req, res) => {
  const { name, members } = req.body;

  try {
    const group = new Group({
      name,
      members,
      createdBy: req.userId,
    });
    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// 📌 Get Groups for logged-in user
router.get("/groups", verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.userId });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// 📌 Add Expense (💥 FIXED CODE BELOW)
router.post("/expenses", verifyToken, upload.single("image"), async (req, res) => {
  try {
    let splitMembers = Array.isArray(req.body["splitBetween[]"])
      ? req.body["splitBetween[]"]
      : [req.body["splitBetween[]"]];

    // Remove paidBy person from split
    splitMembers = splitMembers.filter((member) => member !== req.body.paidBy);

    const expense = new Expense({
      groupId: req.body.groupId,
      description: req.body.description,
      amount: req.body.amount,
      paidBy: req.body.paidBy,
      splitBetween: splitMembers,
      image: req.file?.path,
    });

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// 📌 Get Expenses (with optional filters)
router.get("/groups/:groupId/expenses", verifyToken, async (req, res) => {
  const { groupId } = req.params;
  const { paidBy, desc } = req.query;

  try {
    let query = { groupId };

    if (paidBy) {
      query.paidBy = paidBy;
    }
    if (desc) {
      query.description = { $regex: desc, $options: "i" };
    }

    const expenses = await Expense.find(query);
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

module.exports = router;