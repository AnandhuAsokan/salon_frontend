// src/components/AddTodoModal.tsx
import React, { useState } from 'react';
import api from '../services/api';
import './addTodoModal.css';

interface AddTodoModalProps {
  onClose: () => void;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
      // The API key and JWT are automatically added by interceptors
      await api.post('/todos/', { title, description });
      
      // Close the modal on success
      onClose();
      // In a real app, you would also refresh the todo list here

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add todo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Todo</h2>
          <button onClick={onClose} className="modal-close-button">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <p className="error-message">{error}</p>}
          
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'OK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTodoModal;