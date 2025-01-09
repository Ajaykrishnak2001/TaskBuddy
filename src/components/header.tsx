import React, { useState, useEffect } from 'react';
import { Search, List, LayoutGrid, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Filter from './filter';
import CreateTaskModal from '../pages/createTask';

type User = {
  displayName?: string;
  photoURL?: string;
  uid: string;
};

type TaskCategory = "Work" | "Personal";
type DueDateFilter = "All" | "Today" | "Tomorrow" | "ThisWeek";

type HeaderProps = {
  user: User | null;
  handleSignOut: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchCategory: TaskCategory | "All";
  onCategoryChange: (category: TaskCategory | "All") => void;
  dueDateFilter: DueDateFilter;
  onDueDateFilterChange: (filter: DueDateFilter) => void;
};

const Header: React.FC<HeaderProps> = ({
  user,
  handleSignOut,
  searchQuery,
  onSearchChange,
  searchCategory,
  onCategoryChange,
  dueDateFilter,
  onDueDateFilterChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<'list' | 'board'>(() => {
    return location.pathname === '/taskboard' ? 'board' : 'list';
  });

  useEffect(() => {
    setActiveTab(location.pathname === '/taskboard' ? 'board' : 'list');
  }, [location]);

  const handleNavigation = (tab: 'list' | 'board', path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  const handleTaskAdded = () => {
    window.location.reload();
  };

  return (
    <>
      <header className="bg-white border-b px-4 md:px-6 py-4">
        {/* Desktop view */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="font-semibold text-xl text-gray-800">TaskBuddy</h1>
            
            <div className="flex space-x-4">
              <button
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium ${activeTab === 'list' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'}`}
                onClick={() => handleNavigation('list', '/tasklist')}
              >
                <List size={20} />
                <span>List</span>
              </button>
              <button
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium ${activeTab === 'board' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'}`}
                onClick={() => handleNavigation('board', '/taskboard')}
              >
                <LayoutGrid size={20} />
                <span>Board</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex flex-col items-end">
                    <button
                      className="flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                  <button 
                    className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
                    onClick={() => setIsModalOpen(true)}
                  >
                    ADD TASK
                  </button>
                  <img
                    src={user.photoURL || 'https://via.placeholder.com/40'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName || 'User'}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  Please Sign In
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
          <h1 className="font-bold text-2xl text-gray-800">TaskBuddy</h1>
            {user && (
              <div className="flex flex-col items-end">
                <img
                  src={user.photoURL || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mb-1"
                />
                <span className="text-xs font-medium text-gray-700 mb-1">
                  {user.displayName || 'User'}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-xs text-gray-500"
                >
                  <LogOut size={12} />
                  <span>Logout</span>
                </button>
                <button
                  className="w-auto bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 mt-2"
                  onClick={() => setIsModalOpen(true)}
                >
                  ADD TASK
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Filter by:</div>
            <div className="flex gap-2">
              <select 
                value={searchCategory}
                onChange={(e) => onCategoryChange(e.target.value as TaskCategory | "All")}
                className="border rounded-md px-3 py-1.5 text-sm w-28"
              >
                <option value="All">Category</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
              </select>
              <select
                value={dueDateFilter}
                onChange={(e) => onDueDateFilterChange(e.target.value as DueDateFilter)}
                className="border rounded-md px-3 py-1.5 text-sm w-28"
              >
                <option value="All">Due Date</option>
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="ThisWeek">This Week</option>
              </select>
            </div>
          </div>

          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border rounded-lg pl-10 pr-4 py-2"
            />
          </div>

          {selectedTasks.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {selectedTasks.length} Tasks Selected
                  <button 
                    onClick={() => setSelectedTasks([])}
                    className="ml-2 text-gray-400"
                  >
                    ×
                  </button>
                </div>
                <div className="flex gap-3">
                  <select className="bg-gray-700 px-3 py-1 rounded text-sm">
                    <option>TO-DO</option>
                    <option>IN-PROGRESS</option>
                    <option>COMPLETED</option>
                  </select>
                  <button className="bg-red-600 px-3 py-1 rounded text-sm">Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <Filter
          searchCategory={searchCategory}
          onCategoryChange={onCategoryChange}
          dueDateFilter={dueDateFilter}
          onDueDateFilterChange={onDueDateFilterChange}
        />
      </header>

      {isModalOpen && user && (
        <CreateTaskModal
          onClose={() => setIsModalOpen(false)}
          userId={user.uid}
          onTaskAdded={handleTaskAdded}
        />
      )}
    </>
  );
};

export default Header;