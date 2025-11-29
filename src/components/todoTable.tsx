// src/components/TodoTable.tsx
import React from 'react';
import { Todo } from '../types';

interface TodoTableProps {
  todos: Todo[];
  onViewEdit: (id: string) => void; 
  onDelete: (todo: Todo) => void;
  currentPage: number;
  itemsPerPage: number;
}

// Simple SVG Icons
const ViewIcon = () => <span className="icon action-view" title="View">👁️</span>;
const EditIcon = () => <span className="icon action-edit" title="Edit">✏️</span>;
const DeleteIcon = () => <span className="icon action-delete" title="Delete">🗑️</span>;

const TodoTable: React.FC<TodoTableProps> = ({ 
  todos, 
  onViewEdit, 
  onDelete,
  currentPage,
  itemsPerPage 
}) => {
  // Calculate the starting index for row numbers based on current page
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="todo-table-wrapper">
      <table className="todo-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.length > 0 ? (
            todos.map((todo, index) => (
              <tr key={todo.id}>
                <td>{startIndex + index + 1}</td>
                <td>{todo.title}</td>
                <td>{todo.description}</td>
                <td>
                  <span className={`status-badge status-${todo.status}`}>
                    {todo.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="action-column">
                  {/* Both view and edit buttons call onViewEdit with the todo's id */}
                  <button onClick={() => onViewEdit(todo.id.toString())} title="View Todo">
                    <ViewIcon />
                  </button>
                  <button onClick={() => onViewEdit(todo.id.toString())} title="Edit Todo">
                    <EditIcon />
                  </button>
                  <button onClick={() => onDelete(todo)} title="Delete Todo">
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="no-todos-message">No todos found. Try adding one!</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TodoTable;