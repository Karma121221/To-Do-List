// src/App.js
import React, { useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [filter, setFilter] = useState("all"); // Add this line
  const [collapsedGroups, setCollapsedGroups] = useState([]); // Add this to your state declarations at the top of the App component

  const getTaskGroup = (dueDate) => {
    if (!dueDate) return "No Due Date";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.ceil(diffDays / 7);

    if (taskDate < today) return "Overdue";
    if (taskDate.getTime() === today.getTime()) return "Today";
    if (taskDate.getTime() === tomorrow.getTime()) return "Tomorrow";
    if (diffWeeks === 1) return "This Week";
    if (diffWeeks === 2) return "Next Week";
    return "Later";
  };

  const groupTasksByTimeframe = (tasks) => {
    const grouped = tasks.reduce((groups, task) => {
      const group = getTaskGroup(task.dueDate);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(task);
      return groups;
    }, {});

    // Define the order of groups
    const groupOrder = [
      "Overdue",
      "Today",
      "Tomorrow",
      "This Week",
      "Next Week",
      "Later",
      "No Due Date",
    ];

    return groupOrder
      .filter((group) => grouped[group]?.length)
      .map((group) => ({
        date: group,
        tasks: grouped[group].sort((a, b) =>
          a.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 1
        ),
      }));
  };

  // Replace the existing getFilteredTasks function
  const getFilteredTasks = () => {
    let filtered;
    switch (filter) {
      case "due":
        filtered = tasks.filter((task) => !task.completed && task.dueDate);
        break;
      case "completed":
        filtered = tasks.filter((task) => task.completed);
        break;
      default:
        filtered = tasks;
    }
    return groupTasksByTimeframe(filtered);
  };

  const handleAdd = () => {
    if (input.trim()) {
      if (editIndex >= 0) {
        const updatedTasks = tasks.map((task, i) =>
          i === editIndex ? { ...task, text: input, dueDate } : task
        );
        setTasks(updatedTasks);
        setEditIndex(-1);
      } else {
        setTasks([
          ...tasks,
          {
            text: input,
            completed: false,
            dueDate,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      setInput("");
      setDueDate("");
    }
  };

  const handleDelete = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleToggleComplete = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const handleEdit = (index) => {
    setInput(tasks[index].text);
    setDueDate(tasks[index].dueDate);
    setEditIndex(index);
  };

  const toggleGroupCollapse = (groupDate) => {
    setCollapsedGroups((prev) =>
      prev.includes(groupDate)
        ? prev.filter((date) => date !== groupDate)
        : [...prev, groupDate]
    );
  };

  return (
    <div className="App">
      <h1>✨ My Todo List</h1>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a task"
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button className="add-button" onClick={handleAdd}>
          {editIndex >= 0 ? "Update" : "Add Task"}
        </button>
      </div>
      <div className="filter-container">
        <button
          className={`filter-button ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-button ${filter === "due" ? "active" : ""}`}
          onClick={() => setFilter("due")}
        >
          Due
        </button>
        <button
          className={`filter-button ${
            filter === "completed" ? "active" : ""
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>
      <div className="tasks-container">
        {getFilteredTasks().map((group) => (
          <div key={group.date} className="date-group">
            <h3
              className="date-header"
              data-group={group.date}
              onClick={() => toggleGroupCollapse(group.date)}
            >
              <span className="group-toggle">
                {collapsedGroups.includes(group.date) ? "▶" : "▼"}
              </span>
              {group.date}
              <span className="task-count">({group.tasks.length})</span>
            </h3>
            <div
              className={`date-tasks ${
                collapsedGroups.includes(group.date) ? "collapsed" : ""
              }`}
            >
              {group.tasks.map((task, i) => (
                <div
                  key={`${group.date}-${i}`}
                  className={`task-item ${task.completed ? "completed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(tasks.indexOf(task))}
                  />
                  <div className="task-content">
                    <span className="task-text">{task.text}</span>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(tasks.indexOf(task))}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(tasks.indexOf(task))}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="stats">
        <p>Total tasks: {tasks.length}</p>
        <p>
          Completed:{" "}
          {tasks.filter((task) => task.completed).length}
        </p>
        <p>
          Due: {tasks.filter((task) => !task.completed && task.dueDate).length}
        </p>
      </div>
    </div>
  );
}

export default App;
