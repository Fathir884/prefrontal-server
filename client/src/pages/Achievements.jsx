import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Award, Trophy, Star, Flame, Zap, Target, BookOpen, Brain,
    Wallet, Calendar, CheckCircle, Clock, TrendingUp, Heart,
    Crown, Medal, Sparkles, Gift, Lock, ChevronRight
} from 'lucide-react';

// Achievement Definitions
const ACHIEVEMENTS = {
    // Study Achievements
    firstPomodoro: {
        id: 'firstPomodoro',
        name: 'First Focus',
        description: 'Complete your first Pomodoro session',
        icon: Clock,
        color: '#14B8A6',
        category: 'study',
        requirement: 1,
        type: 'pomodoro_sessions'
    },
    pomodoroApprentice: {
        id: 'pomodoroApprentice',
        name: 'Focus Apprentice',
        description: 'Complete 10 Pomodoro sessions',
        icon: Clock,
        color: '#14B8A6',
        category: 'study',
        requirement: 10,
        type: 'pomodoro_sessions'
    },
    pomodoroMaster: {
        id: 'pomodoroMaster',
        name: 'Focus Master',
        description: 'Complete 50 Pomodoro sessions',
        icon: Crown,
        color: '#FFD700',
        category: 'study',
        requirement: 50,
        type: 'pomodoro_sessions'
    },
    studyHour: {
        id: 'studyHour',
        name: 'Hour of Power',
        description: 'Study for 1 hour total',
        icon: BookOpen,
        color: '#14B8A6',
        category: 'study',
        requirement: 60,
        type: 'study_minutes'
    },
    studyMarathon: {
        id: 'studyMarathon',
        name: 'Study Marathon',
        description: 'Study for 10 hours total',
        icon: Trophy,
        color: '#FFD700',
        category: 'study',
        requirement: 600,
        type: 'study_minutes'
    },

    // Task Achievements
    firstTask: {
        id: 'firstTask',
        name: 'Getting Started',
        description: 'Complete your first task',
        icon: CheckCircle,
        color: '#00D4FF',
        category: 'tasks',
        requirement: 1,
        type: 'tasks_completed'
    },
    taskWarrior: {
        id: 'taskWarrior',
        name: 'Task Warrior',
        description: 'Complete 25 tasks',
        icon: Target,
        color: '#00D4FF',
        category: 'tasks',
        requirement: 25,
        type: 'tasks_completed'
    },
    taskLegend: {
        id: 'taskLegend',
        name: 'Task Legend',
        description: 'Complete 100 tasks',
        icon: Medal,
        color: '#FFD700',
        category: 'tasks',
        requirement: 100,
        type: 'tasks_completed'
    },

    // Journal/Psychology Achievements
    firstJournal: {
        id: 'firstJournal',
        name: 'Self Reflection',
        description: 'Write your first journal entry',
        icon: Brain,
        color: '#A855F7',
        category: 'mind',
        requirement: 1,
        type: 'journal_entries'
    },
    journalHabit: {
        id: 'journalHabit',
        name: 'Mindful Writer',
        description: 'Write 10 journal entries',
        icon: Heart,
        color: '#EC4899',
        category: 'mind',
        requirement: 10,
        type: 'journal_entries'
    },
    journalMaster: {
        id: 'journalMaster',
        name: 'Soul Explorer',
        description: 'Write 30 journal entries',
        icon: Sparkles,
        color: '#FFD700',
        category: 'mind',
        requirement: 30,
        type: 'journal_entries'
    },

    // Finance Achievements
    firstTransaction: {
        id: 'firstTransaction',
        name: 'Money Tracker',
        description: 'Record your first transaction',
        icon: Wallet,
        color: '#F97316',
        category: 'finance',
        requirement: 1,
        type: 'transactions'
    },
    savingsStarter: {
        id: 'savingsStarter',
        name: 'Savings Starter',
        description: 'Save Rp 100,000',
        icon: Wallet,
        color: '#00D26A',
        category: 'finance',
        requirement: 100000,
        type: 'savings'
    },
    savingsChampion: {
        id: 'savingsChampion',
        name: 'Savings Champion',
        description: 'Save Rp 1,000,000',
        icon: Trophy,
        color: '#FFD700',
        category: 'finance',
        requirement: 1000000,
        type: 'savings'
    },

    // Calendar Achievements
    firstEvent: {
        id: 'firstEvent',
        name: 'Event Planner',
        description: 'Create your first calendar event',
        icon: Calendar,
        color: '#00D4FF',
        category: 'productivity',
        requirement: 1,
        type: 'events'
    },
    organizedLife: {
        id: 'organizedLife',
        name: 'Organized Life',
        description: 'Create 20 calendar events',
        icon: Calendar,
        color: '#14B8A6',
        category: 'productivity',
        requirement: 20,
        type: 'events'
    },

    // Streak Achievements
    streak3: {
        id: 'streak3',
        name: 'Getting Momentum',
        description: '3-day activity streak',
        icon: Flame,
        color: '#F97316',
        category: 'streak',
        requirement: 3,
        type: 'streak'
    },
    streak7: {
        id: 'streak7',
        name: 'Week Warrior',
        description: '7-day activity streak',
        icon: Flame,
        color: '#EF4444',
        category: 'streak',
        requirement: 7,
        type: 'streak'
    },
    streak30: {
        id: 'streak30',
        name: 'Unstoppable',
        description: '30-day activity streak',
        icon: Crown,
        color: '#FFD700',
        category: 'streak',
        requirement: 30,
        type: 'streak'
    },

    // Special Achievements
    wellRounded: {
        id: 'wellRounded',
        name: 'Well Rounded',
        description: 'Use all 5 main features of the app',
        icon: Star,
        color: '#A855F7',
        category: 'special',
        requirement: 5,
        type: 'features_used'
    },
    earlyBird: {
        id: 'earlyBird',
        name: 'Early Bird',
        description: 'Complete a task before 8 AM',
        icon: Zap,
        color: '#FFD700',
        category: 'special',
        requirement: 1,
        type: 'early_task'
    }
};

const AchievementsPage = () => {
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('all');
    const [showUnlockAnimation, setShowUnlockAnimation] = useState(null);

    // Load activity data and calculate streaks
    const [activityDates, setActivityDates] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_activity_dates`);
        return saved ? JSON.parse(saved) : [];
    });

    // Track today's activity
    useEffect(() => {
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        if (!activityDates.includes(today)) {
            const newDates = [...activityDates, today].slice(-60); // Keep last 60 days
            setActivityDates(newDates);
            localStorage.setItem(`${user.username}_activity_dates`, JSON.stringify(newDates));
        }
    }, [user]);

    // Calculate user stats
    const userStats = useMemo(() => {
        if (!user) return {};

        const studySessions = JSON.parse(localStorage.getItem(`${user.username}_study_sessions`) || '[]');
        const completedHistory = JSON.parse(localStorage.getItem(`${user.username}_completed_history`) || '[]');
        const journals = JSON.parse(localStorage.getItem(`${user.username}_psych_journal_entries`) || '[]');
        const transactions = JSON.parse(localStorage.getItem(`${user.username}_finance_transactions`) || '[]');
        const events = JSON.parse(localStorage.getItem(`${user.username}_calendar_events`) || '[]');
        const todos = JSON.parse(localStorage.getItem(`${user.username}_calendar_todos`) || '[]');

        // Calculate savings (positive balance)
        const balance = transactions.reduce((total, t) =>
            t.type === 'income' ? total + t.amount : total - t.amount, 0);

        // Calculate study minutes
        const studyMinutes = studySessions.reduce((acc, s) => acc + s.duration, 0);

        // Calculate streak
        const sortedDates = [...activityDates].sort().reverse();
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < sortedDates.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            const expectedStr = expectedDate.toISOString().split('T')[0];
            if (sortedDates.includes(expectedStr)) {
                streak++;
            } else {
                break;
            }
        }

        // Features used check
        let featuresUsed = 0;
        if (journals.length > 0) featuresUsed++;
        if (studySessions.length > 0) featuresUsed++;
        if (transactions.length > 0) featuresUsed++;
        if (events.length > 0 || todos.length > 0) featuresUsed++;
        if (completedHistory.length > 0) featuresUsed++;

        // Check for early task completion
        const earlyTask = completedHistory.some(task => {
            const completedHour = new Date(task.completedAt).getHours();
            return completedHour < 8;
        }) ? 1 : 0;

        return {
            pomodoro_sessions: studySessions.length,
            study_minutes: studyMinutes,
            tasks_completed: completedHistory.length,
            journal_entries: journals.length,
            transactions: transactions.length,
            savings: Math.max(0, balance),
            events: events.length + todos.length,
            streak: streak,
            features_used: featuresUsed,
            early_task: earlyTask
        };
    }, [user, activityDates]);

    // Calculate unlocked achievements
    const unlockedAchievements = useMemo(() => {
        const unlocked = {};
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            const currentValue = userStats[achievement.type] || 0;
            unlocked[achievement.id] = currentValue >= achievement.requirement;
        });
        return unlocked;
    }, [userStats]);

    // Calculate total points
    const totalPoints = useMemo(() => {
        return Object.entries(unlockedAchievements)
            .filter(([_, isUnlocked]) => isUnlocked)
            .length * 100;
    }, [unlockedAchievements]);

    // Get user level based on points
    const userLevel = useMemo(() => {
        if (totalPoints >= 2000) return { level: 10, title: 'Legendary', color: '#FFD700' };
        if (totalPoints >= 1500) return { level: 8, title: 'Master', color: '#A855F7' };
        if (totalPoints >= 1000) return { level: 6, title: 'Expert', color: '#00D4FF' };
        if (totalPoints >= 600) return { level: 4, title: 'Advanced', color: '#14B8A6' };
        if (totalPoints >= 300) return { level: 2, title: 'Beginner', color: '#F97316' };
        return { level: 1, title: 'Newbie', color: '#666' };
    }, [totalPoints]);

    const categories = [
        { id: 'all', label: 'All', icon: Award },
        { id: 'streak', label: 'Streaks', icon: Flame },
        { id: 'study', label: 'Study', icon: BookOpen },
        { id: 'tasks', label: 'Tasks', icon: Target },
        { id: 'mind', label: 'Mind', icon: Brain },
        { id: 'finance', label: 'Finance', icon: Wallet },
    ];

    const filteredAchievements = Object.values(ACHIEVEMENTS).filter(
        a => activeCategory === 'all' || a.category === activeCategory
    );

    const getProgress = (achievement) => {
        const current = userStats[achievement.type] || 0;
        return Math.min(100, (current / achievement.requirement) * 100);
    };

    const formatValue = (type, value) => {
        if (type === 'savings') {
            return `Rp ${(value / 1000).toFixed(0)}K`;
        }
        if (type === 'study_minutes') {
            const hours = Math.floor(value / 60);
            const mins = value % 60;
            return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        }
        return value;
    };

    return (
        <div className="page-container animate-fade-in" style={{ paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '24px',
                position: 'relative'
            }}>
                <Sparkles size={20} style={{
                    position: 'absolute',
                    top: '0',
                    right: '20%',
                    color: 'rgba(255, 215, 0, 0.5)',
                    animation: 'float 3s ease-in-out infinite'
                }} />
                <h1 className="title" style={{ marginBottom: '8px' }}>
                    🏆 Achievements
                </h1>
                <p style={{ color: '#888', fontSize: '14px' }}>
                    Complete challenges to earn badges!
                </p>
            </div>

            {/* User Level Card */}
            <div style={{
                background: `linear-gradient(135deg, ${userLevel.color}20 0%, ${userLevel.color}10 100%)`,
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '20px',
                border: `2px solid ${userLevel.color}40`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative glow */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '120px',
                    height: '120px',
                    background: `radial-gradient(circle, ${userLevel.color}30 0%, transparent 70%)`,
                    borderRadius: '50%'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: `linear-gradient(135deg, ${userLevel.color}, ${userLevel.color}80)`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#000',
                        boxShadow: `0 8px 25px ${userLevel.color}50`
                    }}>
                        {userLevel.level}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: userLevel.color }}>
                            {userLevel.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                            {totalPoints} points • {Object.values(unlockedAchievements).filter(Boolean).length}/{Object.keys(ACHIEVEMENTS).length} badges
                        </div>
                        {/* Progress to next level */}
                        <div style={{
                            marginTop: '10px',
                            height: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${(totalPoints % 300) / 3}%`,
                                height: '100%',
                                background: userLevel.color,
                                borderRadius: '3px',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Streak */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '1px solid rgba(249, 115, 22, 0.3)'
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #F97316, #EF4444)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Flame size={28} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#F97316' }}>
                        {userStats.streak || 0} Days
                    </div>
                    <div style={{ fontSize: '13px', color: '#888' }}>
                        Current Activity Streak 🔥
                    </div>
                </div>
                {userStats.streak >= 7 && (
                    <div style={{
                        background: 'rgba(255, 215, 0, 0.2)',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: '#FFD700',
                        fontWeight: '600'
                    }}>
                        🎉 On Fire!
                    </div>
                )}
            </div>

            {/* Category Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                overflowX: 'auto',
                paddingBottom: '8px'
            }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '12px',
                            border: activeCategory === cat.id ? '2px solid var(--primary)' : '1px solid #333',
                            background: activeCategory === cat.id ? 'rgba(255, 215, 0, 0.1)' : '#1a1a1a',
                            color: activeCategory === cat.id ? 'var(--primary)' : '#888',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <cat.icon size={14} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Achievements Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredAchievements.map(achievement => {
                    const isUnlocked = unlockedAchievements[achievement.id];
                    const progress = getProgress(achievement);
                    const currentValue = userStats[achievement.type] || 0;

                    return (
                        <div
                            key={achievement.id}
                            style={{
                                background: isUnlocked
                                    ? `linear-gradient(135deg, ${achievement.color}15 0%, ${achievement.color}08 100%)`
                                    : 'rgba(255,255,255,0.02)',
                                borderRadius: '16px',
                                padding: '16px',
                                border: isUnlocked
                                    ? `2px solid ${achievement.color}50`
                                    : '1px solid #333',
                                opacity: isUnlocked ? 1 : 0.7,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {/* Unlocked glow effect */}
                            {isUnlocked && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-20%',
                                    right: '-10%',
                                    width: '80px',
                                    height: '80px',
                                    background: `radial-gradient(circle, ${achievement.color}20 0%, transparent 70%)`,
                                    borderRadius: '50%'
                                }} />
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
                                {/* Badge Icon */}
                                <div style={{
                                    width: '54px',
                                    height: '54px',
                                    background: isUnlocked
                                        ? `linear-gradient(135deg, ${achievement.color}, ${achievement.color}80)`
                                        : 'rgba(255,255,255,0.05)',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    boxShadow: isUnlocked ? `0 6px 20px ${achievement.color}40` : 'none'
                                }}>
                                    {isUnlocked ? (
                                        <achievement.icon size={26} color="#fff" />
                                    ) : (
                                        <Lock size={22} color="#666" />
                                    )}
                                    {isUnlocked && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-4px',
                                            width: '20px',
                                            height: '20px',
                                            background: '#00D26A',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #0F0F1A'
                                        }}>
                                            <CheckCircle size={12} color="#fff" />
                                        </div>
                                    )}
                                </div>

                                {/* Badge Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: '700',
                                        color: isUnlocked ? achievement.color : '#aaa',
                                        marginBottom: '4px'
                                    }}>
                                        {achievement.name}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#888',
                                        marginBottom: '8px'
                                    }}>
                                        {achievement.description}
                                    </div>

                                    {/* Progress Bar */}
                                    {!isUnlocked && (
                                        <div>
                                            <div style={{
                                                height: '6px',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '3px',
                                                overflow: 'hidden',
                                                marginBottom: '4px'
                                            }}>
                                                <div style={{
                                                    width: `${progress}%`,
                                                    height: '100%',
                                                    background: achievement.color,
                                                    borderRadius: '3px',
                                                    transition: 'width 0.5s ease'
                                                }} />
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#666' }}>
                                                {formatValue(achievement.type, currentValue)} / {formatValue(achievement.type, achievement.requirement)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Points */}
                                <div style={{
                                    background: isUnlocked ? `${achievement.color}20` : 'rgba(255,255,255,0.03)',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: isUnlocked ? achievement.color : '#555'
                                    }}>
                                        100
                                    </div>
                                    <div style={{ fontSize: '9px', color: '#666' }}>pts</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Stats Summary */}
            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <TrendingUp size={18} color="var(--primary)" />
                    Your Progress
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {[
                        { label: 'Pomodoro Sessions', value: userStats.pomodoro_sessions || 0, icon: Clock, color: '#14B8A6' },
                        { label: 'Tasks Completed', value: userStats.tasks_completed || 0, icon: Target, color: '#00D4FF' },
                        { label: 'Journal Entries', value: userStats.journal_entries || 0, icon: Brain, color: '#A855F7' },
                        { label: 'Study Time', value: `${Math.floor((userStats.study_minutes || 0) / 60)}h ${(userStats.study_minutes || 0) % 60}m`, icon: BookOpen, color: '#14B8A6' },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: `rgba(${stat.color === '#14B8A6' ? '20,184,166' : stat.color === '#00D4FF' ? '0,212,255' : '168,85,247'}, 0.1)`,
                            padding: '14px',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <stat.icon size={20} color={stat.color} style={{ marginBottom: '6px' }} />
                            <div style={{ fontSize: '18px', fontWeight: '700', color: stat.color }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '10px', color: '#888' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AchievementsPage;
