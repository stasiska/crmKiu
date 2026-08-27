import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { fetchTasks, createTask, updateTask, deleteTask, fetchUsers } from '../../api';
import BoardColumn from './components/BoardColumn';
import CreateTaskModal from './components/CreateTaskModal';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(null); // { taskId, column }

  const isAdmin = user?.role === 'admin';

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, usersData] = await Promise.all([
        fetchTasks(),
        fetchUsers(),
      ]);
      const grouped = { todo: [], inProgress: [], done: [] };
      tasksData.forEach(task => {
        if (grouped[task.status]) grouped[task.status].push(task);
        else grouped.todo.push(task);
      });
      setTasks(grouped);
      setUsers(usersData);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const moveTask = async (taskId, fromStatus, toStatus) => {
    try {
      await updateTask(taskId, { status: toStatus });
      setTasks(prev => {
        const task = prev[fromStatus].find(t => t.id === taskId);
        if (!task) return prev;
        return {
          ...prev,
          [fromStatus]: prev[fromStatus].filter(t => t.id !== taskId),
          [toStatus]: [...prev[toStatus], { ...task, status: toStatus }],
        };
      });
    } catch (err) {
      alert('Ошибка перемещения: ' + err.message);
    }
  };

  const updateAssignee = async (taskId, column, newUserId) => {
    if (!isAdmin) return;
    try {
      await updateTask(taskId, { assignedTo: newUserId || null });
      setTasks(prev => ({
        ...prev,
        [column]: prev[column].map(t =>
          t.id === taskId ? { ...t, assignedTo: newUserId || null } : t
        ),
      }));
      setEditingAssignee(null);
    } catch (err) {
      alert('Ошибка обновления ответственного: ' + err.message);
    }
  };

  const handleCreateTask = async (newTaskData) => {
    try {
      const payload = {
        title: newTaskData.title,
        description: newTaskData.description,
        status: newTaskData.status || 'todo',
      };
      if (isAdmin && newTaskData.assignedTo) {
        payload.assignedTo = parseInt(newTaskData.assignedTo);
      }
      const created = await createTask(payload);
      setTasks(prev => ({
        ...prev,
        [created.status]: [created, ...prev[created.status]],
      }));
    } catch (err) {
      alert('Ошибка создания: ' + err.message);
    }
  };

  const handleDeleteTask = async (taskId, column) => {
    if (!window.confirm('Удалить задачу?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => ({
        ...prev,
        [column]: prev[column].filter(t => t.id !== taskId),
      }));
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>📋 Доска задач</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '8px 16px',
            background: '#1557a6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Новая задача
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
        <BoardColumn
          title="To Do"
          status="todo"
          tasks={tasks.todo}
          users={users}
          isAdmin={isAdmin}
          onMoveTask={moveTask}
          onUpdateAssignee={updateAssignee}
          onDeleteTask={handleDeleteTask}
          editingAssignee={editingAssignee}
          setEditingAssignee={setEditingAssignee}
        />
        <BoardColumn
          title="In Progress"
          status="inProgress"
          tasks={tasks.inProgress}
          users={users}
          isAdmin={isAdmin}
          onMoveTask={moveTask}
          onUpdateAssignee={updateAssignee}
          onDeleteTask={handleDeleteTask}
          editingAssignee={editingAssignee}
          setEditingAssignee={setEditingAssignee}
        />
        <BoardColumn
          title="Done"
          status="done"
          tasks={tasks.done}
          users={users}
          isAdmin={isAdmin}
          onMoveTask={moveTask}
          onUpdateAssignee={updateAssignee}
          onDeleteTask={handleDeleteTask}
          editingAssignee={editingAssignee}
          setEditingAssignee={setEditingAssignee}
        />
      </div>

      {showModal && (
        <CreateTaskModal
          users={users}
          isAdmin={isAdmin}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
};

export default DashboardPage;