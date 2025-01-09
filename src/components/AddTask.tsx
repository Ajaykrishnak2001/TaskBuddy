import React, { useState } from "react";

type TaskStatus = "TO-DO" | "IN-PROGRESS" | "COMPLETED";
type TaskCategory = "Work" | "Personal";

interface NewTaskInput {
  title: string;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
}

interface AddTaskProps {
  onAdd: (task: NewTaskInput) => void;
  onCancel: () => void;
}

const AddTask: React.FC<AddTaskProps> = ({ onAdd, onCancel }) => {
  const [newTask, setNewTask] = useState<NewTaskInput>({
    title: "",
    dueDate: "",
    status: "TO-DO",
    category: "Work",
  });

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const specialCharRegex = /[^a-zA-Z0-9\s]/;

    if (!newTask.title.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    if (specialCharRegex.test(newTask.title)) {
      setError("Task title must not contain special characters");
      return;
    }

    if (!newTask.dueDate) {
      setError("Please select a due date.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (newTask.dueDate < today) {
      setError("Due date must be in the future.");
      return;
    }

    setError(null);
    onAdd(newTask);
    setNewTask({
      title: "",
      dueDate: "",
      status: "TO-DO",
      category: "Work",
    });
  };

  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="title"
        placeholder="Task Title"
        className="w-full p-2 border rounded"
        value={newTask.title}
        onChange={handleInputChange}
      />
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex space-x-4">
        <input
          type="date"
          name="dueDate"
          className="p-2 border rounded"
          min={todayDate} // Set minimum date to today
          value={newTask.dueDate}
          onChange={handleInputChange}
        />
        <select
          name="category"
          className="p-2 border rounded"
          value={newTask.category}
          onChange={handleInputChange}
        >
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
      </div>
      <select
        name="status"
        className="p-2 border rounded w-full"
        value={newTask.status}
        onChange={handleInputChange}
      >
        <option value="TO-DO">TO-DO</option>
        <option value="IN-PROGRESS">IN-PROGRESS</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </div>
    </form>
  );
};

export default AddTask;
