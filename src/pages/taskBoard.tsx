import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Header from '../components/header';
import AddTask from '../components/AddTask';
import EditTask from '../components/EditTask';
import DeleteTask from '../components/DeleteTask';
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
}

const TaskBuddyBoard = () => {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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
    
    return dueDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  
  const getFilteredTasks = () => {
    return tasks.filter(task => {
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
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
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
      setTasks((prevTasks) => [...prevTasks, { ...taskToAdd, id: docRef.id } as Task]);
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
        dueDate: updatedTask.dueDate,
        status: updatedTask.status,
        category: updatedTask.category
      };

      await updateDoc(taskRef, taskUpdate);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTask.id ? { ...task, ...updatedTask } : task
        )
      );
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
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
    
    draggedTask.status = destination.droppableId as TaskStatus;
    updatedTasks.splice(destination.index, 0, draggedTask);
    
    const reorderedTasks = updatedTasks.map((task, index) => ({
      ...task,
      order: index,
    }));
    
    setTasks(reorderedTasks);
    
    try {
      const batch = writeBatch(db);
      reorderedTasks.forEach((task) => {
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
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
            <div className="py-1">
              <button
                onClick={() => {
                  setEditingTask(task);
                  setOpenMenuId(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setDeletingTask(task);
                  setOpenMenuId(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TaskColumn = ({ status, title, bgColor, textColor }: {
    status: TaskStatus;
    title: string;
    bgColor: string;
    textColor: string;
  }) => {
    const filteredTasks = getFilteredTasks().filter((task) => task.status === status);
  
    return (
      <Droppable droppableId={status}>
        {(provided) => (
          <div className={`${bgColor} rounded-lg p-4`} ref={provided.innerRef} {...provided.droppableProps}>
            <div className="mb-4 flex items-center justify-between">
              <span className={`${textColor} text-xs px-3 py-1 rounded-full font-medium`}>
                {title} ({filteredTasks.length})
              </span>
              {status === "TO-DO" && (
                <button
                  onClick={() => setShowAddTask(true)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <PlusCircle size={20} />
                </button>
              )}
            </div>
  
            {filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-4 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-medium ${status === "COMPLETED" ? "line-through text-gray-500" : ""}`}>
                            {task.title}
                          </h3>
                          <TaskActionsMenu task={task} />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className={status === "COMPLETED" ? "line-through" : ""}>
                            {task.category}
                          </span>
                          <span className={status === "COMPLETED" ? "line-through" : ""}>
                            {formatDueDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            ) : (
              "No Tasks"
            )}
          </div>
        )}
      </Droppable>
    );
  };
  
  const noTasksFound = !['TO-DO', 'IN-PROGRESS', 'COMPLETED'].some(status => getFilteredTasks().some(task => task.status === status));

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
          {noTasksFound ? (
            <NoResults />
          ) : (
            <div className="grid grid-cols-3 gap-6">
              <TaskColumn
                status="TO-DO"
                title="TO-DO"
                bgColor="bg-pink-50"
                textColor="bg-pink-200 text-pink-900"
              />
              <TaskColumn
                status="IN-PROGRESS"
                title="IN-PROGRESS"
                bgColor="bg-blue-50"
                textColor="bg-blue-200 text-blue-900"
              />
              <TaskColumn
                status="COMPLETED"
                title="COMPLETED"
                bgColor="bg-green-50"
                textColor="bg-green-200 text-green-900"
              />
            </div>
          )}
        </main>

        {showAddTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <AddTask onAdd={handleAddTask} onCancel={() => setShowAddTask(false)} />
            </div>
          </div>
        )}

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
      </div>
    </DragDropContext>
  );
};

export default TaskBuddyBoard;