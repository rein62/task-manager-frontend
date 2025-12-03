const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Общая функция для API запросов
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Аутентификация
export const authAPI = {
  login: (username, password) => 
    apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

// Пользователи
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  create: (userData) => 
    apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  delete: (id) => 
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
  updateRole: (id, role) => 
    apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
};

// Исполнители
export const executorsAPI = {
  getAll: () => apiRequest('/executors'),
  create: (executorData) => 
    apiRequest('/executors', {
      method: 'POST',
      body: JSON.stringify(executorData),
    }),
  delete: (id) => 
    apiRequest(`/executors/${id}`, {
      method: 'DELETE',
    }),
  updateStatus: (id, status) => 
    apiRequest(`/executors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Задачи
export const tasksAPI = {
  getAll: () => apiRequest('/tasks'),
  create: (taskData) => 
    apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  delete: (id) => 
    apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    }),
  updateStatus: (id, status) => 
    apiRequest(`/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  // Добавляем метод для обновления задачи
  update: (id, taskData) =>
    apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),
};
