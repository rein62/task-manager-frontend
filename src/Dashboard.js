import React, { useState, useEffect } from 'react';

// Функции для работы с localStorage
const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Начальные данные по умолчанию
const initialExecutors = [
  { 
    id: 1, 
    name: 'Иванов Иван', 
    specialization: 'Frontend', 
    rating: 4.8, 
    status: 'free',
    completedTasks: 12
  },
  { 
    id: 2, 
    name: 'Петров Петр', 
    specialization: 'Backend', 
    rating: 4.6, 
    status: 'free',
    completedTasks: 8
  },
  { 
    id: 3, 
    name: 'Сидорова Мария', 
    specialization: 'Design', 
    rating: 4.9, 
    status: 'free',
    completedTasks: 15
  },
  { 
    id: 4, 
    name: 'Козлов Дмитрий', 
    specialization: 'Frontend', 
    rating: 4.7, 
    status: 'free',
    completedTasks: 10
  },
];

const initialTasks = [
  {
    id: 1,
    title: 'Разработать главную страницу',
    description: 'Создать адаптивный дизайн главной страницы сайта',
    deadline: '2024-12-20',
    executorId: 1,
    executorName: 'Иванов Иван',
    status: 'completed',
    createdAt: '2024-01-10'
  },
  {
    id: 2,
    title: 'Написать API для пользователей',
    description: 'Разработать REST API для управления пользователями',
    deadline: '2024-12-25',
    executorId: 2,
    executorName: 'Петров Петр',
    status: 'completed',
    createdAt: '2024-01-05'
  },
  {
    id: 3,
    title: 'Дизайн мобильного приложения',
    description: 'Создать UI/UX дизайн для мобильного приложения',
    deadline: '2024-12-30',
    executorId: 3,
    executorName: 'Сидорова Мария',
    status: 'completed',
    createdAt: '2024-01-12'
  }
];

// Начальные пользователи (только один админ)
const initialUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Администратор Системы'
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    name: 'Руководитель Проектов'
  },
  {
    id: 3,
    username: 'executor',
    password: 'executor123',
    role: 'executor',
    name: 'Исполнитель Задач'
  }
];

// Функция для восстановления администратора, если его роль была изменена
const ensureAdminUser = (users) => {
  const adminUser = users.find(user => user.role === 'admin');
  
  if (!adminUser) {
    // Если администратора нет, восстанавливаем исходного
    const defaultAdmin = initialUsers.find(user => user.role === 'admin');
    return [defaultAdmin, ...users.filter(user => user.id !== defaultAdmin.id)];
  }
  
  // Если администратор есть, но его роль была изменена, исправляем это
  const correctedUsers = users.map(user => {
    if (user.username === 'admin' && user.role !== 'admin') {
      console.warn('Обнаружена попытка изменения роли администратора. Восстанавливаем права администратора.');
      return { ...user, role: 'admin' };
    }
    return user;
  });
  
  return correctedUsers;
};

function Dashboard() {
  // Состояние авторизации с защитой администратора
  const [users, setUsers] = useState(() => {
    const storedUsers = loadFromLocalStorage('users', initialUsers);
    return ensureAdminUser(storedUsers);
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = loadFromLocalStorage('currentUser', null);
    // Если текущий пользователь - admin, гарантируем что у него правильная роль
    if (storedUser && storedUser.username === 'admin') {
      return { ...storedUser, role: 'admin' };
    }
    return storedUser;
  });
  
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'executor' });

  // Загрузка данных из localStorage при инициализации
  const [tasks, setTasks] = useState(() => loadFromLocalStorage('tasks', initialTasks));
  const [executors, setExecutors] = useState(() => loadFromLocalStorage('executors', initialExecutors));

  // Сохранение в localStorage при изменении данных с защитой администратора
  useEffect(() => {
    saveToLocalStorage('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToLocalStorage('executors', executors);
  }, [executors]);

  useEffect(() => {
    // Гарантируем что у администратора всегда правильная роль
    if (currentUser && currentUser.username === 'admin') {
      const correctedUser = { ...currentUser, role: 'admin' };
      saveToLocalStorage('currentUser', correctedUser);
      setCurrentUser(correctedUser); // Обновляем состояние если нужно
    } else {
      saveToLocalStorage('currentUser', currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    const correctedUsers = ensureAdminUser(users);
    saveToLocalStorage('users', correctedUsers);
    setUsers(correctedUsers); // Обновляем состояние если нужно
  }, [users]);

  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showExecutorForm, setShowExecutorForm] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all');
  const [executorFilter, setExecutorFilter] = useState('all');
  const [deleteTaskMode, setDeleteTaskMode] = useState(false);
  const [deleteExecutorMode, setDeleteExecutorMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedExecutors, setSelectedExecutors] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    executorId: ''
  });
  
  // Добавлено состояние для нового исполнителя
  const [newExecutor, setNewExecutor] = useState({
    name: '',
    specialization: '',
    rating: 0
  });

  // Состояние для редактирования статуса
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Функции авторизации
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      // Гарантируем что администратор всегда имеет правильную роль
      const correctedUser = user.username === 'admin' ? { ...user, role: 'admin' } : user;
      setCurrentUser(correctedUser);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Неверное имя пользователя или пароль');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Функции управления пользователями (только для админа)
  const handleAddUser = (e) => {
    e.preventDefault();
    const userExists = users.find(u => u.username === newUser.username);
    if (userExists) {
      alert('Пользователь с таким логином уже существует');
      return;
    }

    const user = {
      id: Date.now(),
      ...newUser
    };

    setUsers(prev => [...prev, user]);
    setNewUser({ username: '', password: '', name: '', role: 'executor' });
    alert('Пользователь успешно добавлен!');
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id) {
      alert('Нельзя удалить самого себя');
      return;
    }

    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete.role === 'admin') {
      alert('Нельзя удалить администратора');
      return;
    }

    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleChangeUserRole = (userId, newRole) => {
    const userToChange = users.find(user => user.id === userId);
    if (userToChange.role === 'admin') {
      alert('Нельзя изменить роль администратора');
      return;
    }

    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  // Функция для изменения статуса задачи с обновлением статуса исполнителя
  const handleStatusChange = (taskId, newStatus) => {
    if (currentUser.role === 'executor') {
      alert('У вас нет прав для изменения статуса задач');
      return;
    }

    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      // Находим задачу, которую обновили
      const updatedTask = updatedTasks.find(task => task.id === taskId);
      
      // Обновляем статус исполнителя
      if (updatedTask) {
        setExecutors(prevExecutors => 
          prevExecutors.map(executor => 
            executor.id === updatedTask.executorId 
              ? { 
                  ...executor, 
                  status: newStatus === 'in-progress' ? 'busy' : 'free'
                } 
              : executor
          )
        );
      }
      
      return updatedTasks;
    });
    setEditingTaskId(null);
  };

  // Фильтрация задач
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'all') return true;
    return task.status === taskFilter;
  });

  // Фильтрация исполнителей
  const filteredExecutors = executors.filter(executor => {
    if (executorFilter === 'all') return true;
    return executor.status === executorFilter;
  });

  // Получаем только свободных исполнителей для формы
  const freeExecutors = executors.filter(executor => executor.status === 'free');

  // Подсчет статистики
  const totalExecutors = executors.length;
  const freeExecutorsCount = freeExecutors.length;
  const busyExecutors = executors.filter(e => e.status === 'busy').length;
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  // Обработчики для формы задачи
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();
    
    if (currentUser.role === 'executor') {
      alert('У вас нет прав для создания задач');
      return;
    }

    const selectedExecutor = executors.find(executor => executor.id === parseInt(newTask.executorId));
    
    const task = {
      id: Date.now(),
      ...newTask,
      executorId: parseInt(newTask.executorId),
      executorName: selectedExecutor ? selectedExecutor.name : '',
      status: 'in-progress',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [...prev, task]);
    
    // Обновляем статус исполнителя на "занят"
    setExecutors(prevExecutors => 
      prevExecutors.map(executor => 
        executor.id === parseInt(newTask.executorId) 
          ? { ...executor, status: 'busy' }
          : executor
      )
    );

    setNewTask({
      title: '',
      description: '',
      deadline: '',
      executorId: ''
    });
    setShowTaskForm(false);
    
    alert('Задача успешно создана!');
  };

  // Обработчики для формы исполнителя
  const handleExecutorInputChange = (e) => {
    const { name, value } = e.target;
    setNewExecutor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitExecutor = (e) => {
    e.preventDefault();
    
    if (currentUser.role === 'executor') {
      alert('У вас нет прав для добавления исполнителей');
      return;
    }

    const executor = {
      id: Date.now(),
      ...newExecutor,
      status: 'free',
      completedTasks: 0,
      rating: parseFloat(newExecutor.rating)
    };

    setExecutors(prev => [...prev, executor]);
    setNewExecutor({
      name: '',
      specialization: '',
      rating: 0
    });
    setShowExecutorForm(false);
    
    alert('Исполнитель успешно добавлен!');
  };

  // Управление выбором задач для удаления
  const handleTaskSelect = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  // Управление выбором исполнителей для удаления
  const handleExecutorSelect = (executorId) => {
    setSelectedExecutors(prev => 
      prev.includes(executorId) 
        ? prev.filter(id => id !== executorId)
        : [...prev, executorId]
    );
  };

  const handleSelectAllExecutors = () => {
    if (selectedExecutors.length === filteredExecutors.length) {
      setSelectedExecutors([]);
    } else {
      setSelectedExecutors(filteredExecutors.map(executor => executor.id));
    }
  };

  // Удаление выбранных задач с обновлением статуса исполнителей
  const handleDeleteSelectedTasks = () => {
    if (currentUser.role === 'executor') {
      alert('У вас нет прав для удаления задач');
      return;
    }

    if (selectedTasks.length === 0) {
      alert('Выберите задачи для удаления');
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить ${selectedTasks.length} задач?`)) {
      // Находим задачи, которые будут удалены
      const tasksToDelete = tasks.filter(task => selectedTasks.includes(task.id));
      
      // Обновляем статусы исполнителей
      setExecutors(prevExecutors => {
        let updatedExecutors = [...prevExecutors];
        
        tasksToDelete.forEach(task => {
          if (task.status === 'in-progress') {
            // Если удаляется активная задача, освобождаем исполнителя
            updatedExecutors = updatedExecutors.map(executor => 
              executor.id === task.executorId 
                ? { ...executor, status: 'free' }
                : executor
            );
          }
        });
        
        return updatedExecutors;
      });

      // Удаляем задачи
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
      setSelectedTasks([]);
      setDeleteTaskMode(false);
    }
  };

  // Удаление выбранных исполнителей
  const handleDeleteSelectedExecutors = () => {
    if (currentUser.role === 'executor') {
      alert('У вас нет прав для удаления исполнителей');
      return;
    }

    if (selectedExecutors.length === 0) {
      alert('Выберите исполнителей для удаления');
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить ${selectedExecutors.length} исполнителей?`)) {
      setExecutors(prev => prev.filter(executor => !selectedExecutors.includes(executor.id)));
      setSelectedExecutors([]);
      setDeleteExecutorMode(false);
    }
  };

  // Отмена режима удаления
  const cancelDeleteTaskMode = () => {
    setDeleteTaskMode(false);
    setSelectedTasks([]);
  };

  const cancelDeleteExecutorMode = () => {
    setDeleteExecutorMode(false);
    setSelectedExecutors([]);
  };

  // Если пользователь не авторизован, показываем форму входа
  if (!currentUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          width: '400px'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>
            Вход в систему
          </h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Имя пользователя:
              </label>
              <input
                type="text"
                name="username"
                value={loginForm.username}
                onChange={handleLoginInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Пароль:
              </label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Войти
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
            <p><strong>Тестовые аккаунты:</strong></p>
            <p>Админ: admin / admin123</p>
            <p>Руководитель: manager / manager123</p>
            <p>Исполнитель: executor / executor123</p>
          </div>
        </div>
      </div>
    );
  }

  // Основной интерфейс для авторизованных пользователей
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Шапка с информацией о пользователе */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2>Главная панель управления</h2>
          <p style={{ margin: 0, color: '#666' }}>
            Вы вошли как: <strong>{currentUser.name}</strong> 
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
              marginLeft: '0.5rem',
              backgroundColor: 
                currentUser.role === 'admin' ? '#d4edda' : 
                currentUser.role === 'manager' ? '#fff3cd' : '#e3f2fd',
              color: 
                currentUser.role === 'admin' ? '#155724' : 
                currentUser.role === 'manager' ? '#856404' : '#1565c0'
            }}>
              {currentUser.role === 'admin' ? 'Администратор' : 
               currentUser.role === 'manager' ? 'Руководитель' : 'Исполнитель'}
            </span>
          </p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>
      </div>

      {/* СТАТИСТИКА */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        marginBottom: '2rem'
      }}>
        <h3>📊 Общая статистика</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>{totalTasks}</div>
            <div>Всего задач</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f39c12' }}>{activeTasks}</div>
            <div>Активных</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>{completedTasks}</div>
            <div>Завершённых</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>{totalExecutors}</div>
            <div>Исполнителей</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>{freeExecutorsCount}</div>
            <div>Свободных</div>
          </div>
        </div>
      </div>

      {/* ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <button 
          onClick={() => setActiveTab('tasks')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'tasks' ? '#2c3e50' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            flex: 1
          }}
        >
          📋 Задачи
        </button>
        <button 
          onClick={() => setActiveTab('executors')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'executors' ? '#2c3e50' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            flex: 1
          }}
        >
          👥 Исполнители
        </button>
        {currentUser.role === 'admin' && (
          <button 
            onClick={() => setShowUserManagement(!showUserManagement)}
            style={{
              padding: '0.75rem 1.5rem',
              background: showUserManagement ? '#2c3e50' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              flex: 1
            }}
          >
            👥 Управление пользователями
          </button>
        )}
      </div>

      {/* УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (только для админа) */}
      {currentUser.role === 'admin' && showUserManagement && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3>👥 Управление пользователями</h3>
          </div>

          {/* Форма добавления пользователя */}
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            marginBottom: '1.5rem'
          }}>
            <h4>➕ Добавить нового пользователя</h4>
            <form onSubmit={handleAddUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Логин:
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Пароль:
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Имя:
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Роль:
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="executor">Исполнитель</option>
                    <option value="manager">Руководитель</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Добавить пользователя
              </button>
            </form>
          </div>

          {/* Таблица пользователей */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0'
              }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Логин</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Имя</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Роль</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ 
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <td style={{ padding: '0.75rem' }}>{user.username}</td>
                  <td style={{ padding: '0.75rem' }}>{user.name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {user.role === 'admin' ? (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        Администратор
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      >
                        <option value="executor">Исполнитель</option>
                        <option value="manager">Руководитель</option>
                      </select>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUser.id || user.role === 'admin'}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: (user.id === currentUser.id || user.role === 'admin') ? '#95a5a6' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (user.id === currentUser.id || user.role === 'admin') ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* КОНТЕНТ ВКЛАДКИ ЗАДАЧ */}
      {activeTab === 'tasks' && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3>📋 Список задач</h3>
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!deleteTaskMode ? (
                  <>
                    <button 
                      onClick={() => setShowTaskForm(!showTaskForm)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ➕ Добавить задачу
                    </button>
                    <button 
                      onClick={() => setDeleteTaskMode(true)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Удалить задачу
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleDeleteSelectedTasks}
                      disabled={selectedTasks.length === 0}
                      style={{
                        padding: '0.5rem 1rem',
                        background: selectedTasks.length === 0 ? '#95a5a6' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: selectedTasks.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      🗑️ Удалить выбранные ({selectedTasks.length})
                    </button>
                    <button 
                      onClick={cancelDeleteTaskMode}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#95a5a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Отмена
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ФИЛЬТРЫ ДЛЯ ЗАДАЧ */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <button 
              onClick={() => setTaskFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                background: taskFilter === 'all' ? '#2c3e50' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Все задачи ({tasks.length})
            </button>
            <button 
              onClick={() => setTaskFilter('in-progress')}
              style={{
                padding: '0.5rem 1rem',
                background: taskFilter === 'in-progress' ? '#2c3e50' : '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              В работе ({activeTasks})
            </button>
            <button 
              onClick={() => setTaskFilter('completed')}
              style={{
                padding: '0.5rem 1rem',
                background: taskFilter === 'completed' ? '#2c3e50' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Завершённые ({completedTasks})
            </button>
          </div>

          {/* ФОРМА СОЗДАНИЯ ЗАДАЧИ */}
          {(currentUser.role === 'admin' || currentUser.role === 'manager') && showTaskForm && (
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              marginBottom: '1.5rem'
            }}>
              <h4>📝 Создание новой задачи</h4>
              <form onSubmit={handleSubmitTask}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Название задачи:
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleTaskInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Описание:
                  </label>
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleTaskInputChange}
                    required
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Дедлайн:
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={newTask.deadline}
                      onChange={handleTaskInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Исполнитель:
                    </label>
                    <select
                      name="executorId"
                      value={newTask.executorId}
                      onChange={handleTaskInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="">Выберите исполнителя</option>
                      {freeExecutors.map(executor => (
                        <option key={executor.id} value={executor.id}>
                          {executor.name} ({executor.specialization}) ⭐{executor.rating}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Создать задачу
                </button>
              </form>
            </div>
          )}

          {/* ТАБЛИЦА ЗАДАЧ */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0'
              }}>
                {(currentUser.role === 'admin' || currentUser.role === 'manager') && deleteTaskMode && (
                  <th style={{ padding: '0.75rem', textAlign: 'center', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={handleSelectAllTasks}
                    />
                  </th>
                )}
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Название</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Описание</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Исполнитель</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Дедлайн</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} style={{ 
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: selectedTasks.includes(task.id) ? '#fff3cd' : 'transparent'
                }}>
                  {(currentUser.role === 'admin' || currentUser.role === 'manager') && deleteTaskMode && (
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleTaskSelect(task.id)}
                      />
                    </td>
                  )}
                  <td style={{ padding: '0.75rem' }}>{task.title}</td>
                  <td style={{ padding: '0.75rem' }}>{task.description}</td>
                  <td style={{ padding: '0.75rem' }}>{task.executorName}</td>
                  <td style={{ padding: '0.75rem' }}>{task.deadline}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {/* Редактор статуса */}
                    {editingTaskId === task.id ? (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        autoFocus
                        onBlur={() => setEditingTaskId(null)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          border: '2px solid #3498db',
                          backgroundColor: task.status === 'completed' ? '#d4edda' : '#fff3cd',
                          color: task.status === 'completed' ? '#155724' : '#856404',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="in-progress">🟡 В работе</option>
                        <option value="completed">✅ Завершена</option>
                      </select>
                    ) : (
                      <span 
                        onClick={() => (currentUser.role === 'admin' || currentUser.role === 'manager') && setEditingTaskId(task.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          backgroundColor: task.status === 'completed' ? '#d4edda' : '#fff3cd',
                          color: task.status === 'completed' ? '#155724' : '#856404',
                          cursor: (currentUser.role === 'admin' || currentUser.role === 'manager') ? 'pointer' : 'default',
                          display: 'inline-block'
                        }}
                      >
                        {task.status === 'completed' ? '✅ Завершена' : '🟡 В работе'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTasks.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#7f8c8d'
            }}>
              <p>Нет задач, соответствующих выбранному фильтру</p>
            </div>
          )}
        </div>
      )}

      {/* КОНТЕНТ ВКЛАДКИ ИСПОЛНИТЕЛЕЙ */}
      {activeTab === 'executors' && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3>👥 Список исполнителей</h3>
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!deleteExecutorMode ? (
                  <>
                    <button 
                      onClick={() => setShowExecutorForm(!showExecutorForm)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ➕ Добавить исполнителя
                    </button>
                    <button 
                      onClick={() => setDeleteExecutorMode(true)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Удалить исполнителя
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleDeleteSelectedExecutors}
                      disabled={selectedExecutors.length === 0}
                      style={{
                        padding: '0.5rem 1rem',
                        background: selectedExecutors.length === 0 ? '#95a5a6' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: selectedExecutors.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      🗑️ Удалить выбранных ({selectedExecutors.length})
                    </button>
                    <button 
                      onClick={cancelDeleteExecutorMode}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#95a5a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Отмена
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ФИЛЬТРЫ ДЛЯ ИСПОЛНИТЕЛЕЙ */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <button 
              onClick={() => setExecutorFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                background: executorFilter === 'all' ? '#2c3e50' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Все исполнители ({executors.length})
            </button>
            <button 
              onClick={() => setExecutorFilter('free')}
              style={{
                padding: '0.5rem 1rem',
                background: executorFilter === 'free' ? '#2c3e50' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Свободные ({freeExecutorsCount})
            </button>
            <button 
              onClick={() => setExecutorFilter('busy')}
              style={{
                padding: '0.5rem 1rem',
                background: executorFilter === 'busy' ? '#2c3e50' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Занятые ({busyExecutors})
            </button>
          </div>

          {/* ФОРМА ДОБАВЛЕНИЯ ИСПОЛНИТЕЛЯ */}
          {(currentUser.role === 'admin' || currentUser.role === 'manager') && showExecutorForm && (
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              marginBottom: '1.5rem'
            }}>
              <h4>👤 Добавление нового исполнителя</h4>
              <form onSubmit={handleSubmitExecutor}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Имя:
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newExecutor.name}
                      onChange={handleExecutorInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Специализация:
                    </label>
                    <select
                      name="specialization"
                      value={newExecutor.specialization}
                      onChange={handleExecutorInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="">Выберите специализацию</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Design">Design</option>
                      <option value="QA">QA</option>
                      <option value="DevOps">DevOps</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Рейтинг:
                    </label>
                    <select
                      name="rating"
                      value={newExecutor.rating}
                      onChange={handleExecutorInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="0">0 - Новый исполнитель</option>
                      <option value="4.5">4.5 - Хороший</option>
                      <option value="4.7">4.7 - Отличный</option>
                      <option value="4.9">4.9 - Эксперт</option>
                      <option value="5.0">5.0 - Идеальный</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Добавить исполнителя
                </button>
              </form>
            </div>
          )}

          {/* ТАБЛИЦА ИСПОЛНИТЕЛЕВ */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0'
              }}>
                {(currentUser.role === 'admin' || currentUser.role === 'manager') && deleteExecutorMode && (
                  <th style={{ padding: '0.75rem', textAlign: 'center', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedExecutors.length === filteredExecutors.length && filteredExecutors.length > 0}
                      onChange={handleSelectAllExecutors}
                    />
                  </th>
                )}
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Имя</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Специализация</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Рейтинг</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Выполнено задач</th>
              </tr>
            </thead>
            <tbody>
              {filteredExecutors.map(executor => (
                <tr key={executor.id} style={{ 
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: selectedExecutors.includes(executor.id) ? '#fff3cd' : 'transparent'
                }}>
                  {(currentUser.role === 'admin' || currentUser.role === 'manager') && deleteExecutorMode && (
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedExecutors.includes(executor.id)}
                        onChange={() => handleExecutorSelect(executor.id)}
                      />
                    </td>
                  )}
                  <td style={{ padding: '0.75rem' }}>{executor.name}</td>
                  <td style={{ padding: '0.75rem' }}>{executor.specialization}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      color: executor.rating >= 4.7 ? '#27ae60' : executor.rating >= 4.0 ? '#f39c12' : '#e74c3c',
                      fontWeight: 'bold'
                    }}>
                      ⭐ {executor.rating}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      backgroundColor: executor.status === 'free' ? '#d4edda' : '#f8d7da',
                      color: executor.status === 'free' ? '#155724' : '#721c24'
                    }}>
                      {executor.status === 'free' ? '✅ Свободен' : '❌ Занят'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{executor.completedTasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredExecutors.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#7f8c8d'
            }}>
              <p>Нет исполнителей, соответствующих выбранному фильтру</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
