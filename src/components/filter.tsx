import React from 'react';

type TaskCategory = "Work" | "Personal";
type DueDateFilter = "All" | "Today" | "Tomorrow" | "ThisWeek";

interface FilterProps {
  searchCategory: TaskCategory | "All";
  onCategoryChange: (category: TaskCategory | "All") => void;
  dueDateFilter: DueDateFilter;
  onDueDateFilterChange: (filter: DueDateFilter) => void;
}

const Filter: React.FC<FilterProps> = ({
  searchCategory,
  onCategoryChange,
  dueDateFilter,
  onDueDateFilterChange
}) => {
  return (
    <div className="mt-4 ml-6">
      <label className="text-sm font-medium text-gray-600 mb-2 block">
        Filter by:
      </label>
      <div className="flex items-center space-x-6">
        <select
          value={searchCategory}
          onChange={(e) => onCategoryChange(e.target.value as TaskCategory | "All")}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="All">All Categories</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
        <select
          value={dueDateFilter}
          onChange={(e) => onDueDateFilterChange(e.target.value as DueDateFilter)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="All">All Due Dates</option>
          <option value="Today"> Today</option>
          <option value="Tomorrow"> Tomorrow</option>
          <option value="ThisWeek"> This Week</option>
        </select>
      </div>
    </div>
  );
};

export default Filter;