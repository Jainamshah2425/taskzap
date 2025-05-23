// src/components/board/Column.jsx
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import React from 'react';
export default function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask }) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column?.id?.toString() || 'unknown',
    data: { type: 'column' },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column?.id?.toString() || 'unknown',
    data: { type: 'column', column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle missing or invalid data
  if (!column) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 min-w-[300px]">
        <div className="text-red-600 text-sm">Error: Invalid column data</div>
      </div>
    );
  }

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const taskIds = safeTasks.map((task) => task?.id?.toString()).filter(Boolean);

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
   
      {...attributes}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-[300px] max-w-[350px] flex-shrink-0 flex flex-col"
      style={{
        ...{style,
        height: 'fit-content',
        maxHeight: 'calc(100vh - 120px)',
      }}}
    >
      {/* Column Header */}
      <div 
        className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
        {...listeners}
      >
        <h3 className="font-semibold text-lg text-gray-800 truncate">
          {column.title || 'Untitled Column'}
        </h3>
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2">
          {safeTasks.length}
        </span>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 min-h-[100px] mb-4">
        <div 
          className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-1"
          style={{ scrollbarWidth: 'thin' }}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {safeTasks.map((task) => {
              if (!task || !task.id) {
                console.warn('Invalid task data:', task);
                return null;
              }
              
              return (
                <TaskCard
                  key={task.id.toString()}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              );
            })}
          </SortableContext>
          
          {/* Empty state */}
          {safeTasks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-sm">No tasks yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onAddTask && onAddTask();
        }}
        className="w-full bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center group"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">Add Task</span>
      </button>
    </div>
  );
}