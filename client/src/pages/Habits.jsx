import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Plus, Check, Flame, Target, Trophy,
    Calendar, Trash2, Edit2, X, Sparkles, TrendingUp,
    Droplets, Dumbbell, BookOpen, Moon, Apple, Heart,
    Coffee, Smile, Zap, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Habits = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [habits, setHabits] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [activeTab, setActiveTab] = useState('today');

    // Form state
    const [habitName, setHabitName] = useState('');
    const [habitIcon, setHabitIcon] = useState('Droplets');
    const [habitColor, setHabitColor] = useState('#00D4FF');
    const [habitFrequency, setHabitFrequency] = useState('daily');

    const iconOptions = [
        { name: 'Droplets', icon: Droplets, label: 'Water' },
        { name: 'Dumbbell', icon: Dumbbell, label: 'Exercise' },
        { name: 'BookOpen', icon: BookOpen, label: 'Reading' },
        { name: 'Moon', icon: Moon, label: 'Sleep' },
        { name: 'Apple', icon: Apple, label: 'Healthy Eating' },
        { name: 'Heart', icon: Heart, label: 'Self-care' },
        { name: 'Coffee', icon: Coffee, label: 'No Coffee' },
        { name: 'Smile', icon: Smile, label: 'Gratitude' },
        { name: 'Zap', icon: Zap, label: 'Productivity' },
        { name: 'Star', icon: Star, label: 'Custom' },
    ];

    const colorOptions = [
        '#00D4FF', '#A855F7', '#14B8A6', '#F97316',
        '#EC4899', '#FFD700', '#00D26A', '#FF4757'
    ];

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`${user.username}_habits`);
            if (saved) setHabits(JSON.parse(saved));
        }
    }, [user]);

    useEffect(() => {
        if (user && habits.length > 0) {
            localStorage.setItem(`${user.username}_habits`, JSON.stringify(habits));
        }
    }, [habits, user]);

    const today = new Date().toISOString().split('T')[0];

    const getIconComponent = (iconName) => {
        const found = iconOptions.find(i => i.name === iconName);
        return found ? found.icon : Star;
    };

    const isHabitCompletedToday = (habit) => {
        return habit.completedDates?.includes(today);
    };

    const getStreak = (habit) => {
        if (!habit.completedDates || habit.completedDates.length === 0) return 0;

        const sortedDates = [...habit.completedDates].sort().reverse();
        let streak = 0;
        let currentDate = new Date();

        // Check if completed today
        const todayStr = currentDate.toISOString().split('T')[0];
        if (!sortedDates.includes(todayStr)) {
            // Check if completed yesterday
            currentDate.setDate(currentDate.getDate() - 1);
        }

        for (let i = 0; i < 365; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (sortedDates.includes(dateStr)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    };

    const getLongestStreak = (habit) => {
        if (!habit.completedDates || habit.completedDates.length === 0) return 0;

        const sortedDates = [...habit.completedDates].sort();
        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    };

    const getCompletionRate = (habit) => {
        if (!habit.completedDates || habit.completedDates.length === 0) return 0;

        const createdDate = new Date(habit.createdAt);
        const today = new Date();
        const daysSinceCreation = Math.max(1, Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24)));

        return Math.min(100, Math.round((habit.completedDates.length / daysSinceCreation) * 100));
    };

    const toggleHabitCompletion = (habitId) => {
        setHabits(habits.map(habit => {
            if (habit.id === habitId) {
                const completedDates = habit.completedDates || [];
                if (completedDates.includes(today)) {
                    return { ...habit, completedDates: completedDates.filter(d => d !== today) };
                } else {
                    return { ...habit, completedDates: [...completedDates, today] };
                }
            }
            return habit;
        }));
    };

    const addHabit = () => {
        if (!habitName.trim()) return;

        const newHabit = {
            id: Date.now().toString(),
            name: habitName,
            icon: habitIcon,
            color: habitColor,
            frequency: habitFrequency,
            completedDates: [],
            createdAt: new Date().toISOString()
        };

        setHabits([...habits, newHabit]);
        resetForm();
    };

    const updateHabit = () => {
        if (!habitName.trim() || !editingHabit) return;

        setHabits(habits.map(h =>
            h.id === editingHabit.id
                ? { ...h, name: habitName, icon: habitIcon, color: habitColor, frequency: habitFrequency }
                : h
        ));
        resetForm();
    };

    const deleteHabit = (habitId) => {
        setHabits(habits.filter(h => h.id !== habitId));
    };

    const resetForm = () => {
        setHabitName('');
        setHabitIcon('Droplets');
        setHabitColor('#00D4FF');
        setHabitFrequency('daily');
        setShowAddModal(false);
        setEditingHabit(null);
    };

    const openEditModal = (habit) => {
        setEditingHabit(habit);
        setHabitName(habit.name);
        setHabitIcon(habit.icon);
        setHabitColor(habit.color);
        setHabitFrequency(habit.frequency);
        setShowAddModal(true);
    };

    const getTodayProgress = () => {
        if (habits.length === 0) return 0;
        const completed = habits.filter(h => isHabitCompletedToday(h)).length;
        return Math.round((completed / habits.length) * 100);
    };

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                date: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('en', { weekday: 'short' }),
                dayNum: date.getDate()
            });
        }
        return days;
    };

    const completedToday = habits.filter(h => isHabitCompletedToday(h)).length;
    const totalHabits = habits.length;

    return (
        <div className="page-container animate-fade-in" style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
                paddingTop: '10px'
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={20} color="#fff" />
                </button>
                <div>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        margin: 0,
                        background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Habit Tracker
                    </h1>
                    <p style={{ fontSize: '13px', color: '#606070', margin: 0 }}>
                        Build better habits every day
                    </p>
                </div>
            </div>

            {/* Today's Progress Card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid rgba(236, 72, 153, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Flame size={20} color="#EC4899" />
                            <span style={{ fontSize: '14px', color: '#A0A0B0' }}>Today's Progress</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff' }}>
                            {completedToday}/{totalHabits}
                        </div>
                        <div style={{ fontSize: '13px', color: '#606070' }}>
                            habits completed
                        </div>
                    </div>

                    {/* Circular Progress */}
                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                            <circle
                                cx="40"
                                cy="40"
                                r="35"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="6"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r="35"
                                fill="none"
                                stroke="url(#progressGradient)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${getTodayProgress() * 2.2} 220`}
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#EC4899" />
                                    <stop offset="100%" stopColor="#A855F7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#fff'
                        }}>
                            {getTodayProgress()}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '4px'
            }}>
                {[
                    { id: 'today', label: 'Today' },
                    { id: 'week', label: 'This Week' },
                    { id: 'stats', label: 'Stats' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === tab.id
                                ? 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)'
                                : 'transparent',
                            color: activeTab === tab.id ? '#fff' : '#606070',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Today Tab */}
            {activeTab === 'today' && (
                <div>
                    {habits.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '20px',
                            border: '1px dashed rgba(255, 255, 255, 0.1)'
                        }}>
                            <Sparkles size={48} color="#606070" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: '#A0A0B0', margin: '0 0 8px 0' }}>No habits yet</h3>
                            <p style={{ color: '#606070', fontSize: '14px' }}>
                                Start building better habits today!
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {habits.map(habit => {
                                const Icon = getIconComponent(habit.icon);
                                const completed = isHabitCompletedToday(habit);
                                const streak = getStreak(habit);

                                return (
                                    <div
                                        key={habit.id}
                                        style={{
                                            background: completed
                                                ? `linear-gradient(135deg, ${habit.color}20 0%, ${habit.color}10 100%)`
                                                : 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '16px',
                                            padding: '16px',
                                            border: `1px solid ${completed ? habit.color + '40' : 'rgba(255, 255, 255, 0.06)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleHabitCompletion(habit.id)}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '14px',
                                                border: `2px solid ${completed ? habit.color : 'rgba(255, 255, 255, 0.2)'}`,
                                                background: completed ? habit.color : 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                flexShrink: 0
                                            }}
                                        >
                                            {completed ? (
                                                <Check size={24} color="#fff" />
                                            ) : (
                                                <Icon size={22} color={habit.color} />
                                            )}
                                        </button>

                                        {/* Info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: completed ? habit.color : '#fff',
                                                textDecoration: completed ? 'none' : 'none'
                                            }}>
                                                {habit.name}
                                            </div>
                                            {streak > 0 && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    marginTop: '4px'
                                                }}>
                                                    <Flame size={14} color="#F97316" />
                                                    <span style={{ fontSize: '12px', color: '#F97316', fontWeight: '600' }}>
                                                        {streak} day streak!
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={() => openEditModal(habit)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Edit2 size={16} color="#606070" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Week Tab */}
            {activeTab === 'week' && (
                <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '16px',
                        minWidth: '500px' // Force horizontal scroll on small screens
                    }}>
                        {/* Days Header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '120px repeat(7, 1fr)',
                            gap: '8px',
                            marginBottom: '12px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingBottom: '8px',
                            justifyContent: 'start' // Align entire grid to start
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'end',
                                fontSize: '12px',
                                color: '#A0A0B0',
                                paddingLeft: '8px'
                            }}>
                                Habit
                            </div>
                            {getLast7Days().map(day => (
                                <div key={day.date} style={{
                                    textAlign: 'center',
                                    fontSize: '11px',
                                    color: day.date === today ? '#EC4899' : '#606070'
                                }}>
                                    <div style={{ fontWeight: '600' }}>{day.dayName}</div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: day.date === today ? '700' : '500',
                                        color: day.date === today ? '#EC4899' : '#A0A0B0'
                                    }}>
                                        {day.dayNum}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Habits Grid */}
                        {habits.map(habit => {
                            const Icon = getIconComponent(habit.icon);
                            return (
                                <div key={habit.id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '120px repeat(7, 1fr)',
                                    gap: '8px',
                                    alignItems: 'center',
                                    padding: '12px 0', // Increased vertical padding slightly
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    justifyContent: 'start' // Align entire grid to start
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        overflow: 'hidden',
                                        paddingLeft: '8px'
                                    }}>
                                        <div style={{ flexShrink: 0 }}>
                                            <Icon size={16} color={habit.color} />
                                        </div>
                                        <span style={{
                                            fontSize: '13px',
                                            color: '#fff', // White text for better readability
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {habit.name}
                                        </span>
                                    </div>
                                    {getLast7Days().map(day => {
                                        const isCompleted = habit.completedDates?.includes(day.date);
                                        return (
                                            <div key={day.date} style={{ display: 'flex', justifyContent: 'center' }}>
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '8px',
                                                    background: isCompleted ? habit.color : 'rgba(255, 255, 255, 0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {isCompleted && <Check size={14} color="#fff" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {habits.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '16px'
                        }}>
                            <p style={{ color: '#606070' }}>Add habits to see statistics</p>
                        </div>
                    ) : (
                        habits.map(habit => {
                            const Icon = getIconComponent(habit.icon);
                            const streak = getStreak(habit);
                            const longestStreak = getLongestStreak(habit);
                            const completionRate = getCompletionRate(habit);
                            const totalCompleted = habit.completedDates?.length || 0;

                            return (
                                <div
                                    key={habit.id}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.06)'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: `${habit.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Icon size={20} color={habit.color} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                                                {habit.name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#606070' }}>
                                                Since {new Date(habit.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteHabit(habit.id)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: 'rgba(255, 71, 87, 0.1)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Trash2 size={16} color="#FF4757" />
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                        <div style={{
                                            background: 'rgba(249, 115, 22, 0.1)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            textAlign: 'center'
                                        }}>
                                            <Flame size={18} color="#F97316" style={{ marginBottom: '4px' }} />
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#F97316' }}>
                                                {streak}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#606070' }}>Current Streak</div>
                                        </div>

                                        <div style={{
                                            background: 'rgba(168, 85, 247, 0.1)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            textAlign: 'center'
                                        }}>
                                            <Trophy size={18} color="#A855F7" style={{ marginBottom: '4px' }} />
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#A855F7' }}>
                                                {longestStreak}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#606070' }}>Best Streak</div>
                                        </div>

                                        <div style={{
                                            background: 'rgba(20, 184, 166, 0.1)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            textAlign: 'center'
                                        }}>
                                            <TrendingUp size={18} color="#14B8A6" style={{ marginBottom: '4px' }} />
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#14B8A6' }}>
                                                {completionRate}%
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#606070' }}>Completion</div>
                                        </div>

                                        <div style={{
                                            background: 'rgba(0, 212, 255, 0.1)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            textAlign: 'center'
                                        }}>
                                            <Target size={18} color="#00D4FF" style={{ marginBottom: '4px' }} />
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#00D4FF' }}>
                                                {totalCompleted}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#606070' }}>Total Done</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Add Button */}
            <button
                onClick={() => setShowAddModal(true)}
                style={{
                    position: 'fixed',
                    bottom: '160px', // Raised from 100px to avoid overlap
                    right: '20px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(236, 72, 153, 0.4)',
                    zIndex: 100
                }}
            >
                <Plus size={28} color="#fff" />
            </button>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center', // Changed from flex-end to center
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px' // Added padding for touch targets
                }}>
                    <div style={{
                        background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
                        borderRadius: '24px', // Full rounded corners
                        padding: '24px',
                        width: '90%', // Use 90% width on responsive
                        maxWidth: '430px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                                {editingHabit ? 'Edit Habit' : 'New Habit'}
                            </h2>
                            <button
                                onClick={resetForm}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} color="#fff" />
                            </button>
                        </div>

                        {/* Habit Name */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                color: '#A0A0B0',
                                marginBottom: '8px'
                            }}>
                                Habit Name
                            </label>
                            <input
                                type="text"
                                value={habitName}
                                onChange={(e) => setHabitName(e.target.value)}
                                placeholder="e.g., Drink 8 glasses of water"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#fff',
                                    fontSize: '15px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Icon Selection */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                color: '#A0A0B0',
                                marginBottom: '8px'
                            }}>
                                Icon
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: '8px'
                            }}>
                                {iconOptions.map(option => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.name}
                                            onClick={() => setHabitIcon(option.name)}
                                            style={{
                                                width: '100%',
                                                aspectRatio: '1',
                                                borderRadius: '12px',
                                                border: habitIcon === option.name
                                                    ? `2px solid ${habitColor}`
                                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                                background: habitIcon === option.name
                                                    ? `${habitColor}20`
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Icon
                                                size={22}
                                                color={habitIcon === option.name ? habitColor : '#606070'}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                color: '#A0A0B0',
                                marginBottom: '8px'
                            }}>
                                Color
                            </label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {colorOptions.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setHabitColor(color)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            border: habitColor === color
                                                ? '3px solid #fff'
                                                : '2px solid transparent',
                                            background: color,
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease',
                                            transform: habitColor === color ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={editingHabit ? updateHabit : addHabit}
                            disabled={!habitName.trim()}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '14px',
                                border: 'none',
                                background: habitName.trim()
                                    ? 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: habitName.trim() ? 'pointer' : 'not-allowed',
                                opacity: habitName.trim() ? 1 : 0.5
                            }}
                        >
                            {editingHabit ? 'Update Habit' : 'Add Habit'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Habits;
