// src/pages/TodosPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Todo, TodoFilters } from '../types';
import api from '../services/api';
import AddTodoModal from '../components/addToModal';
import ViewEditTodoModal from '../components/viewEditTodoModal';
import TodoTable from '../components/todoTable';
import Pagination from '../components/pagination.tsx';
import './todoPage.css';

const TodosPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  
  // State for todos and filters
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filters, setFilters] = useState<TodoFilters>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalTodos, setTotalTodos] = useState(0);

  // Greeting effect
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    };
    setGreeting(getGreeting());
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(totalTodos / itemsPerPage);

  // Fetch todos effect
  const fetchTodos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await api.get('/todos', { 
        params: { 
          ...filters,
          skip,
          limit: itemsPerPage
        } 
      });
      
      // Handle different response formats
      const responseData = response.data;
      let todosArray: Todo[] = [];
      let total = 0;
      
      // Check if backend returns { todos, total } format
      if (responseData.todos && Array.isArray(responseData.todos)) {
        todosArray = responseData.todos;
        total = responseData.total || responseData.todos.length;
      } 
      // Check if it's an object (your current format)
      else if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        todosArray = Object.values(responseData).filter(
          item => typeof item === 'object' && item !== null && 'title' in item
        ) as Todo[];
        total = todosArray.length; // Will need separate count call
      } 
      // Check if it's already an array
      else if (Array.isArray(responseData)) {
        todosArray = responseData;
        total = responseData.length;
      }
      
      setTodos(todosArray);
      
      // If backend doesn't return total, we need to fetch it separately or estimate
      if (responseData.total !== undefined) {
        setTotalTodos(responseData.total);
      } else {
        // Fallback: estimate based on whether we got a full page
        // This is not ideal - better to modify backend to return total
        if (todosArray.length < itemsPerPage) {
          // Last page
          setTotalTodos(skip + todosArray.length);
        } else {
          // Not last page, estimate there are more
          setTotalTodos((currentPage * itemsPerPage) + 1);
        }
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch todos.');
      setTotalTodos(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filters, currentPage, itemsPerPage]); // Re-fetch when filters, page, or items per page change

  const handleAddTodo = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setCurrentPage(1); // Reset to first page when adding new todo
    fetchTodos(); // Refresh the list after adding
  };

  const handleViewEditTodo = (id: string) => {
    // Find the todo by ID
    const todo = todos.find(t => t.id.toString() === id);
    if (todo) {
      setSelectedTodo(todo);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTodo(null);
    fetchTodos(); // Refresh the list after editing
  };

  const handleDeleteTodo = async (todo: Todo) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    
    try {
      await api.delete(`/todos/${todo.id}`);
      
      // If we deleted the last item on the current page and it's not page 1, go to previous page
      if (todos.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchTodos(); // Refresh the list after deleting
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete todo.');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="todos-page">
      <header className="todos-header">
        <h1 className="greeting">
          {greeting}, {user?.name}.
        </h1>
        <button onClick={logout} className="logout-button" title="Logout">
          <svg className="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </header>

      <div className="todos-controls">
        <button className="add-todo-button" onClick={handleAddTodo}>
          + Add Todo
        </button>
        {/* <TodoFiltersValue filters={filters || { status: '', date: '' } as TodoFilters} onFilterChange={setFilters} /> */}
      </div>

      <div className="todos-content">
        {isLoading && <p>Loading todos...</p>}
        {error && <p className="error-message">{error}</p>}
        {!isLoading && !error && (
          <>
            <TodoTable 
              todos={todos} 
              onViewEdit={handleViewEditTodo} 
              onDelete={handleDeleteTodo}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
            {totalTodos > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        )}
      </div>

      {isAddModalOpen && <AddTodoModal onClose={handleCloseAddModal} />}
      {isEditModalOpen && selectedTodo && (
        <ViewEditTodoModal todo={selectedTodo} onClose={handleCloseEditModal} />
      )}
    </div>
  );
};

export default TodosPage;