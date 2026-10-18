"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Todo = {
  _id: string;
  title: string;
  completed: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const request = async (path: string, options?: RequestInit) => {
    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  };

  const loadTodos = useCallback(async () => {
    try {
      setError("");
      const data = await request("/todos");
      setTodos(data);
    } catch {
      setError("Could not load tasks. Check the backend and database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  async function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || busy) return;

    setBusy(true);
    try {
      await request("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      setTitle("");
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add task");
    } finally {
      setBusy(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    try {
      await request(`/todos/${todo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed })
      });
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update task");
    }
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return;

    try {
      await request(`/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle })
      });
      setEditingId(null);
      setEditTitle("");
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save task");
    }
  }

  async function deleteTodo(id: string) {
    try {
      await request(`/todos/${id}`, { method: "DELETE" });
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete task");
    }
  }

  const completed = todos.filter((todo) => todo.completed).length;

  return (
    <main className="page">
      <section className="todo-card">
        <div className="eyebrow">MY WORKSPACE</div>
        <h1>My Todo List</h1>
        <p className="subtitle">Small steps. Real progress.</p>

        <div className="stats">
          <div>
            <strong>{todos.length}</strong>
            <span>Total tasks</span>
          </div>
          <div>
            <strong>{completed}</strong>
            <span>Completed</span>
          </div>
          <div>
            <strong>{todos.length - completed}</strong>
            <span>Remaining</span>
          </div>
        </div>

        <form className="add-form" onSubmit={addTodo}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to get done?"
            maxLength={200}
            aria-label="New task title"
          />
          <button disabled={busy || !title.trim()}>
            {busy ? "Adding..." : "+ Add"}
          </button>
        </form>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="list-heading">
          <h2>Your tasks</h2>
          <span>{todos.length} items</span>
        </div>

        {loading ? (
          <p className="empty">Loading tasks...</p>
        ) : todos.length === 0 ? (
          <p className="empty">No tasks yet. Add your first task above.</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id} className="todo-item">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                  aria-label={`Mark ${todo.title} as ${todo.completed ? "incomplete" : "complete"}`}
                />

                {editingId === todo._id ? (
                  <input
                    className="edit-input"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    maxLength={200}
                    aria-label="Edit task title"
                    autoFocus
                  />
                ) : (
                  <span className={todo.completed ? "task-title done" : "task-title"}>
                    {todo.title}
                  </span>
                )}

                {editingId === todo._id ? (
                  <>
                    <button className="action save" onClick={() => saveEdit(todo._id)}>
                      Save
                    </button>
                    <button className="action" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="action"
                      onClick={() => {
                        setEditingId(todo._id);
                        setEditTitle(todo.title);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="action delete"
                      onClick={() => deleteTodo(todo._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="footer-note">Built with Next.js, Express & MongoDB</p>
      </section>
    </main>
  );
}