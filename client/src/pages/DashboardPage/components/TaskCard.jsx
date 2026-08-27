import React from 'react';

const TaskCard = ({
  task,
  column,
  users,
  isAdmin,
  onMoveTask,
  onUpdateAssignee,
  onDeleteTask,
  editingAssignee,
  setEditingAssignee,
}) => {
  const assignedUser = users.find(u => u.id === task.assignedTo);
  const assignedName = assignedUser ? assignedUser.name : 'Не назначен';

  const isEditing = editingAssignee && editingAssignee.taskId === task.id && editingAssignee.column === column;

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '12px 14px',
        borderRadius: '8px',
        marginBottom: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '14px' }}>{task.title}</div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        {task.description}
      </div>

      {/* Ответственный */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '8px',
          fontSize: '12px',
          color: '#4b5563',
        }}
      >
        <span style={{ fontWeight: 500 }}>Ответственный:</span>
        {isAdmin ? (
          isEditing ? (
            <select
              value={task.assignedTo || ''}
              onChange={(e) => onUpdateAssignee(task.id, column, e.target.value)}
              onBlur={() => setEditingAssignee(null)}
              autoFocus
              style={{
                padding: '2px 6px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              <option value="">Не назначен</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          ) : (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                background: '#e5e7eb',
                borderRadius: '12px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
              onClick={() => setEditingAssignee({ column, taskId: task.id })}
            >
              {assignedName}
            </span>
          )
        ) : (
          <span>{assignedName}</span>
        )}
      </div>

      {/* Кнопки действий */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
        {column !== 'todo' && (
          <button
            onClick={() => onMoveTask(task.id, column, 'todo')}
            style={{
              fontSize: '11px',
              background: '#e5e7eb',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ← To Do
          </button>
        )}
        {column !== 'inProgress' && (
          <button
            onClick={() => onMoveTask(task.id, column, 'inProgress')}
            style={{
              fontSize: '11px',
              background: '#dbeafe',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            → In Progress
          </button>
        )}
        {column !== 'done' && (
          <button
            onClick={() => onMoveTask(task.id, column, 'done')}
            style={{
              fontSize: '11px',
              background: '#d1fae5',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ✓ Done
          </button>
        )}
        <button
          onClick={() => onDeleteTask(task.id, column)}
          style={{
            fontSize: '11px',
            background: '#fee2e2',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#b91c1c',
          }}
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default TaskCard;