import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, X, Trash2, Edit2, CheckCircle, Circle, Bell, BellOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { scheduleNotification, cancelNotification, requestNotificationPermission, checkPendingNotifications, sendReminderNotification } from '../utils/notifications';

const CalendarPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    // Helper to get local date string YYYY-MM-DD (fixes timezone lag)
    const getLocalDateStr = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now - offset).toISOString().split('T')[0];
    };

    // Always initialize selectedDate to the real-time "today"
    const [selectedDate, setSelectedDate] = useState(getLocalDateStr);

    // Force update date on mount/focus to prevent "stuck on yesterday" if app was backgrounded
    useEffect(() => {
        const updateToRealTime = () => {
            const now = new Date();
            const todayStr = getLocalDateStr();
            const currentSelected = new Date(selectedDate).toISOString().split('T')[0];

            // If the selected date is in the past (e.g. yesterday), bump it to today
            if (currentSelected < todayStr) {
                setSelectedDate(todayStr);
                setCurrentDate(now);
            }
        };

        updateToRealTime();
        window.addEventListener('focus', updateToRealTime);
        return () => window.removeEventListener('focus', updateToRealTime);
    }, []);

    // Events State
    const [events, setEvents] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_calendar_events`);
        return saved ? JSON.parse(saved) : [];
    });

    // Todos State (separate from events)
    const [todos, setTodos] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_calendar_todos`);
        return saved ? JSON.parse(saved) : [];
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [newEvent, setNewEvent] = useState({ title: '', type: 'task', date: getLocalDateStr(), untilDate: '', reminderTime: '' });
    const [newTodo, setNewTodo] = useState({ title: '', date: getLocalDateStr(), untilDate: '', completed: false, reminderTime: '' });

    // Persist events
    useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_calendar_events`, JSON.stringify(events));
        }
    }, [events, user]);

    // Persist todos
    useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_calendar_todos`, JSON.stringify(todos));
        }
    }, [todos, user]);

    // Notifications are now handled via native OS scheduling

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    // Event Functions
    const openAddEventModal = () => {
        setIsEditMode(false);
        setNewEvent({ title: '', type: 'task', date: selectedDate, untilDate: '', reminderTime: '' });
        setIsModalOpen(true);
    };

    const openEditEventModal = (event) => {
        setIsEditMode(true);
        setSelectedEvent(event);
        setNewEvent({ title: event.title, type: event.type, date: event.date, untilDate: event.untilDate || '', reminderTime: event.reminderTime || '' });
        setIsModalOpen(true);
    };

    const handleAddEvent = async () => {
        if (!newEvent.title) return;

        // Request notification permission if reminder is set
        if (newEvent.reminderTime) {
            await requestNotificationPermission();
        }

        let eventId = isEditMode && selectedEvent ? selectedEvent.id : Date.now();
        const updatedEvent = { ...newEvent, id: eventId, reminderSent: false };

        // Schedule native notification if reminder time is set
        if (newEvent.reminderTime) {
            const scheduledTime = new Date(`${newEvent.date}T${newEvent.reminderTime}`);
            if (scheduledTime > new Date()) {
                await scheduleNotification(
                    `📅 ${newEvent.title}`,
                    `Event starting soon!`,
                    scheduledTime,
                    { id: eventId, extra: { type: 'event', id: eventId } }
                );
            }
        } else if (isEditMode) {
            // Cancel existing notification if reminder was removed
            await cancelNotification(eventId);
        }

        if (isEditMode && selectedEvent) {
            setEvents(events.map(e => e.id === eventId ? updatedEvent : e));
        } else {
            setEvents([...events, updatedEvent]);
        }

        setIsModalOpen(false);
        setNewEvent({ title: '', type: 'task', date: selectedDate, untilDate: '', reminderTime: '' });
    };

    const deleteEvent = async (eventId) => {
        if (window.confirm('Delete this event?')) {
            await cancelNotification(eventId);
            setEvents(events.filter(e => e.id !== eventId));
        }
    };

    // Todo Functions
    const openAddTodoModal = () => {
        setSelectedTodo(null);
        setNewTodo({ title: '', date: selectedDate, untilDate: '', completed: false, reminderTime: '' });
        setIsTodoModalOpen(true);
    };

    const openEditTodoModal = (todo) => {
        setSelectedTodo(todo);
        setNewTodo({ title: todo.title, date: todo.date, untilDate: todo.untilDate || '', completed: todo.completed, reminderTime: todo.reminderTime || '' });
        setIsTodoModalOpen(true);
    };

    const handleAddTodo = async () => {
        if (!newTodo.title) return;

        // Request notification permission if reminder is set
        if (newTodo.reminderTime) {
            await requestNotificationPermission();
        }

        let todoId = selectedTodo ? selectedTodo.id : Date.now();
        const updatedTodo = { ...newTodo, id: todoId, reminderSent: false };

        // Schedule native notification if reminder time is set and not completed
        if (newTodo.reminderTime && !newTodo.completed) {
            const scheduledTime = new Date(`${newTodo.date}T${newTodo.reminderTime}`);
            if (scheduledTime > new Date()) {
                await scheduleNotification(
                    `📌 ${newTodo.title}`,
                    `Task reminder`,
                    scheduledTime,
                    { id: todoId, extra: { type: 'todo', id: todoId } }
                );
            }
        } else if (selectedTodo) {
            // Cancel existing notification if reminder was removed or marked complete
            await cancelNotification(todoId);
        }

        if (selectedTodo) {
            setTodos(todos.map(t => t.id === todoId ? updatedTodo : t));
        } else {
            setTodos([...todos, updatedTodo]);
        }

        setIsTodoModalOpen(false);
        setNewTodo({ title: '', date: selectedDate, untilDate: '', completed: false, reminderTime: '' });
    };

    const toggleTodoComplete = async (todoId) => {
        setTodos(todos.map(t => {
            if (t.id === todoId) {
                const newState = !t.completed;
                if (newState) {
                    cancelNotification(todoId);
                } else if (t.reminderTime) {
                    // Re-schedule if uncompleted and has reminder
                    const scheduledTime = new Date(`${t.date}T${t.reminderTime}`);
                    if (scheduledTime > new Date()) {
                        scheduleNotification(`📌 ${t.title}`, `Task reminder`, scheduledTime, { id: t.id });
                    }
                }
                return { ...t, completed: newState };
            }
            return t;
        }));
    };

    const deleteTodo = async (todoId) => {
        if (window.confirm('Delete this todo?')) {
            await cancelNotification(todoId);
            setTodos(todos.filter(t => t.id !== todoId));
        }
    };

    const getEventsForDate = (dateStr) => {
        return events.filter(e => {
            if (e.untilDate) {
                return dateStr >= e.date && dateStr <= e.untilDate;
            }
            return e.date === dateStr;
        });
    };

    const getTodosForDate = (dateStr) => {
        return todos.filter(t => {
            if (t.untilDate) {
                return dateStr >= t.date && dateStr <= t.untilDate;
            }
            return t.date === dateStr;
        });
    };

    const renderCalendarDays = () => {
        const days = [];
        // Always get fresh "today" for rendering
        const today = getLocalDateStr();

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ padding: '2px' }}></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = getEventsForDate(dateStr);
            const dayTodos = getTodosForDate(dateStr);
            const isToday = dateStr === today;

            const isSelected = dateStr === selectedDate;

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    style={{
                        padding: '2px', // Reduced padding for mobile
                        minHeight: '60px', // Slightly compacted
                        border: isSelected ? '2px solid var(--primary)' : '1px solid #333',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'rgba(var(--primary-rgb), 0.1)' : (isToday ? 'rgba(255, 215, 0, 0.1)' : '#1a1a1a'),
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        overflow: 'hidden' // Ensure content doesn't spill
                    }}
                >
                    <div style={{
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isToday ? 'var(--primary)' : '#fff',
                        marginBottom: '4px',
                        fontSize: '12px'
                    }}>
                        {day}
                    </div>

                    {/* Events */}
                    {dayEvents.slice(0, 2).map(event => (
                        <div key={event.id} style={{
                            fontSize: '9px',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            backgroundColor: event.type === 'deadline' ? '#ff4444' : '#007BFF',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {event.title}
                        </div>
                    ))}

                    {/* Todos indicator */}
                    {dayTodos.length > 0 && (
                        <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>
                            ✓ {dayTodos.filter(t => t.completed).length}/{dayTodos.length}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    // Get today's and upcoming items - ALWAYS derive from fresh Date()
    const today = getLocalDateStr();
    const todayEvents = getEventsForDate(today);
    const todayTodos = getTodosForDate(today);
    const upcomingTodos = todos.filter(t => t.date >= today && !t.completed).slice(0, 5);
    // Sort events by date
    const upcomingEvents = events
        .filter(e => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    return (
        <div className="page-container animate-fade-in" style={{ paddingBottom: '120px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="title" style={{ margin: 0 }}>Calendar & Tasks</h1>
            </div>

            {/* Calendar Navigation */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <button onClick={prevMonth} className="btn-secondary" style={{ padding: '8px' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={nextMonth} className="btn-secondary" style={{ padding: '8px' }}>
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '15px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', color: '#888', padding: '4px' }}>
                            {day}
                        </div>
                    ))}
                    {renderCalendarDays()}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={openAddEventModal} className="btn-primary" style={{ flex: 1, fontSize: '13px' }}>
                        <PlusCircle size={14} /> Add Event
                    </button>
                    <button onClick={openAddTodoModal} className="btn-secondary" style={{ flex: 1, fontSize: '13px' }}>
                        <PlusCircle size={14} /> Add Todo
                    </button>
                </div>
            </div>

            {/* Today's Items */}
            {(todayEvents.length > 0 || todayTodos.length > 0) && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3 className="subtitle">Today's Schedule</h3>

                    {todayEvents.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Events:</div>
                            {todayEvents.map(event => (
                                <div key={event.id} style={{
                                    padding: '10px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '6px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '14px' }}>{event.title}</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => openEditEventModal(event)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', padding: '4px', cursor: 'pointer' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => deleteEvent(event.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '4px', cursor: 'pointer' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {todayTodos.length > 0 && (
                        <div>
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Tasks:</div>
                            {todayTodos.map(todo => (
                                <div key={todo.id} style={{
                                    padding: '10px',
                                    backgroundColor: todo.completed ? 'rgba(0, 200, 81, 0.1)' : 'rgba(255,255,255,0.05)',
                                    borderRadius: '6px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <button
                                            onClick={() => toggleTodoComplete(todo.id)}
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: todo.completed ? 'var(--success)' : '#666' }}
                                        >
                                            {todo.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                                        </button>
                                        <span style={{ fontSize: '14px', textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.6 : 1 }}>
                                            {todo.title}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => openEditTodoModal(todo)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', padding: '4px', cursor: 'pointer' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '4px', cursor: 'pointer' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}


            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3 className="subtitle">Upcoming Events</h3>
                    {upcomingEvents.map(event => (
                        <div key={event.id} style={{
                            padding: '10px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{event.title}</div>
                                <div style={{ fontSize: '11px', color: '#ccc', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{
                                        padding: '2px 6px',
                                        borderRadius: '3px',
                                        backgroundColor: event.type === 'deadline' ? '#ff4444' : (event.type === 'meeting' ? '#ffbb33' : '#007BFF'),
                                        color: 'black',
                                        fontSize: '9px',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}>
                                        {event.type}
                                    </span>
                                    {event.date}{event.untilDate ? ` - ${event.untilDate}` : ''}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => openEditEventModal(event)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', padding: '4px', cursor: 'pointer' }}>
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => deleteEvent(event.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '4px', cursor: 'pointer' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upcoming Todos */}
            {upcomingTodos.length > 0 && (
                <div className="card">
                    <h3 className="subtitle">Upcoming Tasks</h3>
                    {upcomingTodos.map(todo => (
                        <div key={todo.id} style={{
                            padding: '10px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px' }}>{todo.title}</div>
                                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                                    {todo.date}{todo.untilDate ? ` - ${todo.untilDate}` : ''}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => toggleTodoComplete(todo.id)}
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#666' }}
                                >
                                    <Circle size={18} />
                                </button>
                                <button onClick={() => openEditTodoModal(todo)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', padding: '4px', cursor: 'pointer' }}>
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '4px', cursor: 'pointer' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Event Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '85%', maxWidth: '350px', position: 'relative' }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', color: '#888' }}>
                            <X size={20} />
                        </button>
                        <h3 className="subtitle" style={{ marginBottom: '20px' }}>{isEditMode ? 'Edit Event' : 'New Event'}</h3>

                        <input
                            className="input-field"
                            placeholder="Event title"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            style={{ marginBottom: '10px' }}
                        />

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block' }}>Start Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block' }}>Until Date (Optional)</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={newEvent.untilDate}
                                    min={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, untilDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <select
                            className="input-field"
                            value={newEvent.type}
                            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                            style={{ marginBottom: '10px' }}
                        >
                            <option value="task">Task</option>
                            <option value="deadline">Deadline</option>
                            <option value="meeting">Meeting</option>
                        </select>

                        {/* Reminder Time */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                                <Bell size={14} /> Reminder at:
                            </label>
                            <input
                                type="time"
                                className="input-field"
                                value={newEvent.reminderTime}
                                onChange={(e) => setNewEvent({ ...newEvent, reminderTime: e.target.value })}
                                placeholder="Set reminder time"
                            />
                            {newEvent.reminderTime && (
                                <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px' }}>
                                    🔔 Reminder set for {newEvent.reminderTime}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddEvent}>
                                {isEditMode ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Todo Modal */}
            {isTodoModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '85%', maxWidth: '350px', position: 'relative' }}>
                        <button onClick={() => setIsTodoModalOpen(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', color: '#888' }}>
                            <X size={20} />
                        </button>
                        <h3 className="subtitle" style={{ marginBottom: '20px' }}>{selectedTodo ? 'Edit Task' : 'New Task'}</h3>

                        <input
                            className="input-field"
                            placeholder="Task title"
                            value={newTodo.title}
                            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                            style={{ marginBottom: '10px' }}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                        />

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block' }}>Start Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={newTodo.date}
                                    onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block' }}>Until Date (Optional)</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={newTodo.untilDate}
                                    min={newTodo.date}
                                    onChange={(e) => setNewTodo({ ...newTodo, untilDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Reminder Time */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                                <Bell size={14} /> Reminder at:
                            </label>
                            <input
                                type="time"
                                className="input-field"
                                value={newTodo.reminderTime}
                                onChange={(e) => setNewTodo({ ...newTodo, reminderTime: e.target.value })}
                                placeholder="Set reminder time"
                            />
                            {newTodo.reminderTime && (
                                <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px' }}>
                                    🔔 Reminder set for {newTodo.reminderTime}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsTodoModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddTodo}>
                                {selectedTodo ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
