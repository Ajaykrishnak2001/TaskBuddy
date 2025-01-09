import React from "react";

interface DeleteTaskProps {
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteTask: React.FC<DeleteTaskProps> = ({ onDelete, onCancel }) => {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <p>Are you sure you want to delete this task?</p>
      <div className="flex space-x-2 mt-4">
        <button onClick={onDelete} className="bg-red-600 text-white px-4 py-2 rounded">
          Delete
        </button>
        <button onClick={onCancel} className="bg-gray-600 text-white px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteTask;
