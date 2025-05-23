// import { useState, useEffect } from 'react';
// import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
// import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
// import { supabase } from '../../lib/supabase';
// import { useAuth } from '../../context/AuthContext';
// import Column from './Column';
// import TaskModal from '../ui/TaskModal';
// import React from 'react';

// export default function Board() {
//   const { user } = useAuth();
//   const [columns, setColumns] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentTask, setCurrentTask] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   useEffect(() => {
//     if (user) {
//       fetchBoardData();
//     }
//   }, [user]);

//   const fetchBoardData = async () => {
//     setLoading(true);
    
//     const { data: columnsData, error: columnsError } = await supabase
//       .from('columns')
//       .select('*')
//       .order('position');
    
//     if (columnsError) {
//       console.error('Error fetching columns:', columnsError);
//       return;
//     }

//     if (columnsData.length === 0) {
//       await createDefaultColumns();
//       columnsData = [
//         { id: '1', title: 'To Do', position: 0 },
//         { id: '2', title: 'In Progress', position: 1 },
//         { id: '3', title: 'Done', position: 2 }
//       ];
//     }

//     const { data: tasksData, error: tasksError } = await supabase
//       .from('tasks')
//       .select('*')
//       .eq('user_id', user.id)
//       .order('position');
    
//     if (tasksError) {
//       console.error('Error fetching tasks:', tasksError);
//     }
    
//     setColumns(columnsData || []);
//     setTasks(tasksData || []);
//     setLoading(false);
//   };

//   const createDefaultColumns = async () => {
//     const { data: boardData } = await supabase
//       .from('boards')
//       .insert({ title: 'My Board', user_id: user.id })
//       .select()
//       .single();
    
//     if (!boardData) return;
    
//     await supabase.from('columns').insert([
//       { title: 'To Do', board_id: boardData.id, position: 0 },
//       { title: 'In Progress', board_id: boardData.id, position: 1 },
//       { title: 'Done', board_id: boardData.id, position: 2 }
//     ]);
//   };

//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
    
//     if (!over) return;

//     const activeId = active.id;
//     const overId = over.id;
    
//     const activeTask = tasks.find(t => t.id === activeId);
//     const overTask = tasks.find(t => t.id === overId);

//     if (!activeTask || !overTask) return;

//     if (activeTask.column_id !== overTask.column_id) {
//       const updatedTask = {
//         ...activeTask,
//         column_id: overTask.column_id
//       };

//       const { error } = await supabase
//         .from('tasks')
//         .update({ column_id: overTask.column_id })
//         .eq('id', activeId);

//       if (!error) {
//         setTasks(tasks.map(task => 
//           task.id === activeId ? updatedTask : task
//         ));
//       }
//     } else {
//       const oldIndex = tasks.findIndex(t => t.id === activeId);
//       const newIndex = tasks.findIndex(t => t.id === overId);
      
//       const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
//       setTasks(reorderedTasks);
      
//       await supabase.from('tasks').upsert(
//         reorderedTasks.map((task, index) => ({
//           id: task.id,
//           position: index
//         }))
//       );
//     }
//   };

//   const addTask = async (taskData) => {
//     const newTask = {
//       ...taskData,
//       user_id: user.id,
//       position: tasks.filter(t => t.column_id === taskData.column_id).length
//     };
    
//     const { data, error } = await supabase
//       .from('tasks')
//       .insert(newTask)
//       .select()
//       .single();
    
//     if (error) {
//       console.error('Error adding task:', error);
//       return;
//     }
    
//     setTasks([...tasks, data]);
//   };

//   const updateTask = async (id, taskData) => {
//     const { error } = await supabase
//       .from('tasks')
//       .update(taskData)
//       .eq('id', id);
    
//     if (error) {
//       console.error('Error updating task:', error);
//       return;
//     }
    
//     setTasks(tasks.map(task => 
//       task.id === id ? { ...task, ...taskData } : task
//     ));
//   };

//   const handleEditTask = (task) => {
//     setCurrentTask(task);
//     setIsModalOpen(true);
//   };

//   const handleDeleteTask = async (taskId) => {
//     if (window.confirm('Are you sure you want to delete this task?')) {
//       const { error } = await supabase
//         .from('tasks')
//         .delete()
//         .eq('id', taskId);
      
//       if (!error) {
//         setTasks(tasks.filter(task => task.id !== taskId));
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
      
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
//           {columns.map(column => (
//             <Column
//               key={column.id}
//               column={column}
//               tasks={tasks.filter(task => task.column_id === column.id)}
//               onAddTask={() => setIsModalOpen({ column_id: column.id })}
//               onEditTask={handleEditTask}
//               onDeleteTask={handleDeleteTask}
//             />
//           ))}
//         </div>
//       </DndContext>
      
//       {isModalOpen && (
//         <TaskModal
//           task={currentTask}
//           columns={columns}
//           onClose={() => {
//             setIsModalOpen(false);
//             setCurrentTask(null);
//           }}
//           onSave={(task) => {
//             if (task.id) {
//               updateTask(task.id, task);
//             } else {
//               addTask(task);
//             }
//             setIsModalOpen(false);
//             setCurrentTask(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }


// // src/components/board/Board.jsx



import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Column from './Column';
import TaskModal from '../ui/TaskModal';
import React from 'react';

export default function Board() {
  const { user } = useAuth();
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) {
      fetchBoardData();
    }
  }, [user]);

  const fetchBoardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .order('position');
      
      if (columnsError) throw columnsError;

      // Create default columns if none exist
      let finalColumnsData = columnsData;
      if (!columnsData || columnsData.length === 0) {
        await createDefaultColumns();
        finalColumnsData = [
          { id: '1', title: 'To Do', position: 0 },
          { id: '2', title: 'In Progress', position: 1 },
          { id: '3', title: 'Done', position: 2 }
        ];
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      
      if (tasksError) throw tasksError;
      
      setColumns(finalColumnsData || []);
      setTasks(tasksData || []);
    } catch (err) {
      console.error('Error fetching board data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultColumns = async () => {
    try {
      // Check if board exists first
      let { data: boardData } = await supabase
        .from('boards')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Create board if it doesn't exist
      if (!boardData) {
        const { data: newBoard } = await supabase
          .from('boards')
          .insert({ title: 'My Board', user_id: user.id })
          .select()
          .single();
        boardData = newBoard;
      }
      
      if (boardData) {
        await supabase.from('columns').insert([
          { title: 'To Do', board_id: boardData.id, position: 0 },
          { title: 'In Progress', board_id: boardData.id, position: 1 },
          { title: 'Done', board_id: boardData.id, position: 2 }
        ]);
      }
    } catch (err) {
      console.error('Error creating default columns:', err);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    const activeTask = tasks.find(t => t.id.toString() === activeId.toString());
    
    if (!activeTask) return;

    // Check if we're dropping on a column or task
    const overColumn = columns.find(c => c.id.toString() === overId.toString());
    const overTask = tasks.find(t => t.id.toString() === overId.toString());

    try {
      if (overColumn) {
        // Dropping on a column
        if (activeTask.column_id !== overColumn.id) {
          const { error } = await supabase
            .from('tasks')
            .update({ column_id: overColumn.id })
            .eq('id', activeTask.id);

          if (error) throw error;

          setTasks(tasks.map(task => 
            task.id === activeTask.id 
              ? { ...task, column_id: overColumn.id }
              : task
          ));
        }
      } else if (overTask && activeTask.column_id === overTask.column_id) {
        // Reordering within the same column
        const oldIndex = tasks.findIndex(t => t.id === activeTask.id);
        const newIndex = tasks.findIndex(t => t.id === overTask.id);
        
        const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
        setTasks(reorderedTasks);
        
        // Update positions in database
        const tasksToUpdate = reorderedTasks.map((task, index) => ({
          id: task.id,
          position: index
        }));

        await supabase.from('tasks').upsert(tasksToUpdate);
      } else if (overTask && activeTask.column_id !== overTask.column_id) {
        // Moving to a different column
        const { error } = await supabase
          .from('tasks')
          .update({ column_id: overTask.column_id })
          .eq('id', activeTask.id);

        if (error) throw error;

        setTasks(tasks.map(task => 
          task.id === activeTask.id 
            ? { ...task, column_id: overTask.column_id }
            : task
        ));
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task position');
    }
  };

  const addTask = async (taskData) => {
    try {
      const newTask = {
        ...taskData,
        user_id: user.id,
        position: tasks.filter(t => t.column_id === taskData.column_id).length
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
      
      if (error) throw error;
      
      setTasks(prevTasks => [...prevTasks, data]);
      console.log('Task added successfully:', data);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, ...taskData } : task
        )
      );
      console.log('Task updated successfully:', id);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const handleEditTask = (task) => {
    console.log('Editing task:', task);
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    console.log('Attempting to delete task:', taskId);
    
    if (!taskId) {
      console.error('No task ID provided for deletion');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      console.log('Task deleted successfully:', taskId);
      
      // Show success message (optional)
      // You could add a toast notification here
      
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      alert('Error deleting task: ' + err.message);
    }
  };

  const handleOpenModal = (columnId = null) => {
    setCurrentTask(null);
    setIsModalOpen({ column_id: columnId });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button 
            onClick={fetchBoardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Add Task
        </button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
          {columns.map(column => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks.filter(task => task.column_id === column.id)}
              onAddTask={() => handleOpenModal(column.id)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DndContext>
      
      {isModalOpen && (
        <TaskModal
          task={currentTask}
          columns={columns}
          defaultColumnId={isModalOpen.column_id}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentTask(null);
          }}
          onSave={(task) => {
            if (task.id) {
              updateTask(task.id, task);
            } else {
              addTask(task);
            }
            setIsModalOpen(false);
            setCurrentTask(null);
          }}
        />
      )}
    </div>
  );
}
