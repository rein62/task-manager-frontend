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

// Начальные данные - ПУСТЫЕ
const initialExecutors = [];
const initialTasks = [];

const initialUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Администратор Системы',
    specialization: 'Администратор системы',
    registrationDate: '2024-01-01'
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    name: 'Руководитель Проектов',
    specialization: 'Руководитель',
    registrationDate: '2024-01-01'
  },
  {
    id: 3,
    username: 'executor',
    password: 'executor123',
    role: 'executor',
    name: 'Исполнитель Задач',
    specialization: 'Frontend-разработчик',
    registrationDate: '2024-01-01'
  }
];

// СПЕЦИАЛИЗАЦИИ ДЛЯ ВЫБОРА
const specializations = [
  'Frontend-разработчик',
  'Backend-разработчик',
  'Fullstack-разработчик',
  'UI/UX дизайнер',
  'DevOps-инженер',
  'Тестировщик (QA)',
  'Системный аналитик',
  'Архитектор ПО',
  'Технический писатель',
  'Менеджер проектов',
  'Аналитик данных',
  'Мобильный разработчик',
  'Сетевой инженер',
  'Администратор баз данных',
  'Специалист по кибербезопасности',
  'Product Manager',
  'Scrum Master',
  'Бизнес-аналитик',
  'Специалист по технической поддержке',
  'Руководитель'
];

// Компонент уведомлений
const NotificationCenter = ({ notifications, removeNotification, currentUser }) => {
  // Фильтруем уведомления для текущего пользователя
  const filteredNotifications = notifications.filter(notification => {
    // Если нет текущего пользователя, не показываем уведомления
    if (!currentUser) return false;
    
    // Если текущий пользователь администратор, показываем все
    if (currentUser.role === 'admin') return true;
    
    // Если у уведомления нет получателей (пустой массив), показываем всем
    if (!notification.recipientIds || notification.recipientIds.length === 0) return true;
    
    // Иначе показываем только если текущий пользователь в списке получателей
    return notification.recipientIds.includes(currentUser.id);
  });

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '20px',
      width: '350px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxHeight: 'calc(100vh - 130px)',
      overflowY: 'auto'
    }}>
      {filteredNotifications.map(notification => (
        <div 
          key={notification.id}
          className="notification-item"
          style={{
            background: 'white',
            padding: '15px',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
            borderLeft: `4px solid ${notification.type === 'warning' ? '#ff9800' : 
                          notification.type === 'success' ? '#4caf50' : 
                          notification.type === 'error' ? '#f44336' : '#2196f3'}`,
            animation: 'slideInRight 0.3s ease-out',
            position: 'relative'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '5px'
          }}>
            <strong style={{ color: '#333' }}>{notification.title}</strong>
            <button 
              onClick={() => removeNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{notification.message}</p>
          <div style={{ 
            fontSize: '12px', 
            color: '#999', 
            marginTop: '5px',
            textAlign: 'right'
          }}>
            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          {/* Прогресс-бар для автоудаления через 6 секунд */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
            borderRadius: '0 0 10px 10px',
            animation: 'progressBar 6s linear forwards'
          }} />
        </div>
      ))}
    </div>
  );
};

// Компонент изменения пароля (ИСПРАВЛЕНО: убрано ограничение на 6 символов)
const ChangePasswordModal = ({ user, onClose, onChangePassword }) => {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!passwordForm.oldPassword) {
      newErrors.oldPassword = 'Введите старый пароль';
    } else if (user && user.password !== passwordForm.oldPassword) {
      newErrors.oldPassword = 'Старый пароль неверен';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (passwordForm.newPassword === passwordForm.oldPassword) {
      newErrors.newPassword = 'Новый пароль должен отличаться от старого';
    }
    
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите новый пароль';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmChange = () => {
    onChangePassword(user.id, passwordForm.newPassword);
    setShowConfirmModal(false);
    onClose();
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1002,
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          width: '90%',
          maxWidth: '500px',
          animation: 'modalSlideIn 0.3s ease-out',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ 
              margin: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Изменение пароля
            </h3>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#999',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#333'
              }}>
                Введите старый пароль:
              </label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }));
                  if (errors.oldPassword) setErrors(prev => ({ ...prev, oldPassword: '' }));
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.oldPassword ? '#f44336' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              {errors.oldPassword && (
                <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>
                  {errors.oldPassword}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#333'
              }}>
                Введите новый пароль:
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                  if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.newPassword ? '#f44336' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              {errors.newPassword && (
                <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>
                  {errors.newPassword}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#333'
              }}>
                Подтвердите новый пароль:
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.confirmPassword ? '#f44336' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              {errors.confirmPassword && (
                <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            >
              Отмена
            </button>
            <button 
              onClick={handleSubmit}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Изменить пароль
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1003,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            width: '90%',
            maxWidth: '450px',
            animation: 'modalSlideIn 0.3s ease-out',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '15px',
                color: '#ff9800'
              }}>
                ⚠️
              </div>
              <h3 style={{ 
                margin: 0,
                color: '#333',
                marginBottom: '10px'
              }}>
                Подтверждение изменения пароля
              </h3>
              <p style={{ color: '#666', margin: 0 }}>
                Пароль для аккаунта <strong>{user.username}</strong> будет изменён. Вы уверены?
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '10px 25px',
                  background: '#f0f0f0',
                  color: '#333',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Отмена
              </button>
              <button 
                onClick={handleConfirmChange}
                style={{
                  padding: '10px 25px',
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Изменить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Компонент выбора исполнителя для задачи (ОБНОВЛЕНО: добавлена фильтрация по специализации)
const ExecutorSelectionModal = ({ executors, onClose, onSelectExecutor }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [selectedExecutor, setSelectedExecutor] = useState(null);
  const [showExecutorProfile, setShowExecutorProfile] = useState(false);

  // Фильтрация исполнителей
  const filteredExecutors = executors.filter(executor => {
    if (statusFilter !== 'all' && executor.status !== statusFilter) return false;
    if (specializationFilter !== 'all' && executor.specialization !== specializationFilter) return false;
    if (searchQuery && !executor.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !executor.specialization.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Рассчитываем рейтинг для отображения
  const calculateAverageRating = (history) => {
    if (!history || history.length === 0) return 0;
    const total = history.reduce((sum, task) => 
      sum + (task.deadlineMet + task.effectiveness + task.quality), 0);
    return (total / (history.length * 3)).toFixed(1);
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1003,
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '80vh',
          overflowY: 'auto',
          animation: 'modalSlideIn 0.3s ease-out',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ 
              margin: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              👥 Выбор исполнителя
            </h3>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#999',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Выберите исполнителя для задачи. Нажмите на карточку исполнителя, чтобы просмотреть его профиль и выбрать.
            </p>
            
            {/* Поиск и фильтры */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto auto auto', 
              gap: '10px', 
              marginBottom: '20px',
              alignItems: 'center'
            }}>
              <div>
                <input
                  type="text"
                  placeholder="🔍 Поиск по имени или специализации..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minWidth: '120px'
                }}
              >
                <option value="all">Все статусы</option>
                <option value="free">Свободные</option>
                <option value="busy">Занятые</option>
              </select>
              
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minWidth: '150px'
                }}
              >
                <option value="all">Все специализации</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSpecializationFilter('all');
                }}
                style={{
                  padding: '10px 15px',
                  background: '#f0f0f0',
                  color: '#333',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Сбросить
              </button>
            </div>
          </div>

          {/* Список исполнителей */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            {filteredExecutors.map(executor => {
              const averageRating = calculateAverageRating(executor.taskHistory);
              
              return (
                <div 
                  key={executor.id}
                  className="hover-card"
                  onClick={() => {
                    setSelectedExecutor(executor);
                    setShowExecutorProfile(true);
                  }}
                  style={{
                    background: 'white',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderLeft: `4px solid ${executor.status === 'free' ? '#4caf50' : '#f44336'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {executor.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '14px' }}>{executor.name}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                        {executor.specialization}
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ 
                        fontSize: '16px', 
                        color: averageRating >= 4.5 ? '#ff9800' : averageRating >= 4.0 ? '#4caf50' : '#f44336'
                      }}>
                        ⭐
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                        {averageRating}
                      </span>
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: executor.status === 'free' ? '#d4edda' : '#f8d7da',
                      color: executor.status === 'free' ? '#155724' : '#721c24'
                    }}>
                      {executor.status === 'free' ? '✅ Свободен' : '❌ Занят'}
                    </span>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#666'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#333' }}>Выполнено задач</div>
                      <div>{executor.completedTasks}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#333' }}>Дата регистрации</div>
                      <div>{executor.registrationDate}</div>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '10px', 
                    paddingTop: '10px', 
                    borderTop: '1px solid #f0f0f0',
                    fontSize: '11px',
                    color: '#999',
                    textAlign: 'center'
                  }}>
                    Нажмите для просмотра профиля и выбора
                  </div>
                </div>
              );
            })}
          </div>

          {filteredExecutors.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '30px',
              color: '#999'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '15px' }}>👥</div>
              <p style={{ fontSize: '14px' }}>Нет исполнителей, соответствующих выбранному фильтру</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно профиля исполнителя с кнопкой выбора */}
      {showExecutorProfile && selectedExecutor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1004,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            animation: 'modalSlideIn 0.3s ease-out',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ 
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Профиль исполнителя
              </h3>
              <button 
                onClick={() => setShowExecutorProfile(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#999',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ×
              </button>
            </div>

            {/* Содержимое профиля исполнителя */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}>
                  {selectedExecutor.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{selectedExecutor.name}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                    Специализация: <strong>{selectedExecutor.specialization}</strong>
                  </p>
                  <p style={{ margin: 0, color: '#666' }}>
                    Дата регистрации: <strong>{selectedExecutor.registrationDate}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px',
              padding: '20px',
              color: 'white',
              marginBottom: '25px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{calculateAverageRating(selectedExecutor.taskHistory)}</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Общий рейтинг</div>
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{selectedExecutor.completedTasks}</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Выполнено задач</div>
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                    {selectedExecutor.status === 'free' ? '✅' : '❌'}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {selectedExecutor.status === 'free' ? 'Свободен' : 'Занят'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '5px' }}>
                История работ
              </h4>
              {selectedExecutor.taskHistory && selectedExecutor.taskHistory.length > 0 ? (
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {selectedExecutor.taskHistory.map((task, index) => (
                    <div key={index} style={{
                      padding: '10px',
                      borderBottom: '1px solid #f0f0f0',
                      background: index % 2 === 0 ? '#fafafa' : 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong style={{ color: '#333', fontSize: '13px' }}>{task.title}</strong>
                        <span style={{ color: '#666', fontSize: '11px' }}>{task.date}</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '10px',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        <span>Сроки: <strong>{task.deadlineMet}/5</strong></span>
                        <span>Результат: <strong>{task.effectiveness}/5</strong></span>
                        <span>Качество: <strong>{task.quality}/5</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                  У исполнителя пока нет истории работ
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button 
                onClick={() => setShowExecutorProfile(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  flex: 1
                }}
              >
                Назад к списку
              </button>
              <button 
                onClick={() => {
                  onSelectExecutor(selectedExecutor);
                  setShowExecutorProfile(false);
                }}
                disabled={selectedExecutor.status === 'busy'}
                style={{
                  padding: '10px 20px',
                  background: selectedExecutor.status === 'free' 
                    ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                    : '#cccccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: selectedExecutor.status === 'free' ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flex: 1
                }}
              >
                {selectedExecutor.status === 'free' ? '✅ Выбрать исполнителя' : '❌ Исполнитель занят'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Компонент прикрепления файла отчёта
const TaskCompleteModal = ({ task, onClose, onComplete }) => {
  const [reportFile, setReportFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = () => {
    onComplete(task.id, reportFile);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1002,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        width: '90%',
        maxWidth: '500px',
        animation: 'modalSlideIn 0.3s ease-out',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ 
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Завершение задачи
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#999',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Вы завершаете задачу: <strong>{task.title}</strong>
          </p>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Прикрепите файл отчёта (необязательно):
            </label>
            <div style={{
              border: '2px dashed #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <input
                type="file"
                id="reportFile"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              {reportFile ? (
                <div>
                  <div style={{ fontSize: '36px', color: '#4caf50', marginBottom: '10px' }}>📎</div>
                  <div style={{ color: '#333', fontWeight: '600' }}>{fileName}</div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                    {(reportFile.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '36px', color: '#999', marginBottom: '10px' }}>📎</div>
                  <div style={{ color: '#666' }}>Нажмите для выбора файла</div>
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
                    PNG, JPG, PDF, DOC, XLS (макс. 10MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <strong>Примечание:</strong> Файл отчёта будет сохранён в профиле задачи и доступен для просмотра руководителю.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            Отмена
          </button>
          <button 
            onClick={handleSubmit}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Завершить задачу
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент профиля исполнителя (ОБНОВЛЕНО: добавлена кнопка "Карточка" задачи)
const ExecutorProfileModal = ({ executor, onClose, onOpenTaskCard, getTaskById }) => {
  if (!executor) return null;

  const calculateAverageRating = (history) => {
    if (!history || history.length === 0) return 0;
    const total = history.reduce((sum, task) => 
      sum + (task.deadlineMet + task.effectiveness + task.quality), 0);
    return (total / (history.length * 3)).toFixed(1);
  };

  const averageRating = calculateAverageRating(executor.taskHistory);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        animation: 'modalSlideIn 0.3s ease-out',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Профиль исполнителя
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#999',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              {executor.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{executor.name}</h3>
              <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                Специализация: <strong>{executor.specialization}</strong>
              </p>
              <p style={{ margin: 0, color: '#666' }}>
                Дата регистрации: <strong>{executor.registrationDate}</strong>
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '10px',
          padding: '20px',
          color: 'white',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{averageRating}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Общий рейтинг</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{executor.completedTasks}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Выполнено задач</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                {executor.status === 'free' ? '✅' : '❌'}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {executor.status === 'free' ? 'Свободен' : 'Занят'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '5px' }}>
            История работ
          </h4>
          {executor.taskHistory && executor.taskHistory.length > 0 ? (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {executor.taskHistory.map((task, index) => {
                const fullTask = getTaskById(task.taskId);
                return (
                  <div key={index} style={{
                    padding: '12px',
                    borderBottom: '1px solid #f0f0f0',
                    background: index % 2 === 0 ? '#fafafa' : 'white',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: '#333' }}>{task.title}</strong>
                        {fullTask && (
                          <button 
                            onClick={() => onOpenTaskCard(fullTask)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '10px',
                              padding: '3px 8px',
                              background: '#f0f0f0',
                              color: '#333',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: '600',
                              zIndex: 1
                            }}
                          >
                            Карточка
                          </button>
                        )}
                      </div>
                      <span style={{ color: '#666', fontSize: '12px', marginLeft: '10px' }}>{task.date}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '15px',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <span>Сроки: <strong>{task.deadlineMet}/5</strong></span>
                      <span>Результат: <strong>{task.effectiveness}/5</strong></span>
                      <span>Качество: <strong>{task.quality}/5</strong></span>
                      <span style={{ marginLeft: 'auto' }}>
                        Итог: <strong>{task.deadlineMet + task.effectiveness + task.quality}/15</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
              У исполнителя пока нет истории работ
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент карточки задачи (ОБНОВЛЕН: добавлено реальное скачивание файлов)
const TaskCardModal = ({ task, onClose, addNotification, currentUser }) => {
  if (!task) return null;

  const calculateDaysLeft = (deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysLeft(task.deadline);

  // Форматирование размера файла
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Функция для скачивания файлов (РЕАЛЬНОЕ СКАЧИВАНИЕ)
  const downloadFile = (fileData, fileName, fileType = 'application/octet-stream') => {
    if (!fileData || !fileName) return;
    
    try {
      // Создаем содержимое файла на основе типа
      let content, blobType;
      
      if (fileType.includes('image')) {
        // Для изображений создаем простую картинку
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#667eea';
        ctx.font = '16px Arial';
        ctx.fillText(fileName, 10, 100);
        
        content = canvas.toDataURL('image/png').split(',')[1];
        blobType = 'image/png';
      } else if (fileType.includes('pdf')) {
        // Для PDF создаем текстовое содержимое
        content = `PDF документ: ${fileName}\n\nСоздано в системе управления задачами\nДата: ${new Date().toLocaleString()}\nРазмер: ${fileData.size ? formatFileSize(fileData.size) : 'N/A'}\n\nЭто демонстрационный файл. В реальной системе здесь был бы реальный PDF документ.`;
        blobType = 'application/pdf';
      } else if (fileType.includes('word') || fileType.includes('document')) {
        // Для Word документов
        content = `Microsoft Word документ: ${fileName}\n\nСоздано в системе управления задачами\nДата: ${new Date().toLocaleString()}\nРазмер: ${fileData.size ? formatFileSize(fileData.size) : 'N/A'}\n\nЭто демонстрационный файл. В реальной системе здесь был бы реальный Word документ.`;
        blobType = 'application/msword';
      } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
        // Для Excel
        content = `Microsoft Excel документ: ${fileName}\n\nСоздано в системе управления задачами\nДата: ${new Date().toLocaleString()}\nРазмер: ${fileData.size ? formatFileSize(fileData.size) : 'N/A'}\n\nЭто демонстрационный файл. В реальной системе здесь был бы реальный Excel документ.`;
        blobType = 'application/vnd.ms-excel';
      } else {
        // Для всех остальных типов - текстовый файл
        content = `Файл: ${fileName}\nТип: ${fileType}\nРазмер: ${fileData.size ? formatFileSize(fileData.size) : 'N/A'}\nДата создания: ${new Date().toLocaleString()}\n\nСодержимое файла:\nЭто демонстрационный файл из системы управления задачами.\nВ реальной системе здесь было бы содержимое прикрепленного файла.`;
        blobType = 'text/plain';
      }
      
      // Создаем Blob и скачиваем
      const blob = new Blob([content], { type: blobType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addNotification('Файл скачан', `Файл "${fileName}" успешно скачан на ваш компьютер`, 'success', [currentUser.id]);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      addNotification('Ошибка', 'Не удалось скачать файл', 'error', [currentUser.id]);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflowY: 'auto',
        animation: 'modalSlideIn 0.3s ease-out',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Карточка задачи
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#999',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Название задачи:
            </label>
            <div style={{
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              {task.title}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Описание:
            </label>
            <div style={{
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '14px',
              color: '#666',
              minHeight: '100px',
              whiteSpace: 'pre-wrap'
            }}>
              {task.description}
            </div>
          </div>

          {/* Файлы задачи */}
          {(task.attachmentFile || task.reportFile) && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                marginBottom: '15px', 
                color: '#333', 
                borderBottom: '2px solid #f0f0f0', 
                paddingBottom: '5px' 
              }}>
                📎 Прикрепленные файлы
              </h4>
              
              {task.attachmentFile && (
                <div style={{ 
                  marginBottom: '15px',
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#e3f2fd',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1976d2',
                      fontSize: '18px'
                    }}>
                      📄
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        Материал для работы
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Прикреплено руководителем
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    background: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        {task.attachmentFile.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {formatFileSize(task.attachmentFile.size)} • {task.attachmentFile.type || 'Файл'}
                      </div>
                    </div>
                    <button 
                      onClick={() => downloadFile(task.attachmentFile, task.attachmentFile.name, task.attachmentFile.type)}
                      style={{
                        padding: '8px 15px',
                        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      ⬇️ Скачать
                    </button>
                  </div>
                </div>
              )}
              
              {task.reportFile && (
                <div style={{ 
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#e8f5e9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4caf50',
                      fontSize: '18px'
                    }}>
                      📊
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        Отчёт исполнителя
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Прикреплено исполнителем при завершении
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    background: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        {task.reportFile.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {formatFileSize(task.reportFile.size)} • {task.reportFile.type || 'Файл'}
                      </div>
                    </div>
                    <button 
                      onClick={() => downloadFile(task.reportFile, task.reportFile.name, task.reportFile.type)}
                      style={{
                        padding: '8px 15px',
                        background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      ⬇️ Скачать
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px', 
            marginBottom: '25px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#333'
              }}>
                Дата создания:
              </label>
              <div style={{
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px',
                color: '#666'
              }}>
                {task.createdAt}
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#333'
              }}>
                Дедлайн:
              </label>
              <div style={{
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px',
                color: '#666',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{task.deadline}</span>
                <span style={{
                  fontSize: '12px',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  background: daysLeft <= 1 ? '#f8d7da' : 
                            daysLeft <= 3 ? '#fff3cd' : '#d4edda',
                  color: daysLeft <= 1 ? '#721c24' : 
                        daysLeft <= 3 ? '#856404' : '#155724',
                  fontWeight: '600'
                }}>
                  {daysLeft > 0 ? `${daysLeft} дн. осталось` : 'Просрочено'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Создатель задачи:
            </label>
            <div style={{
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '14px',
              color: '#666'
            }}>
              {task.creatorName || 'Неизвестно'}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Исполнитель:
            </label>
            <div style={{
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '14px',
              color: '#666'
            }}>
              {task.executorName || 'Не назначен'}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Статус:
            </label>
            <div style={{
              padding: '10px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: 
                task.status === 'completed' ? '#d4edda' : 
                task.status === 'under-review' ? '#e6ccff' : '#fff3cd',
              color: 
                task.status === 'completed' ? '#155724' : 
                task.status === 'under-review' ? '#4b0082' : '#856404',
              display: 'inline-block',
              minWidth: '120px',
              textAlign: 'center'
            }}>
              {task.status === 'completed' ? '✅ Завершена' : 
               task.status === 'under-review' ? '🟣 На проверке' : '🟡 В работе'}
            </div>
          </div>

          {task.status === 'completed' && task.deadlineMet > 0 && (
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px',
              padding: '15px',
              color: 'white',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  Оценка задачи: {task.deadlineMet + task.effectiveness + task.quality}/15
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px' }}>
                  <div>Сроки: {task.deadlineMet}/5</div>
                  <div>Результат: {task.effectiveness}/5</div>
                  <div>Качество: {task.quality}/5</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент оценки задачи
const TaskRatingModal = ({ task, onClose, onRate }) => {
  const [ratings, setRatings] = useState({
    deadlineMet: task.deadlineMet || 3,
    effectiveness: task.effectiveness || 3,
    quality: task.quality || 3
  });

  const handleRatingChange = (criterion, value) => {
    setRatings(prev => ({
      ...prev,
      [criterion]: parseInt(value)
    }));
  };

  const handleSubmit = () => {
    const total = ratings.deadlineMet + ratings.effectiveness + ratings.quality;
    onRate(task.id, ratings.deadlineMet, ratings.effectiveness, ratings.quality, total);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        width: '90%',
        maxWidth: '500px',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          Оценка задачи: {task.title}
        </h3>
        
        <div style={{ marginBottom: '25px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555' }}>
              Соблюдение сроков (1-5):
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => handleRatingChange('deadlineMet', num)}
                  style={{
                    padding: '8px 16px',
                    background: ratings.deadlineMet === num ? 
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                    color: ratings.deadlineMet === num ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555' }}>
              Результативность (1-5):
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => handleRatingChange('effectiveness', num)}
                  style={{
                    padding: '8px 16px',
                    background: ratings.effectiveness === num ? 
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                    color: ratings.effectiveness === num ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555' }}>
              Качество выполнения (1-5):
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => handleRatingChange('quality', num)}
                  style={{
                    padding: '8px 16px',
                    background: ratings.quality === num ? 
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                    color: ratings.quality === num ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Общий балл:</span>
              <strong style={{ fontSize: '18px', color: '#667eea' }}>
                {ratings.deadlineMet + ratings.effectiveness + ratings.quality} / 15
              </strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Отмена
          </button>
          <button 
            onClick={handleSubmit}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Сохранить оценку
          </button>
        </div>
      </div>
    </div>
  );
};

// Главный компонент Dashboard
function Dashboard() {
  // Основные состояния
  const [users, setUsers] = useState(() => {
    const storedUsers = loadFromLocalStorage('users', initialUsers);
    return ensureAdminUser(storedUsers);
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = loadFromLocalStorage('currentUser', null);
    if (storedUser && storedUser.username === 'admin') {
      return { ...storedUser, role: 'admin' };
    }
    return storedUser;
  });
  
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [newUser, setNewUser] = useState({ 
    username: '', 
    password: '', 
    name: '', 
    role: 'executor',
    specialization: 'Frontend-разработчик'
  });

  // Данные приложения
  const [tasks, setTasks] = useState(() => {
    const storedTasks = loadFromLocalStorage('tasks', initialTasks);
    // Добавляем creatorId к старым задачам, если его нет
    return storedTasks.map(task => {
      if (!task.creatorId) {
        return { 
          ...task, 
          creatorId: 1, // Администратор по умолчанию
          creatorName: 'Администратор Системы'
        };
      }
      return task;
    });
  });
  
  const [executors, setExecutors] = useState(() => loadFromLocalStorage('executors', initialExecutors));
  const [actionHistory, setActionHistory] = useState(() => loadFromLocalStorage('actionHistory', []));
  const [notifications, setNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState(() => 
    loadFromLocalStorage('sentNotifications', {})
  );

  // UI состояния
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all');
  const [executorFilter, setExecutorFilter] = useState('all');
  const [deleteTaskMode, setDeleteTaskMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Поиск
  const [taskSearch, setTaskSearch] = useState('');
  const [executorSearch, setExecutorSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  
  // Модальные окна
  const [selectedExecutor, setSelectedExecutor] = useState(null);
  const [showExecutorProfile, setShowExecutorProfile] = useState(false);
  const [taskToRate, setTaskToRate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskCard, setShowTaskCard] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState(null);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [showExecutorSelection, setShowExecutorSelection] = useState(false);

  // Формы
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    executorId: '',
    attachmentFile: null
  });
  const [attachmentFileName, setAttachmentFileName] = useState('');

  // Функция логгирования действий
  const logAction = (action, details = '') => {
    const newAction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: currentUser ? currentUser.name : 'Гость',
      role: currentUser ? currentUser.role : 'guest',
      action,
      details
    };
    
    setActionHistory(prev => {
      const updatedHistory = [newAction, ...prev.slice(0, 99)];
      saveToLocalStorage('actionHistory', updatedHistory);
      return updatedHistory;
    });
  };

  // Функция добавления уведомления с предотвращением дублирования
  const addNotification = (title, message, type = 'info', recipientIds = [], notificationId = null) => {
    const id = notificationId || Date.now() + Math.random();
    
    // Проверка на дублирование уведомлений за последние 5 секунд
    const notificationKey = `${title}-${message}-${type}`;
    const now = Date.now();
    
    if (sentNotifications[notificationKey] && (now - sentNotifications[notificationKey]) < 5000) {
      return;
    }
    
    // Обновляем запись о отправленном уведомлении
    setSentNotifications(prev => {
      const updated = { ...prev, [notificationKey]: now };
      saveToLocalStorage('sentNotifications', updated);
      return updated;
    });
    
    const newNotification = {
      id,
      title,
      message,
      type,
      recipientIds,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, 4);
    });
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  // Очистка старых записей о уведомлениях
  useEffect(() => {
    const cleanupOldNotifications = () => {
      const now = Date.now();
      const oneHour = 3600000;
      
      setSentNotifications(prev => {
        const cleaned = {};
        for (const [key, timestamp] of Object.entries(prev)) {
          if (now - timestamp < oneHour) {
            cleaned[key] = timestamp;
          }
        }
        saveToLocalStorage('sentNotifications', cleaned);
        return cleaned;
      });
    };
    
    const interval = setInterval(cleanupOldNotifications, 3600000);
    cleanupOldNotifications();
    
    return () => clearInterval(interval);
  }, []);

  // Проверка дедлайнов - ОБНОВЛЕНО: почасовые уведомления и каждые 10 минут при остатке менее часа
  useEffect(() => {
    const checkDeadlines = () => {
      tasks.forEach(task => {
        if (task.status === 'in-progress') {
          const deadline = new Date(task.deadline);
          const now = new Date();
          const diffTime = deadline - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
          const diffMinutes = Math.ceil(diffTime / (1000 * 60));
          
          // Получаем ID исполнителя и создателя задачи
          const recipientIds = [];
          
          if (task.executorId) {
            recipientIds.push(task.executorId);
          }
          
          if (task.creatorId) {
            recipientIds.push(task.creatorId);
          }
          
          if (recipientIds.length === 0) return;
          
          // Уведомление о скором дедлайне (1 день остался)
          if (diffDays === 1) {
            const notificationId = `deadline-1day-${task.id}`;
            
            addNotification(
              'Дедлайн близко!',
              `До окончания задачи "${task.title}" остался 1 день`,
              'warning',
              recipientIds,
              notificationId
            );
          } 
          // Уведомление каждый час за последние 24 часа до дедлайна
          else if (diffHours <= 24 && diffHours > 0) {
            const notificationId = `deadline-hourly-${task.id}-${diffHours}`;
            
            addNotification(
              'Напоминание о дедлайне',
              `До окончания задачи "${task.title}" осталось ${diffHours} ${getHoursWord(diffHours)}`,
              'warning',
              recipientIds,
              notificationId
            );
          }
          // Уведомление каждые 10 минут если осталось меньше часа
          else if (diffMinutes <= 60 && diffMinutes > 0) {
            const notificationId = `deadline-10min-${task.id}-${Math.floor(diffMinutes/10)}`;
            
            addNotification(
              'Срочный дедлайн!',
              `До окончания задачи "${task.title}" осталось ${diffMinutes} ${getMinutesWord(diffMinutes)}`,
              'error',
              recipientIds,
              notificationId
            );
          }
          // Задача просрочена
          else if (diffDays < 0 && task.status !== 'overdue') {
            const notificationId = `deadline-overdue-${task.id}`;
            
            setTasks(prev => prev.map(t => 
              t.id === task.id ? { ...t, status: 'under-review' } : t
            ));
            
            setExecutors(prev => prev.map(e => 
              e.id === task.executorId ? { ...e, status: 'free' } : e
            ));
            
            addNotification(
              'Время вышло!',
              `Задача "${task.title}" просрочена и отправлена на проверку`,
              'error',
              recipientIds,
              notificationId
            );
            
            const systemAction = {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              user: 'Система',
              role: 'system',
              action: 'Задача просрочена',
              details: `Задача "${task.title}" автоматически отправлена на проверку`
            };
            
            setActionHistory(prev => {
              const updatedHistory = [systemAction, ...prev.slice(0, 99)];
              saveToLocalStorage('actionHistory', updatedHistory);
              return updatedHistory;
            });
          }
        }
      });
    };

    const getHoursWord = (hours) => {
      if (hours === 1) return 'час';
      if (hours >= 2 && hours <= 4) return 'часа';
      return 'часов';
    };

    const getMinutesWord = (minutes) => {
      if (minutes === 1) return 'минута';
      if (minutes >= 2 && minutes <= 4) return 'минуты';
      if (minutes >= 5 && minutes <= 20) return 'минут';
      const lastDigit = minutes % 10;
      if (lastDigit === 1) return 'минута';
      if (lastDigit >= 2 && lastDigit <= 4) return 'минуты';
      return 'минут';
    };

    // Проверяем дедлайны при загрузке и затем каждые 10 минут
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 600000); // Каждые 10 минут (600000 мс)
    
    return () => clearInterval(interval);
  }, [tasks, executors]);

  // Сохранение в localStorage
  useEffect(() => {
    saveToLocalStorage('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToLocalStorage('executors', executors);
  }, [executors]);

  useEffect(() => {
    if (currentUser) {
      const correctedUser = currentUser.username === 'admin' ? 
        { ...currentUser, role: 'admin' } : currentUser;
      saveToLocalStorage('currentUser', correctedUser);
    }
  }, [currentUser]);

  useEffect(() => {
    const correctedUsers = ensureAdminUser(users);
    saveToLocalStorage('users', correctedUsers);
  }, [users]);

  // Функция для поиска задачи по ID
  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId);
  };

  // Функция для открытия карточки задачи
  const openTaskCard = (task) => {
    setSelectedTask(task);
    setShowTaskCard(true);
  };

  // Функции авторизации
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    
    if (user) {
      const correctedUser = user.username === 'admin' ? { ...user, role: 'admin' } : user;
      setCurrentUser(correctedUser);
      setLoginForm({ username: '', password: '' });
      setLoginError('');
      addNotification('Вход выполнен', `Добро пожаловать, ${correctedUser.name}!`, 'success', [correctedUser.id]);
      logAction('Вход в систему', `Пользователь ${correctedUser.name} вошел в систему`);
    } else {
      setLoginError('Неправильный логин или пароль!');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logAction('Выход из системы', `Пользователь ${currentUser.name} вышел из системы`);
    }
    setCurrentUser(null);
  };

  // Функции управления пользователями
  const handleAddUser = (e) => {
    e.preventDefault();
    
    if (!currentUser || currentUser.role === 'executor') {
      addNotification('Доступ запрещен', 'У вас нет прав для добавления пользователей', 'error', [currentUser.id]);
      return;
    }

    const userToCreate = currentUser.role === 'manager' 
      ? { ...newUser, role: 'executor' }
      : newUser;

    const userExists = users.find(u => u.username === userToCreate.username);
    if (userExists) {
      addNotification('Ошибка', 'Пользователь с таким логином уже существует', 'error', [currentUser.id]);
      return;
    }

    const user = {
      id: Date.now(),
      ...userToCreate,
      registrationDate: new Date().toISOString().split('T')[0]
    };

    if (user.role === 'executor') {
      const executor = {
        id: user.id,
        name: user.name,
        specialization: user.specialization,
        rating: 0,
        status: 'free',
        completedTasks: 0,
        registrationDate: user.registrationDate,
        taskHistory: []
      };
      setExecutors(prev => [...prev, executor]);
    }

    setUsers(prev => [...prev, user]);
    setNewUser({ 
      username: '', 
      password: '', 
      name: '', 
      role: 'executor',
      specialization: 'Frontend-разработчик'
    });
    
    addNotification('Пользователь добавлен', `Новый пользователь ${user.name} успешно создан`, 'success', [currentUser.id]);
    logAction('Добавлен пользователь', `Добавлен ${user.role === 'executor' ? 'исполнитель' : 'руководитель'}: ${user.name}`);
  };

  // Функция изменения пароля
  const handleChangePassword = (userId, newPassword) => {
    const userToUpdate = users.find(user => user.id === userId);
    
    if (!userToUpdate) {
      addNotification('Ошибка', 'Пользователь не найден', 'error', [currentUser.id]);
      return;
    }

    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, password: newPassword } : user
    ));
    
    addNotification(
      'Пароль изменён', 
      `Пароль от аккаунта ${userToUpdate.username} успешно изменён`, 
      'success', 
      [currentUser.id]
    );
    
    logAction('Изменён пароль', `Пароль пользователя ${userToUpdate.username} изменён`);
  };

  const handleDeleteUser = (userId) => {
    if (!currentUser) return;
    
    if (userId === currentUser.id) {
      addNotification('Ошибка', 'Нельзя удалить самого себя', 'error', [currentUser.id]);
      return;
    }

    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete.role === 'admin') {
      addNotification('Ошибка', 'Нельзя удалить администратора', 'error', [currentUser.id]);
      return;
    }

    if (currentUser.role === 'manager' && userToDelete.role === 'manager') {
      addNotification('Ошибка', 'Руководитель не может удалять других руководителей', 'error', [currentUser.id]);
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить пользователя ${userToDelete.name}?`)) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      if (userToDelete.role === 'executor') {
        setExecutors(prev => prev.filter(executor => executor.id !== userId));
      }
      
      addNotification('Пользователь удален', `Пользователь ${userToDelete.name} удален из системы`, 'info', [currentUser.id]);
      logAction('Удален пользователь', `Удален пользователь: ${userToDelete.name}`);
    }
  };

  const handleChangeUserRole = (userId, newRole) => {
    if (!currentUser) return;
    
    const userToChange = users.find(user => user.id === userId);
    if (userToChange.role === 'admin') {
      addNotification('Ошибка', 'Нельзя изменить роль администратора', 'error', [currentUser.id]);
      return;
    }

    if (userToChange.role === 'executor' && newRole === 'manager') {
      setExecutors(prev => prev.filter(executor => executor.id !== userId));
    }
    
    if (userToChange.role === 'manager' && newRole === 'executor') {
      const executor = {
        id: userToChange.id,
        name: userToChange.name,
        specialization: userToChange.specialization || 'Не указано',
        rating: 0,
        status: 'free',
        completedTasks: 0,
        registrationDate: userToChange.registrationDate,
        taskHistory: []
      };
      setExecutors(prev => [...prev, executor]);
    }

    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    
    addNotification('Роль изменена', `Пользователь ${userToChange.name} теперь ${newRole === 'executor' ? 'исполнитель' : 'руководитель'}`, 'info', [currentUser.id]);
    logAction('Изменена роль пользователя', `Пользователю ${userToChange.name} назначена роль: ${newRole}`);
  };

  // Функции управления задачами - ОБНОВЛЕНА: удаляет задачу из истории исполнителя при смене статуса с "завершена"
  const handleStatusChange = (taskId, newStatus) => {
    if (!currentUser) {
      addNotification('Ошибка', 'Пользователь не авторизован', 'error', []);
      return;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (currentUser.role === 'admin') {
    } else if (currentUser.role === 'manager') {
      if (task.creatorId !== currentUser.id) {
        addNotification('Доступ запрещен', 'Вы можете менять статус только своих задач', 'error', [currentUser.id]);
        return;
      }
    } else if (currentUser.role === 'executor') {
      addNotification('Доступ запрещен', 'Исполнитель не может менять статус задач', 'error', [currentUser.id]);
      return;
    }

    const oldStatus = task.status;
    const oldDeadlineMet = task.deadlineMet;
    const oldEffectiveness = task.effectiveness;
    const oldQuality = task.quality;
    
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      
      if (updatedTask) {
        // Если статус меняется с "completed" на другой, удаляем задачу из истории исполнителя
        if (oldStatus === 'completed' && newStatus !== 'completed' && 
            (oldDeadlineMet > 0 || oldEffectiveness > 0 || oldQuality > 0)) {
          
          setExecutors(prevExecutors => 
            prevExecutors.map(executor => {
              if (executor.id === updatedTask.executorId) {
                // Удаляем задачу из истории
                const newTaskHistory = executor.taskHistory?.filter(h => h.taskId !== taskId) || [];
                
                return {
                  ...executor,
                  taskHistory: newTaskHistory,
                  // Уменьшаем счетчик выполненных задач, если задача была в истории
                  completedTasks: executor.taskHistory?.some(h => h.taskId === taskId) 
                    ? Math.max(0, executor.completedTasks - 1) 
                    : executor.completedTasks,
                  status: newStatus === 'in-progress' ? 'busy' : 'free'
                };
              }
              return executor;
            })
          );
          
          // Обнуляем оценку задачи
          updatedTask.deadlineMet = 0;
          updatedTask.effectiveness = 0;
          updatedTask.quality = 0;
        } else {
          // Обычное изменение статуса
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

        const recipientIds = [];
        if (updatedTask.executorId) recipientIds.push(updatedTask.executorId);
        if (updatedTask.creatorId) recipientIds.push(updatedTask.creatorId);

        if (newStatus === 'in-progress') {
          addNotification('Работа начата', `Задача "${updatedTask.title}" взята в работу`, 'info', recipientIds);
          logAction('Начата работа над задачей', `Задача "${updatedTask.title}"`);
        } else if (newStatus === 'completed') {
          addNotification('Задача завершена', `Задача "${updatedTask.title}" успешно завершена`, 'success', recipientIds);
          logAction('Задача завершена', `Задача "${updatedTask.title}"`);
        } else if (newStatus === 'under-review') {
          addNotification('Задача на проверке', `Задача "${updatedTask.title}" отправлена на проверку`, 'info', recipientIds);
          logAction('Задача отправлена на проверку', `Задача "${updatedTask.title}"`);
        }
      }
      
      return updatedTasks;
    });
    setEditingTaskId(null);
  };

  const handleCompleteTaskWithReport = (taskId, reportFile) => {
    if (!currentUser || currentUser.role !== 'executor') {
      addNotification('Ошибка', 'Только исполнитель может завершать задачи', 'error', [currentUser.id]);
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.executorId !== currentUser.id) {
      addNotification('Ошибка', 'Вы не являетесь исполнителем этой задачи', 'error', [currentUser.id]);
      return;
    }

    if (reportFile) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { 
          ...t, 
          status: 'under-review',
          reportFile: {
            name: reportFile.name,
            size: reportFile.size,
            type: reportFile.type,
            lastModified: reportFile.lastModified
          }
        } : t
      ));
    } else {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { 
          ...t, 
          status: 'under-review'
        } : t
      ));
    }

    setExecutors(prev => prev.map(e => 
      e.id === task.executorId ? { ...e, status: 'free' } : e
    ));

    const recipientIds = [];
    if (task.executorId) recipientIds.push(task.executorId);
    if (task.creatorId) recipientIds.push(task.creatorId);

    addNotification('Задача завершена досрочно', 
      `Исполнитель ${currentUser.name} завершил задачу "${task.title}"${reportFile ? ' с прикрепленным отчётом' : ''}`, 
      'success',
      recipientIds);
    
    logAction('Задача завершена досрочно', 
      `Исполнитель ${currentUser.name} завершил задачу "${task.title}"${reportFile ? ' с прикрепленным отчётом' : ''}`);
  };

  const handleRateTask = (taskId, deadlineMet, effectiveness, quality, totalScore) => {
    const task = tasks.find(t => t.id === taskId);
    const executor = executors.find(e => e.id === task.executorId);
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { 
        ...t, 
        deadlineMet, 
        effectiveness, 
        quality,
        status: 'completed'
      } : t
    ));

    if (executor) {
      setExecutors(prev => prev.map(e => {
        if (e.id === task.executorId) {
          const existingTaskIndex = e.taskHistory?.findIndex(h => h.taskId === taskId) ?? -1;
          const newHistory = [...(e.taskHistory || [])];
          
          const taskHistoryEntry = {
            taskId,
            title: task.title,
            deadlineMet,
            effectiveness,
            quality,
            date: new Date().toISOString().split('T')[0]
          };
          
          if (existingTaskIndex >= 0) {
            newHistory[existingTaskIndex] = taskHistoryEntry;
          } else {
            newHistory.push(taskHistoryEntry);
          }
          
          return {
            ...e,
            completedTasks: existingTaskIndex >= 0 ? e.completedTasks : e.completedTasks + 1,
            taskHistory: newHistory
          };
        }
        return e;
      }));
    }

    setTimeout(() => {
      const updatedExecutor = executors.find(e => e.id === task.executorId);
      if (updatedExecutor && updatedExecutor.taskHistory && updatedExecutor.taskHistory.length > 0) {
        const totalRatings = updatedExecutor.taskHistory.reduce((sum, history) => 
          sum + (history.deadlineMet + history.effectiveness + history.quality), 0);
        const averageRating = totalRatings / (updatedExecutor.taskHistory.length * 3);
        
        setExecutors(prev => prev.map(e => 
          e.id === task.executorId ? { ...e, rating: parseFloat(averageRating.toFixed(1)) } : e
        ));
      }
    }, 100);

    const recipientIds = [];
    if (task.executorId) recipientIds.push(task.executorId);
    if (task.creatorId) recipientIds.push(task.creatorId);

    addNotification('Оценка сохранена', 
      `Задача "${task.title}" оценена. Общий балл: ${totalScore}/15`, 
      'success',
      recipientIds);
    
    logAction('Задача оценена', 
      `Задача "${task.title}" оценена на ${totalScore}/15 баллов`);
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();
    
    if (!currentUser || currentUser.role === 'executor') {
      addNotification('Доступ запрещен', 'У вас нет прав для создания задач', 'error', [currentUser.id]);
      return;
    }

    if (!newTask.executorId) {
      addNotification('Ошибка', 'Выберите исполнителя для задачи', 'error', [currentUser.id]);
      return;
    }

    const selectedExecutor = executors.find(executor => executor.id === parseInt(newTask.executorId));
    
    if (!selectedExecutor) {
      addNotification('Ошибка', 'Исполнитель не найден', 'error', [currentUser.id]);
      return;
    }

    const task = {
      id: Date.now(),
      ...newTask,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      executorId: parseInt(newTask.executorId),
      executorName: selectedExecutor.name,
      status: 'in-progress',
      createdAt: new Date().toISOString().split('T')[0],
      deadlineMet: 0,
      effectiveness: 0,
      quality: 0,
      attachmentFile: newTask.attachmentFile,
      reportFile: null
    };

    setTasks(prev => [...prev, task]);
    
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
      executorId: '',
      attachmentFile: null
    });
    setAttachmentFileName('');
    setShowTaskForm(false);
    
    const recipientIds = [task.executorId, currentUser.id];
    
    addNotification('Задача создана', `Новая задача "${task.title}" назначена ${selectedExecutor.name}`, 'success', recipientIds);
    logAction('Создана задача', `Задача "${task.title}" назначена ${selectedExecutor.name}`);
  };

  const handleAttachmentFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewTask(prev => ({ ...prev, attachmentFile: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }}));
      setAttachmentFileName(file.name);
    }
  };

  const handleDeleteSelectedTasks = () => {
    if (!currentUser || currentUser.role === 'executor') {
      addNotification('Доступ запрещен', 'У вас нет прав для удаления задач', 'error', [currentUser.id]);
      return;
    }

    if (selectedTasks.length === 0) {
      addNotification('Ошибка', 'Выберите задачи для удаления', 'error', [currentUser.id]);
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить ${selectedTasks.length} задач?`)) {
      const tasksToDelete = tasks.filter(task => selectedTasks.includes(task.id));
      
      if (currentUser.role === 'manager') {
        const notOwnedTasks = tasksToDelete.filter(task => task.creatorId !== currentUser.id);
        if (notOwnedTasks.length > 0) {
          addNotification('Ошибка', 'Вы можете удалять только свои задачи', 'error', [currentUser.id]);
          return;
        }
      }
      
      setExecutors(prevExecutors => {
        let updatedExecutors = [...prevExecutors];
        tasksToDelete.forEach(task => {
          if (task.status === 'in-progress') {
            updatedExecutors = updatedExecutors.map(executor => 
              executor.id === task.executorId 
                ? { ...executor, status: 'free' }
                : executor
            );
          }
        });
        return updatedExecutors;
      });

      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
      setSelectedTasks([]);
      setDeleteTaskMode(false);
      
      addNotification('Задачи удалены', `Удалено ${tasksToDelete.length} задач`, 'info', [currentUser.id]);
      logAction('Удалены задачи', `Удалено ${tasksToDelete.length} задач`);
    }
  };

  // Фильтрация и поиск
  const filteredTasks = tasks.filter(task => {
    if (taskFilter !== 'all' && task.status !== taskFilter) return false;
    if (taskSearch && !task.title.toLowerCase().includes(taskSearch.toLowerCase())) return false;
    return true;
  });

  const filteredExecutors = executors.filter(executor => {
    if (executorFilter !== 'all' && executor.status !== executorFilter) return false;
    if (executorSearch && !executor.name.toLowerCase().includes(executorSearch.toLowerCase())) return false;
    return true;
  });

  let displayedUsers = users;
  
  if (currentUser) {
    if (currentUser.role === 'manager') {
      displayedUsers = users.filter(user => user.role === 'executor');
    } 
    else if (currentUser.role === 'admin') {
      if (userRoleFilter !== 'all') {
        displayedUsers = users.filter(user => user.role === userRoleFilter);
      }
      if (userSearch) {
        displayedUsers = displayedUsers.filter(user => 
          user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.username.toLowerCase().includes(userSearch.toLowerCase())
        );
      }
    }
  } else {
    displayedUsers = [];
  }

  const freeExecutors = executors.filter(executor => executor.status === 'free');

  const myProjects = tasks.filter(task => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'executor') {
      return task.executorId === currentUser.id;
    } else if (currentUser.role === 'manager') {
      return task.creatorId === currentUser.id;
    } else if (currentUser.role === 'admin') {
      return true;
    }
    return false;
  });

  // Статистика
  const totalExecutors = executors.length;
  const freeExecutorsCount = freeExecutors.length;
  const busyExecutors = executors.filter(e => e.status === 'busy').length;
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const reviewTasks = tasks.filter(task => task.status === 'under-review').length;
  const myTasksCount = myProjects.length;

  // Если пользователь не авторизован
  if (!currentUser) {
    return (
      <>
        <div style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '450px',
            animation: 'slideIn 0.5s ease-out'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}>
                ReinPlatform
              </div>
            </div>
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Имя пользователя:
                </label>
                <input
                  type="text"
                  name="username"
                  value={loginForm.username}
                  onChange={(e) => {
                    setLoginForm(prev => ({ ...prev, username: e.target.value }));
                    setLoginError('');
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${loginError ? '#f44336' : '#e0e0e0'}`,
                    borderRadius: '10px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Пароль:
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={(e) => {
                    setLoginForm(prev => ({ ...prev, password: e.target.value }));
                    setLoginError('');
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${loginError ? '#f44336' : '#e0e0e0'}`,
                    borderRadius: '10px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
              
              {loginError && (
                <div style={{ 
                  color: '#f44336', 
                  fontSize: '14px', 
                  marginBottom: '15px',
                  fontWeight: '500',
                  textAlign: 'center',
                  padding: '10px',
                  background: '#ffebee',
                  borderRadius: '8px',
                  border: '1px solid #f44336'
                }}>
                  ⚠️ {loginError}
                </div>
              )}
              
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                Войти в систему
              </button>
            </form>
            
            <div style={{ 
              marginTop: '25px', 
              fontSize: '13px', 
              color: '#666',
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '10px'
            }}>
              <p style={{ marginBottom: '10px', fontWeight: '600' }}><strong>Тестовые аккаунты:</strong></p>
              <div style={{ display: 'grid', gap: '5px' }}>
                <div><strong>Админ:</strong> admin / admin123</div>
                <div><strong>Руководитель:</strong> manager / manager123</div>
                <div><strong>Исполнитель:</strong> executor / executor123</div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const getTasksTabTitle = () => {
    if (currentUser.role === 'executor') {
      return '📋 Все задачи';
    }
    return '📋 Управление задачами';
  };

  // Основной интерфейс
  return (
    <>
      <NotificationCenter 
        notifications={notifications}
        removeNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
        currentUser={currentUser}
      />

      {userToChangePassword && (
        <ChangePasswordModal
          user={userToChangePassword}
          onClose={() => setUserToChangePassword(null)}
          onChangePassword={handleChangePassword}
        />
      )}

      {taskToComplete && (
        <TaskCompleteModal
          task={taskToComplete}
          onClose={() => setTaskToComplete(null)}
          onComplete={handleCompleteTaskWithReport}
        />
      )}

      {showExecutorSelection && (
        <ExecutorSelectionModal
          executors={executors}
          onClose={() => setShowExecutorSelection(false)}
          onSelectExecutor={(executor) => {
            setNewTask(prev => ({ ...prev, executorId: executor.id }));
            setShowExecutorSelection(false);
          }}
        />
      )}

      {showExecutorProfile && (
        <ExecutorProfileModal
          executor={selectedExecutor}
          onClose={() => {
            setShowExecutorProfile(false);
            setSelectedExecutor(null);
          }}
          onOpenTaskCard={openTaskCard}
          getTaskById={getTaskById}
        />
      )}

      {showTaskCard && (
        <TaskCardModal
          task={selectedTask}
          onClose={() => {
            setShowTaskCard(false);
            setSelectedTask(null);
          }}
          addNotification={addNotification}
          currentUser={currentUser}
        />
      )}

      {taskToRate && (
        <TaskRatingModal
          task={taskToRate}
          onClose={() => setTaskToRate(null)}
          onRate={handleRateTask}
        />
      )}

      <div style={{ 
        padding: '25px', 
        width: '100%',
        minWidth: '1200px',
        maxWidth: '1400px', 
        margin: '0 auto',
        minHeight: 'calc(100vh - 100px)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          marginBottom: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid #e0e0e0',
          animation: 'fadeIn 0.3s ease-out',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div>
            <h2 style={{ 
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #333 0%, #666 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '20px'
            }}>
              Главная панель управления
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p style={{ margin: 0, color: '#333', fontWeight: '600', fontSize: '14px' }}>
                  {currentUser.name}
                </p>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '15px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: 
                    currentUser.role === 'admin' ? '#d4edda' : 
                    currentUser.role === 'manager' ? '#fff3cd' : '#e3f2fd',
                  color: 
                    currentUser.role === 'admin' ? '#155724' : 
                    currentUser.role === 'manager' ? '#856404' : '#1565c0',
                  display: 'inline-block',
                  marginTop: '4px'
                }}>
                  {currentUser.role === 'admin' ? 'Администратор' : 
                   currentUser.role === 'manager' ? 'Руководитель' : 'Исполнитель'}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentUser.role === 'admin' && (
              <button 
                onClick={() => {
                  setActiveTab('history');
                  setShowHistory(true);
                }}
                style={{
                  padding: '8px 16px',
                  background: activeTab === 'history' ? 
                    'linear-gradient(135deg, #333 0%, #666 100%)' : 
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                📜 История действий
              </button>
            )}
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#f0f0f0',
                color: '#333',
                border: '2px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              Выйти
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px',
          marginBottom: '25px',
          width: '100%'
        }}>
          <div className="hover-card" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center',
            borderTop: '4px solid #667eea',
            minWidth: '180px'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
              {totalTasks}
            </div>
            <div style={{ color: '#666', fontSize: '13px' }}>Всего задач</div>
          </div>
          
          <div className="hover-card" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center',
            borderTop: '4px solid #ff9800',
            minWidth: '180px'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
              {activeTasks}
            </div>
            <div style={{ color: '#666', fontSize: '13px' }}>В работе</div>
          </div>
          
          <div className="hover-card" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center',
            borderTop: '4px solid #4caf50',
            minWidth: '180px'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50', marginBottom: '8px' }}>
              {completedTasks}
            </div>
            <div style={{ color: '#666', fontSize: '13px' }}>Завершено</div>
          </div>
          
          <div className="hover-card" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center',
            borderTop: '4px solid #9c27b0',
            minWidth: '180px'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9c27b0', marginBottom: '8px' }}>
              {reviewTasks}
            </div>
            <div style={{ color: '#666', fontSize: '13px' }}>На проверке</div>
          </div>
          
          <div className="hover-card" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center',
            borderTop: '4px solid #2196f3',
            minWidth: '180px'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196f3', marginBottom: '8px' }}>
              {myTasksCount}
            </div>
            <div style={{ color: '#666', fontSize: '13px' }}>Мои задачи</div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '25px',
          background: 'white',
          padding: '12px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          overflowX: 'auto',
          flexWrap: 'wrap',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button 
            onClick={() => {
              setActiveTab('tasks');
              setShowHistory(false);
            }}
            style={{
              padding: '8px 16px',
              background: activeTab === 'tasks' ? 
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
              color: activeTab === 'tasks' ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              flex: '1',
              whiteSpace: 'nowrap',
              minWidth: '180px'
            }}
          >
            {getTasksTabTitle()}
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('my-projects');
              setShowHistory(false);
            }}
            style={{
              padding: '8px 16px',
              background: activeTab === 'my-projects' ? 
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
              color: activeTab === 'my-projects' ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              flex: '1',
              whiteSpace: 'nowrap',
              minWidth: '180px'
            }}
          >
            {currentUser.role === 'executor' ? '📋 Мои задачи' : '🏆 Мои проекты'}
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('executors');
              setShowHistory(false);
            }}
            style={{
              padding: '8px 16px',
              background: activeTab === 'executors' ? 
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
              color: activeTab === 'executors' ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              flex: '1',
              whiteSpace: 'nowrap',
              minWidth: '180px'
            }}
          >
            👥 Исполнители
          </button>
          
          {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
            <button 
              onClick={() => {
                setActiveTab('users');
                setShowHistory(false);
              }}
              style={{
                padding: '8px 16px',
                background: activeTab === 'users' ? 
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                color: activeTab === 'users' ? 'white' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                flex: '1',
                whiteSpace: 'nowrap',
                minWidth: '180px'
              }}
            >
              👤 Управление пользователями
            </button>
          )}
        </div>

        {activeTab === 'tasks' && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            animation: 'slideIn 0.3s ease-out',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
              width: '100%'
            }}>
              <h3 style={{ 
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px'
              }}>
                {getTasksTabTitle()}
              </h3>
              
              {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {!deleteTaskMode ? (
                    <>
                      <button 
                        onClick={() => setShowTaskForm(!showTaskForm)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        ➕ Создать задачу
                      </button>
                      <button 
                        onClick={() => setDeleteTaskMode(true)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        🗑️ Удалить задачи
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleDeleteSelectedTasks}
                        disabled={selectedTasks.length === 0}
                        style={{
                          padding: '8px 16px',
                          background: selectedTasks.length === 0 ? '#f0f0f0' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                          color: selectedTasks.length === 0 ? '#666' : 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: selectedTasks.length === 0 ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        🗑️ Удалить выбранные ({selectedTasks.length})
                      </button>
                      <button 
                        onClick={() => {
                          setDeleteTaskMode(false);
                          setSelectedTasks([]);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#f0f0f0',
                          color: '#333',
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        ❌ Отмена
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              alignItems: 'center',
              width: '100%'
            }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  placeholder="🔍 Поиск по названию задачи..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'in-progress', 'under-review', 'completed'].map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setTaskFilter(filter)}
                    style={{
                      padding: '8px 16px',
                      background: taskFilter === filter ? 
                        (filter === 'all' ? '#667eea' : 
                         filter === 'in-progress' ? '#ff9800' : 
                         filter === 'under-review' ? '#9c27b0' : '#4caf50') : '#f0f0f0',
                      color: taskFilter === filter ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {filter === 'all' && `Все задачи (${tasks.length})`}
                    {filter === 'in-progress' && `В работе (${activeTasks})`}
                    {filter === 'under-review' && `На проверке (${reviewTasks})`}
                    {filter === 'completed' && `Завершённые (${completedTasks})`}
                  </button>
                ))}
              </div>
            </div>

            {(currentUser.role === 'admin' || currentUser.role === 'manager') && showTaskForm && (
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid #e0e0e0',
                animation: 'slideIn 0.3s ease-out',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>
                  📝 Создание новой задачи
                </h4>
                <form onSubmit={handleSubmitTask}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                      Название задачи:
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                      Описание:
                    </label>
                    <textarea
                      name="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      required
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        resize: 'vertical',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                      Прикрепите файл (необязательно):
                    </label>
                    <div style={{
                      border: '2px dashed #e0e0e0',
                      borderRadius: '6px',
                      padding: '15px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <input
                        type="file"
                        id="attachmentFile"
                        onChange={handleAttachmentFileChange}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                      {attachmentFileName ? (
                        <div>
                          <div style={{ fontSize: '24px', color: '#4caf50', marginBottom: '8px' }}>📎</div>
                          <div style={{ color: '#333', fontWeight: '600' }}>{attachmentFileName}</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '24px', color: '#999', marginBottom: '8px' }}>📎</div>
                          <div style={{ color: '#666' }}>Нажмите для выбора файла</div>
                          <div style={{ color: '#999', fontSize: '11px', marginTop: '5px' }}>
                            PNG, JPG, PDF, DOC, XLS (макс. 10MB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '15px', 
                    marginBottom: '20px' 
                  }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                        Дедлайн:
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={newTask.deadline}
                        onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '13px',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                        Исполнитель:
                      </label>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {newTask.executorId ? (
                          <div style={{
                            padding: '10px',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: '600', color: '#333', fontSize: '13px' }}>
                                {executors.find(e => e.id === parseInt(newTask.executorId))?.name || 'Неизвестный исполнитель'}
                              </div>
                              <div style={{ color: '#666', fontSize: '12px' }}>
                                {executors.find(e => e.id === parseInt(newTask.executorId))?.specialization}
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setNewTask(prev => ({ ...prev, executorId: '' }))}
                              style={{
                                padding: '5px 10px',
                                background: '#f0f0f0',
                                color: '#333',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              Изменить
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setShowExecutorSelection(true)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                          >
                            <span>👥</span>
                            Выбрать исполнителя
                          </button>
                        )}
                        
                        <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
                          {newTask.executorId ? 'Исполнитель выбран' : 'Нажмите для выбора исполнителя'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      Создать задачу
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowTaskForm(false);
                        setNewTask({
                          title: '',
                          description: '',
                          deadline: '',
                          executorId: '',
                          attachmentFile: null
                        });
                        setAttachmentFileName('');
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#f0f0f0',
                        color: '#333',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ maxHeight: '450px', overflowY: 'auto', width: '100%' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                minWidth: '1000px'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    position: 'sticky',
                    top: 0
                  }}>
                    {(currentUser.role === 'admin' || currentUser.role === 'manager') && deleteTaskMode && (
                      <th style={{ padding: '12px', textAlign: 'center', width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                          onChange={() => {
                            if (selectedTasks.length === filteredTasks.length) {
                              setSelectedTasks([]);
                            } else {
                              setSelectedTasks(filteredTasks.map(task => task.id));
                            }
                          }}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer'
                          }}
                        />
                      </th>
                    )}
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '15%', fontSize: '13px' }}>Название</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '20%', fontSize: '13px' }}>Описание</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '12%', fontSize: '13px' }}>Создатель</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '12%', fontSize: '13px' }}>Исполнитель</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '10%', fontSize: '13px' }}>Дедлайн</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '10%', fontSize: '13px' }}>Статус</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '21%', fontSize: '13px' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => {
                    const calculateDaysLeft = (deadline) => {
                      const deadlineDate = new Date(deadline);
                      const now = new Date();
                      const diffTime = deadlineDate - now;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays;
                    };

                    const daysLeft = calculateDaysLeft(task.deadline);
                    const canEditStatus = currentUser.role === 'admin' || 
                                         (currentUser.role === 'manager' && task.creatorId === currentUser.id);
                    
                    return (
                      <tr 
                        key={task.id} 
                        className="table-row"
                        style={{ 
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: selectedTasks.includes(task.id) ? '#fff3cd' : 'transparent'
                        }}
                      >
                        {(currentUser.role === 'admin' || currentUser.role === 'manager') && deleteTaskMode && (
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => {
                                setSelectedTasks(prev => 
                                  prev.includes(task.id) 
                                    ? prev.filter(id => id !== task.id)
                                    : [...prev, task.id]
                                );
                              }}
                              style={{
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer'
                              }}
                            />
                          </td>
                        )}
                        <td style={{ padding: '12px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                          <span
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskCard(true);
                            }}
                            style={{
                              color: '#667eea',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {task.title}
                            {task.attachmentFile && (
                              <span style={{ marginLeft: '5px', color: '#999', fontSize: '12px' }}>📎</span>
                            )}
                            {task.reportFile && (
                              <span style={{ marginLeft: '5px', color: '#4caf50', fontSize: '12px' }}>📊</span>
                            )}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                          <div style={{ 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            cursor: 'help',
                            maxWidth: '250px'
                          }} title={task.description}>
                            {task.description}
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                          {task.creatorName}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span 
                            onClick={() => {
                              const executor = executors.find(e => e.id === task.executorId);
                              if (executor) {
                                setSelectedExecutor(executor);
                                setShowExecutorProfile(true);
                              }
                            }}
                            style={{
                              color: '#667eea',
                              cursor: 'pointer',
                              fontWeight: '600',
                              transition: 'all 0.3s ease',
                              display: 'inline-block',
                              fontSize: '13px'
                            }}
                          >
                            {task.executorName || 'Не назначен'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#333', fontSize: '13px' }}>{task.deadline}</span>
                            {task.status === 'in-progress' && task.deadline && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                background: daysLeft <= 1 ? '#f8d7da' : 
                                          daysLeft <= 3 ? '#fff3cd' : '#d4edda',
                                color: daysLeft <= 1 ? '#721c24' : 
                                      daysLeft <= 3 ? '#856404' : '#155724',
                                fontWeight: '600',
                                display: 'inline-block'
                              }}>
                                {daysLeft > 0 ? `Осталось ${daysLeft} дн.` : 'Просрочено'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {editingTaskId === task.id && canEditStatus ? (
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              autoFocus
                              onBlur={() => setEditingTaskId(null)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: '2px solid #3498db',
                                backgroundColor: 
                                  task.status === 'completed' ? '#d4edda' : 
                                  task.status === 'under-review' ? '#e6ccff' : '#fff3cd',
                                color: 
                                  task.status === 'completed' ? '#155724' : 
                                  task.status === 'under-review' ? '#4b0082' : '#856404',
                                cursor: 'pointer',
                                outline: 'none',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <option value="in-progress">🟡 В работе</option>
                              <option value="under-review">🟣 На проверке</option>
                              <option value="completed">✅ Завершена</option>
                            </select>
                          ) : (
                            <span 
                              onClick={() => canEditStatus && setEditingTaskId(task.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: 
                                  task.status === 'completed' ? '#d4edda' : 
                                  task.status === 'under-review' ? '#e6ccff' : '#fff3cd',
                                color: 
                                  task.status === 'completed' ? '#155724' : 
                                  task.status === 'under-review' ? '#4b0082' : '#856404',
                                cursor: canEditStatus ? 'pointer' : 'default',
                                display: 'inline-block',
                                minWidth: '110px',
                                textAlign: 'center',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              {task.status === 'completed' ? '✅ Завершена' : 
                               task.status === 'under-review' ? '🟣 На проверке' : '🟡 В работе'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskCard(true);
                              }}
                              style={{
                                padding: '5px 10px',
                                background: '#f0f0f0',
                                color: '#333',
                                border: '2px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              👁️ Карточка
                            </button>
                            
                            {currentUser.role === 'executor' && 
                             task.status === 'in-progress' && 
                             task.executorId === currentUser.id && (
                              <button
                                onClick={() => setTaskToComplete(task)}
                                style={{
                                  padding: '5px 10px',
                                  background: 'linear-gradient(135deg, #27ae60 0%, #219653 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                              >
                                Завершить
                              </button>
                            )}
                            
                            {(currentUser.role === 'admin' || 
                              (currentUser.role === 'manager' && task.creatorId === currentUser.id)) && 
                             task.status === 'under-review' && (
                              <button
                                onClick={() => setTaskToRate(task)}
                                style={{
                                  padding: '5px 10px',
                                  background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                              >
                                Оценить
                              </button>
                            )}
                            
                            {task.status === 'completed' && task.deadlineMet > 0 && (
                              <span style={{
                                padding: '5px 10px',
                                background: '#f0f0f0',
                                color: '#333',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                ⭐ {task.deadlineMet + task.effectiveness + task.quality}/15
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredTasks.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#999',
                  width: '100%'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '15px' }}>📭</div>
                  <p style={{ fontSize: '14px', marginBottom: '10px' }}>Нет задач, соответствующих выбранному фильтру</p>
                  {taskFilter !== 'all' && (
                    <button 
                      onClick={() => setTaskFilter('all')}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      Показать все задачи
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-projects' && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            animation: 'slideIn 0.3s ease-out',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              width: '100%'
            }}>
              <h3 style={{ 
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px'
              }}>
                {currentUser.role === 'executor' ? '📋 Мои задачи' : '🏆 Мои проекты'}
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginLeft: '8px',
                  fontWeight: 'normal'
                }}>
                  ({myProjects.length} задач)
                </span>
              </h3>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '1px solid #e0e0e0'
            }}>
              <p style={{ margin: 0, color: '#333', fontSize: '13px' }}>
                {currentUser.role === 'executor' 
                  ? 'Здесь отображаются задачи, в которых вы назначены исполнителем'
                  : currentUser.role === 'manager'
                  ? 'Здесь отображаются задачи, созданные вами как руководителем'
                  : 'Здесь отображаются все задачи в системе'}
              </p>
            </div>

            <div style={{ maxHeight: '450px', overflowY: 'auto', width: '100%' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                minWidth: '1000px'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    position: 'sticky',
                    top: 0
                  }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '20%', fontSize: '13px' }}>Название</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '25%', fontSize: '13px' }}>Описание</th>
                    {currentUser.role !== 'executor' && (
                      <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '15%', fontSize: '13px' }}>Исполнитель</th>
                    )}
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '10%', fontSize: '13px' }}>Дедлайн</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '10%', fontSize: '13px' }}>Статус</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '20%', fontSize: '13px' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {myProjects.map(task => {
                    const calculateDaysLeft = (deadline) => {
                      const deadlineDate = new Date(deadline);
                      const now = new Date();
                      const diffTime = deadlineDate - now;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays;
                    };

                    const daysLeft = calculateDaysLeft(task.deadline);
                    const canEditStatus = currentUser.role === 'admin' || 
                                         (currentUser.role === 'manager' && task.creatorId === currentUser.id);
                    
                    return (
                      <tr 
                        key={task.id} 
                        className="table-row"
                        style={{ 
                          borderBottom: '1px solid #f0f0f0'
                        }}
                      >
                        <td style={{ padding: '12px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                          <span
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskCard(true);
                            }}
                            style={{
                              color: '#667eea',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {task.title}
                            {task.attachmentFile && (
                              <span style={{ marginLeft: '5px', color: '#999', fontSize: '12px' }}>📎</span>
                            )}
                            {task.reportFile && (
                              <span style={{ marginLeft: '5px', color: '#4caf50', fontSize: '12px' }}>📊</span>
                            )}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                          <div style={{ 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            cursor: 'help',
                            maxWidth: currentUser.role === 'executor' ? '400px' : '300px'
                          }} title={task.description}>
                            {task.description}
                          </div>
                        </td>
                        
                        {currentUser.role !== 'executor' && (
                          <td style={{ padding: '12px' }}>
                            <span 
                              onClick={() => {
                                const executor = executors.find(e => e.id === task.executorId);
                                if (executor) {
                                  setSelectedExecutor(executor);
                                  setShowExecutorProfile(true);
                                }
                              }}
                              style={{
                                color: '#667eea',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                display: 'inline-block',
                                fontSize: '13px'
                              }}
                            >
                              {task.executorName || 'Не назначен'}
                            </span>
                          </td>
                        )}
                        
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#333', fontSize: '13px' }}>{task.deadline}</span>
                            {task.status === 'in-progress' && task.deadline && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                background: daysLeft <= 1 ? '#f8d7da' : 
                                          daysLeft <= 3 ? '#fff3cd' : '#d4edda',
                                color: daysLeft <= 1 ? '#721c24' : 
                                      daysLeft <= 3 ? '#856404' : '#155724',
                                fontWeight: '600',
                                display: 'inline-block'
                              }}>
                                {daysLeft > 0 ? `Осталось ${daysLeft} дн.` : 'Просрочено'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {editingTaskId === task.id && canEditStatus ? (
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              autoFocus
                              onBlur={() => setEditingTaskId(null)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: '2px solid #3498db',
                                backgroundColor: 
                                  task.status === 'completed' ? '#d4edda' : 
                                  task.status === 'under-review' ? '#e6ccff' : '#fff3cd',
                                color: 
                                  task.status === 'completed' ? '#155724' : 
                                  task.status === 'under-review' ? '#4b0082' : '#856404',
                                cursor: 'pointer',
                                outline: 'none',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <option value="in-progress">🟡 В работе</option>
                              <option value="under-review">🟣 На проверке</option>
                              <option value="completed">✅ Завершена</option>
                            </select>
                          ) : (
                            <span 
                              onClick={() => canEditStatus && setEditingTaskId(task.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: 
                                  task.status === 'completed' ? '#d4edda' : 
                                  task.status === 'under-review' ? '#e6ccff' : '#fff3cd',
                                color: 
                                  task.status === 'completed' ? '#155724' : 
                                  task.status === 'under-review' ? '#4b0082' : '#856404',
                                cursor: canEditStatus ? 'pointer' : 'default',
                                display: 'inline-block',
                                minWidth: '110px',
                                textAlign: 'center',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              {task.status === 'completed' ? '✅ Завершена' : 
                               task.status === 'under-review' ? '🟣 На проверке' : '🟡 В работе'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskCard(true);
                              }}
                              style={{
                                padding: '5px 10px',
                                background: '#f0f0f0',
                                color: '#333',
                                border: '2px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              👁️ Карточка
                            </button>
                            
                            {currentUser.role === 'executor' && 
                             task.status === 'in-progress' && 
                             task.executorId === currentUser.id && (
                              <button
                                onClick={() => setTaskToComplete(task)}
                                style={{
                                  padding: '5px 10px',
                                  background: 'linear-gradient(135deg, #27ae60 0%, #219653 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                              >
                                Завершить
                              </button>
                            )}
                            
                            {(currentUser.role === 'admin' || 
                              (currentUser.role === 'manager' && task.creatorId === currentUser.id)) && 
                             task.status === 'under-review' && (
                              <button
                                onClick={() => setTaskToRate(task)}
                                style={{
                                  padding: '5px 10px',
                                  background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                              >
                                Оценить
                              </button>
                            )}
                            
                            {task.status === 'completed' && task.deadlineMet > 0 && (
                              <span style={{
                                padding: '5px 10px',
                                background: '#f0f0f0',
                                color: '#333',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                ⭐ {task.deadlineMet + task.effectiveness + task.quality}/15
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {myProjects.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#999',
                  width: '100%'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '15px' }}>📋</div>
                  <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                    {currentUser.role === 'executor' 
                      ? 'Вас еще не назначили исполнителем ни одной задачи'
                      : currentUser.role === 'manager'
                      ? 'Вы еще не создали ни одной задачи'
                      : 'В системе пока нет задач'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'executors' && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            animation: 'slideIn 0.3s ease-out',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              width: '100%'
            }}>
              <h3 style={{ 
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px'
              }}>
                👥 Исполнители
              </h3>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              alignItems: 'center',
              width: '100%'
            }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  placeholder="🔍 Поиск по имени исполнителя..."
                  value={executorSearch}
                  onChange={(e) => setExecutorSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'free', 'busy'].map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setExecutorFilter(filter)}
                    style={{
                      padding: '8px 16px',
                      background: executorFilter === filter ? 
                        (filter === 'all' ? '#667eea' : 
                         filter === 'free' ? '#4caf50' : '#e74c3c') : '#f0f0f0',
                      color: executorFilter === filter ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {filter === 'all' && `Все исполнители (${executors.length})`}
                    {filter === 'free' && `Свободные (${freeExecutorsCount})`}
                    {filter === 'busy' && `Занятые (${busyExecutors})`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '15px',
              width: '100%'
            }}>
              {filteredExecutors.map(executor => {
                const calculateTotalRating = (history) => {
                  if (!history || history.length === 0) return 0;
                  const total = history.reduce((sum, task) => 
                    sum + (task.deadlineMet + task.effectiveness + task.quality), 0);
                  return total / (history.length * 3);
                };

                const totalRating = calculateTotalRating(executor.taskHistory);

                return (
                  <div 
                    key={executor.id}
                    className="hover-card"
                    style={{
                      background: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '10px',
                      padding: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      minWidth: '260px',
                      boxSizing: 'border-box'
                    }}
                    onClick={() => {
                      setSelectedExecutor(executor);
                      setShowExecutorProfile(true);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {executor.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '15px' }}>{executor.name}</h4>
                        <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                          {executor.specialization}
                        </p>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ 
                          fontSize: '18px', 
                          color: totalRating >= 4.5 ? '#ff9800' : totalRating >= 4.0 ? '#4caf50' : '#f44336'
                        }}>
                          ⭐
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                          {totalRating.toFixed(1)}
                        </span>
                        <span style={{ fontSize: '11px', color: '#999' }}>
                          /5.0
                        </span>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: executor.status === 'free' ? '#d4edda' : '#f8d7da',
                        color: executor.status === 'free' ? '#155724' : '#721c24'
                      }}>
                        {executor.status === 'free' ? '✅ Свободен' : '❌ Занят'}
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333' }}>Выполнено задач</div>
                        <div>{executor.completedTasks}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333' }}>Дата регистрации</div>
                        <div>{executor.registrationDate}</div>
                      </div>
                    </div>

                    <div style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <div style={{ fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📊</span>
                        <span>Нажмите для просмотра профиля</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredExecutors.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#999',
                width: '100%'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '15px' }}>👥</div>
                <p style={{ fontSize: '14px' }}>Нет исполнителей, соответствующих выбранному фильтру</p>
              </div>
            )}
          </div>
        )}

        {(currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && activeTab === 'users') && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            marginBottom: '25px',
            animation: 'slideIn 0.3s ease-out',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              width: '100%'
            }}>
              <h3 style={{ 
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px'
              }}>
                👤 Управление пользователями
              </h3>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '1px solid #e0e0e0',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>
                ➕ Добавить нового пользователя
              </h4>
              <form onSubmit={handleAddUser}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px', 
                  marginBottom: '15px',
                  width: '100%'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                      Логин:
                    </label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                      Пароль:
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                      Имя:
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  {currentUser.role === 'admin' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                        Роль:
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => {
                          const role = e.target.value;
                          setNewUser(prev => ({ 
                            ...prev, 
                            role,
                            specialization: role === 'executor' ? prev.specialization : 'Руководитель'
                          }));
                        }}
                        required
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: 'white',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="manager">Руководитель</option>
                        <option value="executor">Исполнитель</option>
                      </select>
                    </div>
                  )}
                  
                  {newUser.role === 'executor' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                        Специализация:
                      </label>
                      <select
                        value={newUser.specialization}
                        onChange={(e) => setNewUser(prev => ({ ...prev, specialization: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '13px',
                          background: 'white',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        {specializations.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Добавить пользователя
                </button>
              </form>
            </div>

            {currentUser.role === 'admin' && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '15px',
                flexWrap: 'wrap',
                width: '100%',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Поиск по имени или логину..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{
                    padding: '8px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    minWidth: '130px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="all">Все роли</option>
                  <option value="admin">Администраторы</option>
                  <option value="manager">Руководители</option>
                  <option value="executor">Исполнители</option>
                </select>
                <button
                  onClick={() => {
                    setUserSearch('');
                    setUserRoleFilter('all');
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#f0f0f0',
                    color: '#333',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Сбросить фильтры
                </button>
              </div>
            )}

            <div style={{ maxHeight: '350px', overflowY: 'auto', width: '100%' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                minWidth: '1000px'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '15%', fontSize: '13px' }}>Логин</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '15%', fontSize: '13px' }}>Имя</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '15%', fontSize: '13px' }}>Роль</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '20%', fontSize: '13px' }}>Специализация</th>
                    {currentUser.role === 'admin' && (
                      <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '15%', fontSize: '13px' }}>Пароль</th>
                    )}
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '15%', fontSize: '13px' }}>Дата регистрации</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#333', width: '25%', fontSize: '13px' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map(user => (
                    <tr 
                      key={user.id} 
                      className="table-row"
                      style={{ 
                        borderBottom: '1px solid #f0f0f0'
                      }}
                    >
                      <td style={{ padding: '12px', fontSize: '13px' }}>{user.username}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{user.name}</td>
                      <td style={{ padding: '12px' }}>
                        {user.role === 'admin' ? (
                          <span style={{
                            padding: '5px 10px',
                            borderRadius: '15px',
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            fontWeight: '600',
                            fontSize: '11px',
                            display: 'inline-block'
                          }}>
                            Администратор
                          </span>
                        ) : currentUser.role === 'admin' ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '2px solid #e0e0e0',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              background: 'white',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          >
                            <option value="executor">Исполнитель</option>
                            <option value="manager">Руководитель</option>
                          </select>
                        ) : (
                          <span style={{
                            padding: '5px 10px',
                            borderRadius: '15px',
                            backgroundColor: user.role === 'manager' ? '#fff3cd' : '#e3f2fd',
                            color: user.role === 'manager' ? '#856404' : '#1565c0',
                            fontWeight: '600',
                            fontSize: '11px',
                            display: 'inline-block'
                          }}>
                            {user.role === 'manager' ? 'Руководитель' : 'Исполнитель'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                        {user.specialization || 'Не указана'}
                      </td>
                      {currentUser.role === 'admin' && (
                        <td style={{ 
                          padding: '12px', 
                          color: '#666', 
                          fontFamily: 'monospace',
                          fontSize: '11px'
                        }}>
                          {user.password}
                        </td>
                      )}
                      <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                        {user.registrationDate || 'Не указана'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => setUserToChangePassword(user)}
                            style={{
                              padding: '5px 10px',
                              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            Изменить пароль
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser.id || user.role === 'admin' || (currentUser.role === 'manager' && user.role === 'manager')}
                            style={{
                              padding: '5px 10px',
                              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: (user.id === currentUser.id || user.role === 'admin' || (currentUser.role === 'manager' && user.role === 'manager')) ? 'not-allowed' : 'pointer',
                              fontSize: '11px',
                              fontWeight: '600',
                              opacity: (user.id === currentUser.id || user.role === 'admin' || (currentUser.role === 'manager' && user.role === 'manager')) ? 0.5 : 1
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentUser && currentUser.role === 'admin' && showHistory && activeTab === 'history' && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            marginBottom: '25px',
            animation: 'slideIn 0.3s ease-out',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              width: '100%'
            }}>
              <h3 style={{ 
                margin: 0,
                background: 'linear-gradient(135deg, #333 0%, #666 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px'
              }}>
                📜 История действий
              </h3>
              <button 
                onClick={() => setShowHistory(false)}
                style={{
                  padding: '8px 16px',
                  background: '#f0f0f0',
                  color: '#333',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Скрыть
              </button>
            </div>
            
            <div style={{ maxHeight: '350px', overflowY: 'auto', width: '100%' }}>
              {actionHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {actionHistory.map((action, index) => (
                    <div 
                      key={action.id}
                      className="table-row"
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #f0f0f0',
                        background: index % 2 === 0 ? '#fafafa' : 'white',
                        borderRadius: '6px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', color: '#333', fontSize: '13px' }}>
                          {action.user} 
                          <span style={{
                            fontSize: '11px',
                            color: '#666',
                            marginLeft: '8px',
                            padding: '2px 6px',
                            background: '#f0f0f0',
                            borderRadius: '8px'
                          }}>
                            {action.role === 'admin' ? 'Админ' : action.role === 'manager' ? 'Руководитель' : action.role === 'system' ? 'Система' : 'Исполнитель'}
                          </span>
                        </span>
                        <span style={{ fontSize: '11px', color: '#999' }}>
                          {new Date(action.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: '#666', fontSize: '13px' }}>
                        {action.action} {action.details && `- ${action.details}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#999', width: '100%' }}>
                  История действий пуста
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Вспомогательные функции
const ensureAdminUser = (users) => {
  const adminUser = users.find(user => user.role === 'admin');
  
  if (!adminUser) {
    const defaultAdmin = initialUsers.find(user => user.role === 'admin');
    return [defaultAdmin, ...users.filter(user => user.id !== defaultAdmin.id)];
  }
  
  const correctedUsers = users.map(user => {
    if (user.username === 'admin' && user.role !== 'admin') {
      return { ...user, role: 'admin' };
    }
    return user;
  });
  
  return correctedUsers;
};

// Добавляем CSS анимации
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes modalSlideIn {
    from { transform: translateY(-50px) scale(0.95); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }
  
  @keyframes progressBar {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  .hover-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
    border-color: #667eea !important;
  }
  
  .table-row:hover {
    background-color: #f8f9fa !important;
  }
  
  .notification-item {
    animation: slideInRight 0.3s ease-out;
  }
`;

// Добавляем стили в документ
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Dashboard;