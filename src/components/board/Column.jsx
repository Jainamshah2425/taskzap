// src/components/board/Column.jsx
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

export default function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column.id,
    data: { type: 'column' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg shadow-md p-4 min-w-[300px] flex-1 flex flex-col h-[calc(100vh-150px)]"
    >
      <div className="flex items-center justify-between mb-4" {...listeners}>
        <h3 className="font-semibold text-lg">{column.title}</h3>
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3">
  <SortableContext 
    items={tasks.map(task => task.id)} 
    strategy={verticalListSortingStrategy}
  >
    {tasks.map(task => (
      <TaskCard
        key={task.id}
        task={task}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
      />
    ))}
  </SortableContext>
</div>
      
      <button
        onClick={onAddTask}
        className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Task
      </button>
    </div>
  );
}
