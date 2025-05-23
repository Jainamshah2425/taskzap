// // src/components/board/TaskCard.jsx
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import React from 'react';    

// export default function TaskCard({ task, onEdit, onDelete }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging
//   } = useSortable({
//     id: task.id?.toString() || '', // Ensure string ID
//     data: {
//       type: 'task',
//       task
//     }
//   });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1
//   };

//   // Handle potential undefined/null values
//   if (!task) {
//     return null;
//   }

//   const priorityColors = {
//     high: 'bg-red-100 text-red-800',
//     medium: 'bg-yellow-100 text-yellow-800',
//     low: 'bg-green-100 text-green-800'
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//     } catch (error) {
//       return '';
//     }
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       className="bg-white rounded-lg p-3 shadow border border-gray-200 hover:shadow-md transition cursor-grab active:cursor-grabbing"
//     >
//       {/* Header with title and priority */}
//       <div className="flex justify-between items-start mb-2">
//         <h4 className="font-medium text-gray-900 flex-1 mr-2 line-clamp-2">
//           {task.title || 'Untitled Task'}
//         </h4>
//         <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${priorityColors[task.priority] || 'bg-gray-100 text-gray-800'}`}>
//           {task.priority || 'medium'}
//         </span>
//       </div>
      
//       {/* Description */}
//       {task.description && (
//         <p className="text-gray-600 text-sm mb-3 line-clamp-3">
//           {task.description}
//         </p>
//       )}
      
//       {/* Footer with due date and actions */}
//       <div className="flex justify-between items-center">
//         <div className="flex-1">
//           {task.due_date && (
//             <span className="text-xs text-gray-500">
//               Due: {formatDate(task.due_date)}
//             </span>
//           )}
//         </div>
        
//         {/* Action buttons */}
//         <div className="flex space-x-1 ml-2">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               e.preventDefault();
//               onEdit && onEdit(task);
//             }}
//             className="text-gray-400 hover:text-blue-600 transition p-1 rounded"
//             title="Edit task"
//             type="button"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//             </svg>
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               e.preventDefault();
//               onDelete && onDelete(task.id);
//             }}
//             className="text-gray-400 hover:text-red-600 transition p-1 rounded"
//             title="Delete task"
//             type="button"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

export default function TaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id?.toString() || '', // Ensure string ID
    data: {
      type: 'task',
      task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  // Handle potential undefined/null values
  if (!task) {
    return null;
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return '';
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Edit task clicked:', task.id);
    if (onEdit && typeof onEdit === 'function') {
      onEdit(task);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete task clicked:', task.id);
    
    if (onDelete && typeof onDelete === 'function') {
      // Show confirmation dialog
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${task.title || 'this task'}"?`
      );
      
      if (confirmDelete) {
        onDelete(task.id);
      }
    } else {
      console.error('onDelete function not provided to TaskCard');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg p-3 shadow border border-gray-200 hover:shadow-md transition cursor-grab active:cursor-grabbing group"
    >
      {/* Drag handle area (most of the card) */}
      <div {...listeners} className="flex-1">
        {/* Header with title and priority */}
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 flex-1 mr-2 line-clamp-2">
            {task.title || 'Untitled Task'}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${priorityColors[task.priority] || 'bg-gray-100 text-gray-800'}`}>
            {task.priority || 'medium'}
          </span>
        </div>
        
        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {task.description}
          </p>
        )}
        
        {/* Due date */}
        <div className="mb-2">
          {task.due_date && (
            <span className="text-xs text-gray-500">
              Due: {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>
      
      {/* Action buttons - separate from drag listeners */}
      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className="text-gray-400 hover:text-blue-600 transition p-1 rounded hover:bg-blue-50"
          title="Edit task"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition p-1 rounded hover:bg-red-50"
          title="Delete task"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
