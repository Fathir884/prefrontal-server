import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Book, RotateCcw, CheckCircle, ChevronRight, Edit3, Play, Pause, RotateCw, Clock, Settings, PlusCircle, X, Trash2, Edit2, TrendingUp, Award, Target, FileText, Plus, History, Bell, Sparkles, Brain, Wand2, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendPomodoroNotification, requestNotificationPermission } from '../utils/notifications';
import FocusSounds from '../components/FocusSounds';
import { summarizeNote, generateAIFlashcards } from '../utils/aiTemplates';

const LearningPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tasks'); // tasks | flashcards | notes | stats
    const [activeCard, setActiveCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Tasks State
    const [tasks, setTasks] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_learning_tasks`);
        return saved ? JSON.parse(saved) : [];
    });
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Notes State - Now multiple notes
    const [notes, setNotes] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_learning_notes_list`);
        return saved ? JSON.parse(saved) : [];
    });
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');

    // Custom Flashcards State
    const [flashcards, setFlashcards] = useState(() => {
        if (!user) return [
            { id: 1, front: 'Cognitive Dissonance', back: 'Mental discomfort experienced by a person who holds two or more contradictory beliefs, ideas, or values.' },
            { id: 2, front: 'Pomodoro Technique', back: 'A time management method using a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks.' },
            { id: 3, front: 'Compound Interest', back: 'Interest calculated on the initial principal, which also includes all of the accumulated interest.' }
        ];
        const saved = localStorage.getItem(`${user.username}_learning_flashcards`);
        return saved ? JSON.parse(saved) : [
            { id: 1, front: 'Cognitive Dissonance', back: 'Mental discomfort experienced by a person who holds two or more contradictory beliefs, ideas, or values.' },
            { id: 2, front: 'Pomodoro Technique', back: 'A time management method using a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks.' },
            { id: 3, front: 'Compound Interest', back: 'Interest calculated on the initial principal, which also includes all of the accumulated interest.' }
        ];
    });
    const [showFlashcardModal, setShowFlashcardModal] = useState(false);
    const [editingFlashcard, setEditingFlashcard] = useState(null);
    const [newFlashcardFront, setNewFlashcardFront] = useState('');
    const [newFlashcardBack, setNewFlashcardBack] = useState('');

    // Study Sessions State
    const [studySessions, setStudySessions] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_study_sessions`);
        return saved ? JSON.parse(saved) : [];
    });

    // Completed Tasks History
    const [completedHistory, setCompletedHistory] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_completed_history`);
        return saved ? JSON.parse(saved) : [];
    });

    // Pomodoro Timer State
    const [timerActive, setTimerActive] = useState(false);
    const [timerDuration, setTimerDuration] = useState(25);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [showSettings, setShowSettings] = useState(false);
    const audioRef = useRef(null);

    // AI Processing State
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [aiAction, setAiAction] = useState(null); // 'summarize' | 'flashcards'
    const [aiFeedback, setAiFeedback] = useState('');

    // Auto-calculate progress from tasks
    const progress = tasks.length > 0
        ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
        : 0;

    // Persist all states
    useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_learning_tasks`, JSON.stringify(tasks));
        }
    }, [tasks, user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_learning_notes_list`, JSON.stringify(notes));
        }
    }, [notes, user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_learning_flashcards`, JSON.stringify(flashcards));
        }
    }, [flashcards, user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_study_sessions`, JSON.stringify(studySessions));
        }
    }, [studySessions, user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_completed_history`, JSON.stringify(completedHistory));
        }
    }, [completedHistory, user]);

    // Pomodoro Timer Effect
    // Pomodoro Timer Effect with Wake Lock & Fullscreen
    useEffect(() => {
        let interval = null;
        let wakeLock = null;

        const enableFocusMode = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
                // Optional: Request fullscreen if user preference? Assuming always per request.
                // document.documentElement.requestFullscreen().catch(e => console.log(e));
            } catch (err) {
                console.log('Focus mode error:', err);
            }
        };

        const disableFocusMode = () => {
            if (wakeLock) wakeLock.release();
            if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
        };

        if (timerActive) {
            enableFocusMode();
            if (timeLeft > 0) {
                interval = setInterval(() => {
                    setTimeLeft((time) => time - 1);
                }, 1000);
            } else if (timeLeft === 0) {
                setTimerActive(false);
                disableFocusMode();

                // Record study session
                const newSession = {
                    id: Date.now(),
                    duration: timerDuration,
                    completedAt: new Date().toISOString()
                };
                setStudySessions([newSession, ...studySessions]);

                // Send notification with celebratory sound
                sendPomodoroNotification('work');

                // Reset timer
                setTimeLeft(timerDuration * 60);
            }
        } else {
            disableFocusMode();
        }

        return () => {
            clearInterval(interval);
            disableFocusMode();
        };
    }, [timerActive, timeLeft, timerDuration, studySessions]);

    // Statistics
    const stats = useMemo(() => {
        const totalSessions = studySessions.length;
        const totalMinutes = studySessions.reduce((acc, s) => acc + s.duration, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMins = totalMinutes % 60;

        const completedTasks = tasks.filter(t => t.completed).length;
        const totalTasks = tasks.length;

        // Weekly study time
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekSessions = studySessions.filter(s => new Date(s.completedAt) >= weekAgo);
        const weekMinutes = weekSessions.reduce((acc, s) => acc + s.duration, 0);

        // Today's study time
        const today = new Date().toDateString();
        const todaySessions = studySessions.filter(s => new Date(s.completedAt).toDateString() === today);
        const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);

        return {
            totalSessions,
            totalMinutes,
            totalHours,
            remainingMins,
            completedTasks,
            totalTasks,
            weekMinutes,
            todayMinutes,
            flashcardsCount: flashcards.length,
            notesCount: notes.length
        };
    }, [studySessions, tasks, flashcards, notes]);

    // Task Functions
    const openAddTaskModal = () => {
        setEditingTask(null);
        setNewTaskTitle('');
        setShowTaskModal(true);
    };

    const openEditTaskModal = (task) => {
        setEditingTask(task);
        setNewTaskTitle(task.title);
        setShowTaskModal(true);
    };

    const handleSaveTask = () => {
        if (!newTaskTitle.trim()) return;

        if (editingTask) {
            setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, title: newTaskTitle } : t));
        } else {
            const newTask = {
                id: Date.now(),
                title: newTaskTitle,
                completed: false,
                createdAt: new Date().toISOString()
            };
            setTasks([...tasks, newTask]);
        }

        setNewTaskTitle('');
        setShowTaskModal(false);
        setEditingTask(null);
    };

    const toggleTaskComplete = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            // Add to history when completing
            setCompletedHistory([{
                id: Date.now(),
                title: task.title,
                completedAt: new Date().toISOString()
            }, ...completedHistory]);
        }
        setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (taskId) => {
        if (window.confirm('Delete this task?')) {
            setTasks(tasks.filter(t => t.id !== taskId));
        }
    };

    // Note Functions
    const openAddNoteModal = () => {
        setEditingNote(null);
        setNewNoteTitle('');
        setNewNoteContent('');
        setShowNoteModal(true);
    };

    const openEditNoteModal = (note) => {
        setEditingNote(note);
        setNewNoteTitle(note.title);
        setNewNoteContent(note.content);
        setShowNoteModal(true);
    };

    const handleSaveNote = () => {
        if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

        if (editingNote) {
            setNotes(notes.map(n => n.id === editingNote.id ? {
                ...n,
                title: newNoteTitle,
                content: newNoteContent,
                updatedAt: new Date().toISOString()
            } : n));
        } else {
            const newNote = {
                id: Date.now(),
                title: newNoteTitle || 'Untitled Note',
                content: newNoteContent,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setNotes([newNote, ...notes]);
        }

        setNewNoteTitle('');
        setNewNoteContent('');
        setShowNoteModal(false);
        setEditingNote(null);
    };

    const deleteNote = (noteId) => {
        if (window.confirm('Delete this note?')) {
            setNotes(notes.filter(n => n.id !== noteId));
        }
    };

    // AI Helper Functions
    const handleAISummarize = async () => {
        if (!newNoteContent.trim()) return;
        setIsAIProcessing(true);
        setAiAction('summarize');
        setAiFeedback('prefAI is reading your note...');

        try {
            const summary = await summarizeNote(newNoteContent);
            setNewNoteContent(prev => prev + "\n\n" + summary);
            setAiFeedback('Summary added successfully! ✨');
        } catch (error) {
            setAiFeedback('Error generating summary. Please try again.');
        } finally {
            setTimeout(() => {
                setIsAIProcessing(false);
                setAiAction(null);
            }, 1000);
        }
    };

    const handleAIFlashcards = async () => {
        if (!newNoteContent.trim()) return;
        setIsAIProcessing(true);
        setAiAction('flashcards');
        setAiFeedback('prefAI is extracting key concepts...');

        try {
            const newCards = await generateAIFlashcards(newNoteContent);
            if (newCards.length > 0) {
                const cardsWithIds = newCards.map(c => ({ ...c, id: Date.now() + Math.random() }));
                setFlashcards(prev => [...prev, ...cardsWithIds]);
                setAiFeedback(`Generated ${newCards.length} flashcards! 🃏`);
            } else {
                setAiFeedback('No specific concepts found to make flashcards.');
            }
        } catch (error) {
            setAiFeedback('Error generating flashcards.');
        } finally {
            setTimeout(() => {
                setIsAIProcessing(false);
                setAiAction(null);
            }, 1500);
        }
    };

    // Flashcard Functions
    const openAddFlashcardModal = () => {
        setEditingFlashcard(null);
        setNewFlashcardFront('');
        setNewFlashcardBack('');
        setShowFlashcardModal(true);
    };

    const openEditFlashcardModal = (card) => {
        setEditingFlashcard(card);
        setNewFlashcardFront(card.front);
        setNewFlashcardBack(card.back);
        setShowFlashcardModal(true);
    };

    const handleSaveFlashcard = () => {
        if (!newFlashcardFront.trim() || !newFlashcardBack.trim()) return;

        if (editingFlashcard) {
            setFlashcards(flashcards.map(f => f.id === editingFlashcard.id ? {
                ...f,
                front: newFlashcardFront,
                back: newFlashcardBack
            } : f));
        } else {
            const newCard = {
                id: Date.now(),
                front: newFlashcardFront,
                back: newFlashcardBack
            };
            setFlashcards([...flashcards, newCard]);
        }

        setNewFlashcardFront('');
        setNewFlashcardBack('');
        setShowFlashcardModal(false);
        setEditingFlashcard(null);
    };

    const deleteFlashcard = (cardId) => {
        if (window.confirm('Delete this flashcard?')) {
            const newCards = flashcards.filter(f => f.id !== cardId);
            setFlashcards(newCards);
            if (activeCard >= newCards.length) {
                setActiveCard(Math.max(0, newCards.length - 1));
            }
        }
    };

    // Timer Functions
    const toggleTimer = () => {
        setTimerActive(!timerActive);
    };

    const resetTimer = () => {
        setTimerActive(false);
        setTimeLeft(timerDuration * 60);
    };

    const setDuration = (minutes) => {
        setTimerDuration(minutes);
        setTimeLeft(minutes * 60);
        setTimerActive(false);
        setShowSettings(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleNextCard = () => {
        setIsFlipped(false);
        setActiveCard((prev) => (prev + 1) % flashcards.length);
    };

    const handlePrevCard = () => {
        setIsFlipped(false);
        setActiveCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                <h1 className="title" style={{ margin: 0 }}>Learning Center</h1>
            </div>

            <audio ref={audioRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0PLRfC8GJ3vK8NyTQQoTYbXq7KtYEwpJouHyv3AiBzWM0/PTgjEHKoHN8N6WRAoUY7jr7q1aFApKpOPzwHMiCDeO1PPVgzIHK4PP8d+YRgoVZbjs79BdFQpMpuT0wXYjCDiP1fPXhTMHLITQ8eCaSQoWZ7nt8LJfFgpNp+X1wngjCTmR1vTYhjQHLoXR8uGcSgoXaLru8bRgFwpOqOf1w3okCTqS1/TZhzUIL4bS8+KdTAoYabzv8rZiFwpPqej2xH0lCjuT2PTaijYHL4fT8+OeTgoZa73w87dkGApPqun2xH4lCzyU2fTbjDcHL4jU9OSfTwoZbL7x9LhlGQpQq+r3xX8mCz2V2vXcjTgIMInV9OWhUQoabr/y9bpmGgtRrOv4xoAnCz6W2/XdjzgIMYrW9Oakk9gP87n983+O/HB0ABAAA=" type="audio/wav" />
            </audio>

            {/* Pomodoro Timer */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, #1e1e1e 0%, #252525 100%)',
                textAlign: 'center',
                padding: '25px 20px',
                border: `2px solid ${timerActive ? 'var(--success)' : '#333'}`,
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                    <Clock size={20} style={{ marginRight: '8px', color: timerActive ? 'var(--success)' : 'var(--primary)' }} />
                    <h2 className="subtitle" style={{ margin: 0 }}>Pomodoro Timer</h2>
                </div>

                <div style={{
                    display: 'inline-block',
                    padding: '20px',
                    borderRadius: '50%',
                    border: `4px solid ${timerActive ? 'var(--success)' : 'var(--primary)'}`,
                    marginBottom: '15px',
                    minWidth: '120px',
                    background: `conic-gradient(${timerActive ? 'var(--success)' : 'var(--primary)'} ${((timerDuration * 60 - timeLeft) / (timerDuration * 60)) * 100}%, transparent 0%)`
                }}>
                    <div style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: '50%',
                        padding: '15px',
                        minWidth: '90px'
                    }}>
                        <span style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            color: timerActive ? 'var(--success)' : 'var(--primary)'
                        }}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
                    <button onClick={toggleTimer} className="btn-primary" style={{ width: '100px', padding: '10px' }}>
                        {timerActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
                    </button>
                    <button onClick={resetTimer} className="btn-secondary" style={{ width: '100px', padding: '10px' }}>
                        <RotateCw size={16} /> Reset
                    </button>
                </div>

                <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>
                    {timerActive ? '🔴 Focus mode active' : '⏸️ Ready to start'} | Sessions today: {stats.todayMinutes}min
                </div>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                    <Settings size={14} /> {showSettings ? 'Hide' : 'Duration'}
                </button>

                {showSettings && (
                    <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {[15, 25, 30, 45].map(mins => (
                                <button
                                    key={mins}
                                    onClick={() => setDuration(mins)}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: timerDuration === mins ? '2px solid var(--primary)' : '1px solid #444',
                                        backgroundColor: timerDuration === mins ? 'rgba(255, 215, 0, 0.1)' : '#2a2a2a',
                                        color: timerDuration === mins ? 'var(--primary)' : '#fff',
                                        fontWeight: timerDuration === mins ? 'bold' : 'normal',
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {mins}m
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Focus Sounds */}
            <FocusSounds />

            {/* Progress Card */}
            <div className="card">
                <h2 className="subtitle">
                    <Target size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    My Progress
                </h2>
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '12px' }}>Task Completion</span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: progress >= 100 ? 'var(--success)' : 'var(--primary)',
                            borderRadius: '5px',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                    <span>{tasks.filter(t => t.completed).length} of {tasks.length} tasks completed</span>
                    {progress >= 100 && <span style={{ color: 'var(--success)' }}>🎉 All done!</span>}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', marginBottom: '20px', gap: '8px', flexWrap: 'wrap' }}>
                {[
                    { id: 'tasks', label: '📋 Tasks', icon: Target },
                    { id: 'flashcards', label: '🃏 Cards', icon: Book },
                    { id: 'notes', label: '📝 Notes', icon: FileText },
                    { id: 'stats', label: '📊 Stats', icon: TrendingUp }
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ flex: 1, padding: '10px 8px', fontSize: '12px', minWidth: '70px' }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 className="subtitle" style={{ margin: 0 }}>Learning Tasks</h2>
                        <button onClick={openAddTaskModal} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            <PlusCircle size={14} /> Add
                        </button>
                    </div>

                    {tasks.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', padding: '30px' }}>
                            <Target size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>No tasks yet. Click "Add" to get started!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {tasks.map(task => (
                                <div key={task.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    backgroundColor: task.completed ? 'rgba(0, 200, 81, 0.1)' : 'rgba(255,255,255,0.03)',
                                    borderRadius: '10px',
                                    border: `1px solid ${task.completed ? 'var(--success)' : '#333'}`
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTaskComplete(task.id)}
                                        style={{
                                            width: '22px',
                                            height: '22px',
                                            cursor: 'pointer',
                                            accentColor: 'var(--success)'
                                        }}
                                    />
                                    <div style={{
                                        flex: 1,
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        opacity: task.completed ? 0.6 : 1,
                                        color: task.completed ? 'var(--success)' : '#fff'
                                    }}>
                                        {task.title}
                                    </div>
                                    <button
                                        onClick={() => openEditTaskModal(task)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--secondary)',
                                            padding: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--danger)',
                                            padding: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 className="subtitle" style={{ margin: 0 }}>
                            <FileText size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            My Notes
                        </h2>
                        <button onClick={openAddNoteModal} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            <Plus size={14} /> New Note
                        </button>
                    </div>

                    {notes.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', padding: '30px' }}>
                            <FileText size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>No notes yet. Create your first note!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {notes.map(note => (
                                <div key={note.id} style={{
                                    padding: '15px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderRadius: '10px',
                                    border: '1px solid #333'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--primary)' }}>{note.title}</h4>
                                            <span style={{ fontSize: '10px', color: '#666' }}>{formatDate(note.updatedAt)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => openEditNoteModal(note)}
                                                style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteNote(note.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: '#aaa',
                                        whiteSpace: 'pre-wrap',
                                        maxHeight: '80px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {note.content || 'No content...'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Flashcards Tab */}
            {activeTab === 'flashcards' && (
                <div className="card" style={{ minHeight: '350px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 className="subtitle" style={{ margin: 0 }}>Flashcards</h2>
                        <button onClick={openAddFlashcardModal} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            <Plus size={14} /> Add Card
                        </button>
                    </div>

                    {flashcards.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                            <Book size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>No flashcards yet. Create your first card!</p>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                perspective: '1000px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '220px'
                            }}>
                                <div
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '180px',
                                        textAlign: 'center',
                                        transition: 'transform 0.6s',
                                        transformStyle: 'preserve-3d',
                                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {/* Front */}
                                    <div style={{
                                        position: 'absolute', width: '100%', height: '100%',
                                        backfaceVisibility: 'hidden',
                                        backgroundColor: '#252525',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '16px', border: '2px solid var(--secondary)',
                                        flexDirection: 'column', padding: '20px', boxSizing: 'border-box'
                                    }}>
                                        <h3 style={{ margin: 0, fontSize: '18px' }}>{flashcards[activeCard]?.front}</h3>
                                        <p style={{ fontSize: '11px', color: '#888', marginTop: '15px' }}>(Tap to flip)</p>
                                    </div>
                                    {/* Back */}
                                    <div style={{
                                        position: 'absolute', width: '100%', height: '100%',
                                        backfaceVisibility: 'hidden',
                                        backgroundColor: 'var(--secondary)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '16px',
                                        transform: 'rotateY(180deg)',
                                        padding: '20px', boxSizing: 'border-box'
                                    }}>
                                        <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{flashcards[activeCard]?.back}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '12px', color: '#888' }}>
                                Card {activeCard + 1} of {flashcards.length}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button className="btn-secondary" onClick={handlePrevCard} style={{ padding: '10px 20px' }}>
                                    <RotateCcw size={16} /> Prev
                                </button>
                                <button
                                    onClick={() => openEditFlashcardModal(flashcards[activeCard])}
                                    className="btn-secondary"
                                    style={{ padding: '10px' }}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteFlashcard(flashcards[activeCard]?.id)}
                                    className="btn-secondary"
                                    style={{ padding: '10px', color: 'var(--danger)' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button className="btn-primary" onClick={handleNextCard} style={{ padding: '10px 20px' }}>
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <>
                    <div className="card">
                        <h2 className="subtitle">
                            <Award size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Learning Statistics
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                            <div style={{
                                backgroundColor: 'rgba(255,215,0,0.1)',
                                padding: '15px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    {stats.totalHours}h {stats.remainingMins}m
                                </div>
                                <div style={{ fontSize: '11px', color: '#888' }}>Total Study Time</div>
                            </div>
                            <div style={{
                                backgroundColor: 'rgba(0,123,255,0.1)',
                                padding: '15px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary)' }}>
                                    {stats.totalSessions}
                                </div>
                                <div style={{ fontSize: '11px', color: '#888' }}>Pomodoro Sessions</div>
                            </div>
                            <div style={{
                                backgroundColor: 'rgba(0,200,81,0.1)',
                                padding: '15px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>
                                    {stats.completedTasks}
                                </div>
                                <div style={{ fontSize: '11px', color: '#888' }}>Tasks Completed</div>
                            </div>
                            <div style={{
                                backgroundColor: 'rgba(255,165,0,0.1)',
                                padding: '15px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFA500' }}>
                                    {stats.weekMinutes}m
                                </div>
                                <div style={{ fontSize: '11px', color: '#888' }}>This Week</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.flashcardsCount}</div>
                                <div style={{ fontSize: '10px', color: '#888' }}>Flashcards</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.notesCount}</div>
                                <div style={{ fontSize: '10px', color: '#888' }}>Notes</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.totalTasks}</div>
                                <div style={{ fontSize: '10px', color: '#888' }}>Total Tasks</div>
                            </div>
                        </div>
                    </div>

                    {/* Study Session History */}
                    <div className="card">
                        <h2 className="subtitle">
                            <History size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Recent Study Sessions
                        </h2>
                        {studySessions.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                                No study sessions yet. Start a Pomodoro timer!
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {studySessions.slice(0, 10).map(session => (
                                    <div key={session.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Clock size={14} color="var(--primary)" />
                                            <span style={{ fontSize: '13px' }}>{session.duration} minutes</span>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#888' }}>{formatDate(session.completedAt)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed Tasks History */}
                    {completedHistory.length > 0 && (
                        <div className="card">
                            <h2 className="subtitle">
                                <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Recently Completed
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {completedHistory.slice(0, 5).map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        backgroundColor: 'rgba(0,200,81,0.05)',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <CheckCircle size={14} color="var(--success)" />
                                            <span style={{ fontSize: '13px' }}>{item.title}</span>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#888' }}>{formatDate(item.completedAt)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '350px', position: 'relative' }}>
                        <button
                            onClick={() => { setShowTaskModal(false); setEditingTask(null); }}
                            style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <h3 className="subtitle" style={{ marginBottom: '20px' }}>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>

                        <input
                            className="input-field"
                            placeholder="Task title (e.g., Complete React Tutorial)"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveTask()}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveTask}>{editingTask ? 'Save' : 'Add'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Note Modal */}
            {showNoteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
                        <button
                            onClick={() => { setShowNoteModal(false); setEditingNote(null); }}
                            style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <h3 className="subtitle" style={{ marginBottom: '20px' }}>{editingNote ? 'Edit Note' : 'New Note'}</h3>

                        <input
                            className="input-field"
                            placeholder="Note title"
                            value={newNoteTitle}
                            onChange={e => setNewNoteTitle(e.target.value)}
                            style={{ marginBottom: '10px' }}
                            autoFocus
                        />

                        <textarea
                            className="input-field"
                            placeholder="Write your note here..."
                            value={newNoteContent}
                            onChange={e => setNewNoteContent(e.target.value)}
                            rows={6}
                            style={{ resize: 'none', marginBottom: '15px' }}
                        />

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                            <button
                                onClick={handleAISummarize}
                                disabled={isAIProcessing || !newNoteContent.trim()}
                                className="btn-secondary"
                                style={{ flex: 1, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: isAIProcessing ? 0.6 : 1 }}
                            >
                                <Sparkles size={12} color="#A855F7" /> Summarize
                            </button>
                            <button
                                onClick={handleAIFlashcards}
                                disabled={isAIProcessing || !newNoteContent.trim()}
                                className="btn-secondary"
                                style={{ flex: 1, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: isAIProcessing ? 0.6 : 1 }}
                            >
                                <Brain size={12} color="#EC4899" /> Cards
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowNoteModal(false); setEditingNote(null); }}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveNote}>{editingNote ? 'Save' : 'Create'}</button>
                        </div>

                        {/* AI Processing Overlay inside Modal */}
                        {isAIProcessing && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(15, 15, 26, 0.95)',
                                borderRadius: '16px', zIndex: 10,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                textAlign: 'center', padding: '20px'
                            }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '15px', animation: 'pulse 2s infinite'
                                }}>
                                    {aiAction === 'summarize' ? <Sparkles size={30} color="#fff" /> : <Brain size={30} color="#fff" />}
                                </div>
                                <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>prefAI is working...</h4>
                                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{aiFeedback}</p>
                                <Loader2 size={24} color="var(--primary)" style={{ marginTop: '20px', animation: 'spin 1.5s linear infinite' }} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Flashcard Modal */}
            {showFlashcardModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
                        <button
                            onClick={() => { setShowFlashcardModal(false); setEditingFlashcard(null); }}
                            style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <h3 className="subtitle" style={{ marginBottom: '20px' }}>{editingFlashcard ? 'Edit Flashcard' : 'New Flashcard'}</h3>

                        <input
                            className="input-field"
                            placeholder="Front side (question/term)"
                            value={newFlashcardFront}
                            onChange={e => setNewFlashcardFront(e.target.value)}
                            style={{ marginBottom: '10px' }}
                            autoFocus
                        />

                        <textarea
                            className="input-field"
                            placeholder="Back side (answer/definition)"
                            value={newFlashcardBack}
                            onChange={e => setNewFlashcardBack(e.target.value)}
                            rows={4}
                            style={{ resize: 'none', marginBottom: '15px' }}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowFlashcardModal(false); setEditingFlashcard(null); }}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveFlashcard}>{editingFlashcard ? 'Save' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearningPage;
