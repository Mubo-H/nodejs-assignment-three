const express = require("express");
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware to authenticate user
const protect = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Not authorized");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Not authorized");
    }
    req.user = decoded;
    next();
  });
};

// Create Task
router.post("/", protect, async (req, res) => {
  const { title } = req.body;
  try {
    const task = new Task({ title, user: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Get Tasks for Logged-In User
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Update Task Status (completed or deleted)
router.put("/:taskId", protect, async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const task = await Task.findOne({ _id: taskId, user: req.user.id });
    if (!task) {
      return res.status(404).send("Task not found");
    }
    task.status = status;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
