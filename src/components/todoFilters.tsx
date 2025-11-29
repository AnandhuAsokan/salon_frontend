// src/components/TodoFilters.tsx
import React from 'react';
import type { TodoFilters } from '../types';

interface TodoFiltersProps {
  filters: TodoFilters;
  onFilterChange: (newFilters: TodoFilters) => void;
}

const TodoFilters: React.FC<TodoFiltersProps> = ({ filters, onFilterChange }) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, date: e.target.value });
  };

  return (
    <div className="todo-filters">
      <div className="filter-group">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select id="status-filter" value={filters.status} onChange={handleStatusChange}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="date-filter">Filter by Date:</label>
        <input 
          type="date" 
          id="date-filter" 
          value={filters.date} 
          onChange={handleDateChange}
        />
      </div>
    </div>
  );
};

export default TodoFilters;