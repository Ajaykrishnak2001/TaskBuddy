



import { useState, useEffect } from "react";
import { auth, db } from "../../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, writeBatch } from "firebase/firestore";
import { ChevronUp, ChevronDown, MoreHorizontal, PlusCircle } from "lucide-react";
import { DragDropContext } from "react-beautiful-dnd";

import Header from "../components/header";
import AddTask from "../components/AddTask";
import EditTask from "../components/EditTask";
import DeleteTask from "../components/DeleteTask";
import DragRearrangeTask from "../components/DragRearrangeTask";
import NoResults from "../components/No Results Found";

type TaskStatus = "TO-DO" | "IN-PROGRESS" | "COMPLETED";
type TaskCategory = "Work" | "Personal";
type DueDateFilter = "All" | "Today" | "Tomorrow" | "ThisWeek";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
  createdAt: string;  
  userId: string;
  order?: number;
}

interface NewTaskInput {
  title: string;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
  description?: string;
}

const TaskBuddyDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<TaskCategory | "All">("All");
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("All");

  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchTasks(user.uid);
      } else {
        setUser(null);
        setTasks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.task-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);


  // New function to format due date
  const formatDueDate = (dueDate: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);
    
    if (dueDateObj.getTime() === today.getTime()) {
      return "Today";
    } else if (dueDateObj.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    }
    
    // Format date as MM/DD/YYYY for other dates
    return dueDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  const fetchTasks = async (userId: string) => {
    try {
      const q = query(collection(db, "tasks"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const fetchedTasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        order: doc.data().order || 0,
      })) as Task[];
      
      const sortedTasks = fetchedTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      setTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddTask = async (newTaskInput: NewTaskInput) => {
    const taskToAdd = {
      ...newTaskInput,
      createdAt: new Date().toISOString(),
      userId: user?.uid,
      order: tasks.length,
    };

    try {
      const docRef = await addDoc(collection(db, "tasks"), taskToAdd);
      setTasks((prevTasks) => [
        ...prevTasks,
        { ...taskToAdd, id: docRef.id } as Task
      ]);
      setShowAddTask(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setDeletingTask(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = async (updatedTask: NewTaskInput) => {
    if (!editingTask) return;

    try {
      const taskRef = doc(db, "tasks", editingTask.id);
      const taskUpdate = {
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        status: updatedTask.status,
        category: updatedTask.category,
      };

      await updateDoc(taskRef, taskUpdate);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...updatedTask }
            : task
        )
      );

      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const batch = writeBatch(db);
      selectedTasks.forEach((taskId) => {
        const taskRef = doc(db, "tasks", taskId);
        batch.delete(taskRef);
      });
      await batch.commit();

      setTasks((prevTasks) => prevTasks.filter((task) => !selectedTasks.has(task.id)));
      setSelectedTasks(new Set());
      setShowBulkDelete(false);
    } catch (error) {
      console.error("Error deleting tasks:", error);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: TaskStatus) => {
    try {
      const batch = writeBatch(db);
      selectedTasks.forEach((taskId) => {
        const taskRef = doc(db, "tasks", taskId);
        batch.update(taskRef, { status: newStatus });
      });
      await batch.commit();

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          selectedTasks.has(task.id) ? { ...task, status: newStatus } : task
        )
      );
      setSelectedTasks(new Set());
    } catch (error) {
      console.error("Error updating task statuses:", error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    const updatedTasks = Array.from(tasks);
    const [draggedTask] = updatedTasks.splice(source.index, 1);
    
    if (!draggedTask) return;
    
    if (source.droppableId !== destination.droppableId) {
      draggedTask.status = destination.droppableId as TaskStatus;
    }
    
    updatedTasks.splice(destination.index, 0, draggedTask);
    const reorderedTasks = updatedTasks.map((task, index) => ({
      ...task,
      order: index,
    }));
    
    setTasks(reorderedTasks);
    
    try {
      const batch = writeBatch(db);
      const startIdx = Math.min(source.index, destination.index);
      const endIdx = Math.max(source.index, destination.index);
      
      reorderedTasks.slice(startIdx, endIdx + 1).forEach((task) => {
        const taskRef = doc(db, "tasks", task.id);
        batch.update(taskRef, {
          order: task.order,
          status: task.status,
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error updating task positions:", error);
      setTasks(tasks);
    }
  };

  const handleTaskSelection = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const TaskActionsMenu = ({ task }: { task: Task }) => {
    const isOpen = openMenuId === task.id;
  
    return (
      <div className="relative task-menu">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(isOpen ? null : task.id);
          }}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <MoreHorizontal size={16} />
        </button>
        
        {isOpen && (
          <div 
            className="absolute bg-white rounded-md shadow-lg border"
            style={{
              zIndex: 9999,
              right: '0px',
              top: '0px',
              width: '12rem',
              minWidth: '150px',
              transform: 'translate(0, -85%)' // Changed from -10% to -85% to move dropdown higher
            }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  setEditingTask(task);
                  setOpenMenuId(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setDeletingTask(task);
                  setOpenMenuId(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const BulkActionsMenu = () => {
    if (selectedTasks.size === 0) return null;

    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {selectedTasks.size} task(s) selected
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleBulkStatusUpdate("TO-DO")}
            className="px-3 py-1 text-sm bg-pink-100 text-pink-800 rounded-full hover:bg-pink-200"
          >
            Move to Todo
          </button>
          <button
            onClick={() => handleBulkStatusUpdate("IN-PROGRESS")}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
          >
            Move to In-Progress
          </button>
          <button
            onClick={() => handleBulkStatusUpdate("COMPLETED")}
            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200"
          >
            Move to Completed
          </button>
          <button
            onClick={() => setShowBulkDelete(true)}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full hover:bg-red-200"
          >
            Delete Selected
          </button>
        </div>
      </div>
    );
  };

  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = searchCategory === "All" || task.category === searchCategory;
      
      let matchesDueDate = true;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Calculate start and end of current week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Set to Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
      
      switch (dueDateFilter) {
        case "Today":
          matchesDueDate = taskDate.getTime() === today.getTime();
          break;
        case "Tomorrow":
          matchesDueDate = taskDate.getTime() === tomorrow.getTime();
          break;
        case "ThisWeek":
          matchesDueDate = taskDate >= startOfWeek && taskDate <= endOfWeek;
          break;
        default:
          matchesDueDate = true;
      }
      
      return matchesSearch && matchesCategory && matchesDueDate;
    });
  };
  

  const TaskSection = ({ status, title, color }: { status: TaskStatus, title: string, color: string }) => {
    const filteredTasks = getFilteredTasks().filter((task) => task.status === status);
  
    const renderTask = (task: Task) => (
      <div className="group relative px-6 py-3 border-b flex items-center bg-white hover:bg-gray-50 transition-colors duration-200">
        <input
          type="checkbox"
          className="mr-4"
          checked={selectedTasks.has(task.id)}
          onChange={() => handleTaskSelection(task.id)}
        />
        {/* Show task title on all screen sizes */}
        <div className={`w-full sm:w-1/3 ${task.status === "COMPLETED" ? "line-through text-gray-500" : ""}`}>
          {task.title}
        </div>
  
        {/* Hide due date and task status in mobile view */}
        <div className="hidden sm:block w-1/4">
          {formatDueDate(task.dueDate)}
        </div>
        <div className="hidden sm:block w-1/4">
          <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
            {task.status}
          </span>
        </div>
  
        {/* Hide category in mobile view */}
        <div className="w-1/4 flex items-center justify-between">
          <span className={task.status === "COMPLETED" ? "text-gray-500" : ""}>
            {task.category}
          </span>
          <div className="relative" style={{ zIndex: openMenuId === task.id ? 9999 : 1 }}>
            <TaskActionsMenu task={task} />
          </div>
        </div>
      </div>
    );
  
    return (
      <div className="mb-4">
        <div className={`${color} px-6 py-3 flex items-center justify-between rounded-t-lg`}>
          <h2 className="font-medium">
            {title} ({filteredTasks.length})
          </h2>
          <ChevronUp size={20} />
        </div>
  
        <div className="bg-gray-50 rounded-b-lg">
          <div className="flex flex-col space-y-6 p-4">
            {status === "TO-DO" && (
              <div className="flex-shrink-0 w-full">
                {!showAddTask ? (
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="w-full p-4 flex items-center space-x-2 text-purple-600 justify-center"
                  >
                    <PlusCircle size={20} />
                    <span>ADD TASK</span>
                  </button>
                ) : (
                  <AddTask onAdd={handleAddTask} onCancel={() => setShowAddTask(false)} />
                )}
              </div>
            )}
  
            {filteredTasks.length === 0 ? (
              "No Task"
            ) : (
              <DragRearrangeTask
                tasks={filteredTasks}
                droppableId={status}
                renderTask={renderTask}
              />
            )}
          </div>
        </div>
      </div>
    );
  };
  

  const filteredTasks = getFilteredTasks(); 

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user} 
          handleSignOut={handleSignOut}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchCategory={searchCategory}
          onCategoryChange={setSearchCategory}
          dueDateFilter={dueDateFilter}
          onDueDateFilterChange={setDueDateFilter}
        />
  
        <main className="max-w-7xl mx-auto p-8">
          <div className="bg-white rounded-lg shadow">
            {filteredTasks.length === 0 ? (
              // If there are no filtered tasks, show the NoResults component
              <NoResults />
            ) : (
              <>
                <div className="flex items-center px-6 py-3 border-b text-sm font-medium text-gray-700">
                  <div className="w-8" /> {/* Checkbox column */}
                  <div className="w-1/3">Task Name</div>
                  <div className="w-1/4 flex items-center space-x-2">
                    <span>Due On</span>
                    <div className="flex flex-col items-center space-y-0">
                      <ChevronUp size={16} className="text-gray-500 -mb-1" />
                      <ChevronDown size={16} className="text-gray-500 -mt-1" />
                    </div>
                  </div>
                  <div className="w-1/4">Task Status</div>
                  <div className="w-1/4">Task Category</div>
                </div>
  
                <TaskSection status="TO-DO" title="Todo" color="bg-pink-100" />
                <TaskSection status="IN-PROGRESS" title="In-Progress" color="bg-blue-100" />
                <TaskSection status="COMPLETED" title="Completed" color="bg-green-100" />
              </>
            )}
          </div>

          <BulkActionsMenu />

          {editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <EditTask
                task={editingTask}
                onSave={handleEditTask}
                onCancel={() => setEditingTask(null)}
              />
            </div>
          </div>
        )}

        {deletingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <DeleteTask
              onDelete={() => handleDeleteTask(deletingTask.id)}
              onCancel={() => setDeletingTask(null)}
            />
          </div>
        )}

        {showBulkDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Delete Selected Tasks</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedTasks.size} selected tasks? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowBulkDelete(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Tasks
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  </DragDropContext>
);
};

export default TaskBuddyDashboard;