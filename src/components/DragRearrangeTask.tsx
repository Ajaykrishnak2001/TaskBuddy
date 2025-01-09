import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";

// Define Task type inline since we don't have a types file
interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: "TO-DO" | "IN-PROGRESS" | "COMPLETED";
  category: "Work" | "Personal";
  createdAt: string;
  userId: string;
  order?: number;
}

interface DragRearrangeTaskProps {
  tasks: Task[];
  droppableId: string;
  renderTask: (task: Task) => React.ReactNode;
}

const DragRearrangeTask: React.FC<DragRearrangeTaskProps> = ({
  tasks,
  droppableId,
  renderTask,
}) => {
  return (
    <Droppable droppableId={droppableId} type="TASK">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-[50px] transition-colors duration-200 ${
            snapshot.isDraggingOver ? 'bg-gray-100' : ''
          }`}
        >
          {tasks.map((task, index) => (
            <Draggable 
              key={task.id} 
              draggableId={task.id} 
              index={index}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...provided.draggableProps.style,
                    transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'translate(0, 0)',
                  }}
                  className={`mb-2 transition-opacity duration-200 ${
                    snapshot.isDragging ? 'opacity-50 shadow-lg' : ''
                  }`}
                >
                  {renderTask(task)}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DragRearrangeTask;