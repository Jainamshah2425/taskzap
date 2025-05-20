import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Column from './Column';
import TaskModal from '../ui/TaskModal';

export default function Board() {
  const { user } = useAuth();
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(true);

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
    
    const { data: columnsData, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .order('position');
    
    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
      return;
    }

    if (columnsData.length === 0) {
      await createDefaultColumns();
      columnsData = [
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
    
    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }
    
    setColumns(columnsData || []);
    setTasks(tasksData || []);
    setLoading(false);
  };

  const createDefaultColumns = async () => {
    const { data: boardData } = await supabase
      .from('boards')
      .insert({ title: 'My Board', user_id: user.id })
      .select()
      .single();
    
    if (!boardData) return;
    
    await supabase.from('columns').insert([
      { title: 'To Do', board_id: boardData.id, position: 0 },
      { title: 'In Progress', board_id: boardData.id, position: 1 },
      { title: 'Done', board_id: boardData.id, position: 2 }
    ]);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask || !overTask) return;

    if (activeTask.column_id !== overTask.column_id) {
      const updatedTask = {
        ...activeTask,
        column_id: overTask.column_id
      };

      const { error } = await supabase
        .from('tasks')
        .update({ column_id: overTask.column_id })
        .eq('id', activeId);

      if (!error) {
        setTasks(tasks.map(task => 
          task.id === activeId ? updatedTask : task
        ));
      }
    } else {
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);
      
      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(reorderedTasks);
      
      await supabase.from('tasks').upsert(
        reorderedTasks.map((task, index) => ({
          id: task.id,
          position: index
        }))
      );
    }
  };

  const addTask = async (taskData) => {
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
    
    if (error) {
      console.error('Error adding task:', error);
      return;
    }
    
    setTasks([...tasks, data]);
  };

  const updateTask = async (id, taskData) => {
    const { error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating task:', error);
      return;
    }
    
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...taskData } : task
    ));
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (!error) {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
      
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
              onAddTask={() => setIsModalOpen({ column_id: column.id })}
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