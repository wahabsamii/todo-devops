import express from "express";
import Todo from "../models/Todo.js";

const router = express.Router();

// GET /api/todos - Get all todos
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch todos" });
  }
});

// POST /api/todos - Create a todo
router.post("/", async (req, res) => {
  try {
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (title.length > 200) {
      return res.status(400).json({ message: "Title must be 200 characters or fewer" });
    }

    const todo = await Todo.create({ title });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: "Failed to create todo" });
  }
});

// PATCH /api/todos/:id - Update a todo
router.patch("/:id", async (req, res) => {
  try {
    if (req.body.title === undefined && req.body.completed === undefined) {
      return res.status(400).json({ message: "Provide a field to update" });
    }

    const updates = {};

    if (req.body.title !== undefined) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }

      if (req.body.title.trim().length > 200) {
        return res.status(400).json({ message: "Title must be 200 characters or fewer" });
      }

      updates.title = req.body.title.trim();
    }

    if (req.body.completed !== undefined) {
      if (typeof req.body.completed !== "boolean") {
        return res.status(400).json({ message: "Completed must be true or false" });
      }

      updates.completed = req.body.completed;
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid todo ID" });
    }

    res.status(500).json({ message: "Failed to update todo" });
  }
});

// DELETE /api/todos/:id - Delete a todo
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid todo ID" });
    }

    res.status(500).json({ message: "Failed to delete todo" });
  }
});

export default router;