// src/components/EditTodoModal.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Todo } from '../types';

interface EditTodoModalProps {
  todo: Todo;
  onClose: () => void;
}

const EditTodoModal: React.FC<EditTodoModalProps> = ({ todo, onClose }) => {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [status, setStatus] = useState(todo.status || 'pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.put(`/todos/${todo.id}`, { 
        title, 
        description,
        status 
      });
      
      // Close the modal on success
      onClose();

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update todo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Todo</h2>
          <button onClick={onClose} className="modal-close-button">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <p className="error-message">{error}</p>}
          
          <div className="form-group">
            <label htmlFor="edit-title">Title</label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-status">Status</label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "pending" | "completed" | "on-hold")
              }
              disabled={isLoading}
              className="status-select"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTodoModal;