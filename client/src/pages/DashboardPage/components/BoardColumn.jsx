import React from 'react';
import TaskCard from './TaskCard';

const BoardColumn = ({
  title,
  status,
  tasks,
  users,
  isAdmin,
  onMoveTask,
  onUpdateAssignee,
  onDeleteTask,
  editingAssignee,
  setEditingAssignee,
}) => {
  return (
    <div
      style={{
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '16px',
        minHeight: '300px',
        width: '100%',
        maxWidth: '320px',
        flexShrink: 0,
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
        {title} ({tasks.length})
      </h3>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          column={status}
          users={users}
          isAdmin={isAdmin}
          onMoveTask={onMoveTask}
          onUpdateAssignee={onUpdateAssignee}
          onDeleteTask={onDeleteTask}
          editingAssignee={editingAssignee}
          setEditingAssignee={setEditingAssignee}
        />
      ))}
    </div>
  );
};

export default BoardColumn;