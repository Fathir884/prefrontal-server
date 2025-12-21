import React, { useState, useMemo } from 'react';
import { Smile, Meh, Frown, Zap, CloudLightning, Save, Trash2, Edit2, X, ChevronDown, ChevronUp, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PsychologyPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedMood, setSelectedMood] = useState(null);
    const [journal, setJournal] = useState('');
    const [entries, setEntries] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_psych_journal_entries`);
        return saved ? JSON.parse(saved) : [];
    });
    const [affirmation, setAffirmation] = useState("I am capable of achieving great things today.");
    const [showAllEntries, setShowAllEntries] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [editText, setEditText] = useState('');
    const [editMood, setEditMood] = useState(null);
    const [activeTab, setActiveTab] = useState('journal'); // 'journal' or 'insights'

    React.useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_psych_journal_entries`, JSON.stringify(entries));
        }
    }, [entries, user]);

    const moods = [
        { label: 'Happy', icon: Smile, color: '#FFD700', value: 5 },
        { label: 'Energetic', icon: Zap, color: '#FFA500', value: 4 },
        { label: 'Neutral', icon: Meh, color: '#b0b0b0', value: 3 },
        { label: 'Sad', icon: Frown, color: '#007BFF', value: 2 },
        { label: 'Stressed', icon: CloudLightning, color: '#ff4444', value: 1 }
    ];

    const getMoodIcon = (moodLabel) => {
        const mood = moods.find(m => m.label === moodLabel);
        if (!mood) return null;
        const Icon = mood.icon;
        return <Icon color={mood.color} size={16} />;
    };

    const getMoodColor = (moodLabel) => {
        const mood = moods.find(m => m.label === moodLabel);
        return mood ? mood.color : '#888';
    };

    // Mood statistics
    const moodStats = useMemo(() => {
        if (entries.length === 0) return null;

        const moodCounts = {};
        moods.forEach(m => { moodCounts[m.label] = 0; });

        entries.forEach(entry => {
            if (entry.mood && moodCounts.hasOwnProperty(entry.mood)) {
                moodCounts[entry.mood]++;
            }
        });

        const totalMoodEntries = Object.values(moodCounts).reduce((a, b) => a + b, 0);
        const mostCommon = Object.entries(moodCounts).reduce((a, b) => a[1] > b[1] ? a : b);

        // Calculate average mood score
        let totalScore = 0;
        let count = 0;
        entries.forEach(entry => {
            const mood = moods.find(m => m.label === entry.mood);
            if (mood) {
                totalScore += mood.value;
                count++;
            }
        });

        return {
            counts: moodCounts,
            total: totalMoodEntries,
            mostCommon: mostCommon[1] > 0 ? mostCommon[0] : null,
            avgScore: count > 0 ? (totalScore / count).toFixed(1) : 0,
            totalEntries: entries.length
        };
    }, [entries]);

    // Recent 7 days mood trend
    const weeklyTrend = useMemo(() => {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString();
            const dayEntries = entries.filter(e => {
                const entryDate = new Date(e.date).toLocaleDateString();
                return entryDate === dateStr;
            });

            let avgMood = 0;
            if (dayEntries.length > 0) {
                const dayMoods = dayEntries
                    .map(e => moods.find(m => m.label === e.mood)?.value || 0)
                    .filter(v => v > 0);
                avgMood = dayMoods.length > 0 ? dayMoods.reduce((a, b) => a + b, 0) / dayMoods.length : 0;
            }

            last7Days.push({
                day: date.toLocaleDateString('en', { weekday: 'short' }),
                value: avgMood,
                hasEntry: dayEntries.length > 0
            });
        }
        return last7Days;
    }, [entries]);

    const handleSave = () => {
        if (!journal && !selectedMood) return;

        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            mood: selectedMood,
            text: journal
        };

        setEntries([newEntry, ...entries]);
        setJournal('');
        setSelectedMood(null);
    };

    const handleDelete = (entryId) => {
        if (window.confirm('Delete this journal entry?')) {
            setEntries(entries.filter(e => e.id !== entryId));
        }
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setEditText(entry.text);
        setEditMood(entry.mood);
    };

    const handleSaveEdit = () => {
        if (!editingEntry) return;
        setEntries(entries.map(e =>
            e.id === editingEntry.id
                ? { ...e, text: editText, mood: editMood }
                : e
        ));
        setEditingEntry(null);
        setEditText('');
        setEditMood(null);
    };

    const getNewAffirmation = () => {
        const quotes = [
            "Believe you can and you're halfway there.",
            "Your potential is endless.",
            "Focus on the step in front of you, not the whole staircase.",
            "You are stronger than you know.",
            "Every day is a new beginning.",
            "You have the power to create change.",
            "Be kind to yourself today.",
            "Progress, not perfection.",
            "Your mental health matters.",
            "Small steps lead to big changes."
        ];
        setAffirmation(quotes[Math.floor(Math.random() * quotes.length)]);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const displayedEntries = showAllEntries ? entries : entries.slice(0, 3);

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
                <h1 className="title" style={{ margin: 0 }}>Mind & Wellness</h1>
            </div>

            {/* Affirmation Card */}
            <div className="card" style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(0,123,255,0.1) 100%)',
                border: '1px solid rgba(255,215,0,0.2)'
            }}>
                <h2 className="subtitle" style={{ color: 'var(--secondary)', marginBottom: '15px' }}>✨ Daily Affirmation</h2>
                <p style={{
                    fontStyle: 'italic',
                    fontSize: '18px',
                    marginBottom: '20px',
                    lineHeight: '1.5'
                }}>"{affirmation}"</p>
                <button onClick={getNewAffirmation} className="btn-secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                    Get New Quote
                </button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                marginTop: '10px'
            }}>
                <button
                    onClick={() => setActiveTab('journal')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: activeTab === 'journal' ? 'var(--primary)' : 'var(--surface)',
                        color: activeTab === 'journal' ? '#000' : '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    📝 Journal
                </button>
                <button
                    onClick={() => setActiveTab('insights')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: activeTab === 'insights' ? 'var(--primary)' : 'var(--surface)',
                        color: activeTab === 'insights' ? '#000' : '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    📊 Insights
                </button>
            </div>

            {activeTab === 'journal' && (
                <>
                    {/* Mood Selector */}
                    <div className="card">
                        <h2 className="subtitle">How are you feeling?</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                            {moods.map((m) => (
                                <div
                                    key={m.label}
                                    onClick={() => setSelectedMood(m.label)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        opacity: selectedMood && selectedMood !== m.label ? 0.3 : 1,
                                        transform: selectedMood === m.label ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        backgroundColor: selectedMood === m.label ? `${m.color}20` : 'rgba(255,255,255,0.05)',
                                        padding: '12px',
                                        borderRadius: '50%',
                                        marginBottom: '5px',
                                        border: selectedMood === m.label ? `2px solid ${m.color}` : '2px solid transparent',
                                        transition: 'all 0.2s'
                                    }}>
                                        <m.icon color={m.color} size={28} />
                                    </div>
                                    <span style={{ fontSize: '10px', color: selectedMood === m.label ? m.color : '#888' }}>{m.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Journal Entry */}
                    <div className="card">
                        <h2 className="subtitle">Mini Journal</h2>
                        <textarea
                            className="input-field"
                            placeholder="What's on your mind today? Write your thoughts, feelings, or anything you'd like to remember..."
                            rows={5}
                            value={journal}
                            onChange={(e) => setJournal(e.target.value)}
                            style={{ resize: 'none' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ fontSize: '12px', color: '#666' }}>
                                {journal.length} characters
                            </span>
                            <button
                                className="btn-primary"
                                onClick={handleSave}
                                disabled={!journal && !selectedMood}
                                style={{
                                    opacity: (!journal && !selectedMood) ? 0.5 : 1,
                                    padding: '10px 20px'
                                }}
                            >
                                <Save size={16} /> Save Entry
                            </button>
                        </div>
                    </div>

                    {/* Previous Entries */}
                    {entries.length > 0 && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2 className="subtitle" style={{ marginBottom: 0 }}>
                                    <Calendar size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    Journal History
                                </h2>
                                <span style={{ fontSize: '12px', color: '#888' }}>{entries.length} entries</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {displayedEntries.map(entry => (
                                    <div
                                        key={entry.id}
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            borderRadius: '12px',
                                            padding: '15px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                                                    {formatDate(entry.date)}
                                                </div>
                                                {entry.mood && (
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        backgroundColor: `${getMoodColor(entry.mood)}20`,
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        color: getMoodColor(entry.mood)
                                                    }}>
                                                        {getMoodIcon(entry.mood)}
                                                        {entry.mood}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleEdit(entry)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--secondary)',
                                                        cursor: 'pointer',
                                                        padding: '4px'
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--danger)',
                                                        cursor: 'pointer',
                                                        padding: '4px'
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        {entry.text && (
                                            <p style={{
                                                fontSize: '14px',
                                                whiteSpace: 'pre-wrap',
                                                margin: 0,
                                                lineHeight: '1.5',
                                                color: '#ddd'
                                            }}>
                                                {entry.text}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {entries.length > 3 && (
                                <button
                                    onClick={() => setShowAllEntries(!showAllEntries)}
                                    style={{
                                        marginTop: '15px',
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'var(--secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        fontSize: '14px'
                                    }}
                                >
                                    {showAllEntries ? (
                                        <>Show Less <ChevronUp size={16} /></>
                                    ) : (
                                        <>Show All ({entries.length - 3} more) <ChevronDown size={16} /></>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'insights' && (
                <>
                    {/* Weekly Mood Trend */}
                    <div className="card">
                        <h2 className="subtitle">
                            <TrendingUp size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Weekly Mood Trend
                        </h2>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            height: '120px',
                            padding: '20px 0'
                        }}>
                            {weeklyTrend.map((day, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    flex: 1
                                }}>
                                    <div style={{
                                        width: '20px',
                                        height: `${day.value * 20}px`,
                                        backgroundColor: day.hasEntry
                                            ? `hsl(${(day.value - 1) * 30 + 10}, 70%, 50%)`
                                            : '#333',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'all 0.3s',
                                        minHeight: day.hasEntry ? '20px' : '4px'
                                    }} />
                                    <span style={{
                                        fontSize: '10px',
                                        color: '#888',
                                        marginTop: '8px'
                                    }}>
                                        {day.day}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '20px',
                            fontSize: '10px',
                            color: '#666',
                            marginTop: '10px'
                        }}>
                            <span>😢 Low</span>
                            <span>→</span>
                            <span>😊 High</span>
                        </div>
                    </div>

                    {/* Mood Stats */}
                    {moodStats && moodStats.totalEntries > 0 && (
                        <div className="card">
                            <h2 className="subtitle">Mood Statistics</h2>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '15px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    backgroundColor: 'rgba(255,215,0,0.1)',
                                    padding: '15px',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {moodStats.totalEntries}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>Total Entries</div>
                                </div>
                                <div style={{
                                    backgroundColor: 'rgba(0,123,255,0.1)',
                                    padding: '15px',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary)' }}>
                                        {moodStats.avgScore}/5
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>Avg Mood Score</div>
                                </div>
                            </div>

                            {moodStats.mostCommon && (
                                <div style={{
                                    backgroundColor: `${getMoodColor(moodStats.mostCommon)}15`,
                                    padding: '15px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    marginBottom: '20px'
                                }}>
                                    {getMoodIcon(moodStats.mostCommon)}
                                    <span style={{ color: getMoodColor(moodStats.mostCommon) }}>
                                        Most common mood: <strong>{moodStats.mostCommon}</strong>
                                    </span>
                                </div>
                            )}

                            {/* Mood Distribution */}
                            <div style={{ marginTop: '15px' }}>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>Mood Distribution</div>
                                {moods.map(mood => {
                                    const count = moodStats.counts[mood.label] || 0;
                                    const percentage = moodStats.total > 0 ? (count / moodStats.total) * 100 : 0;
                                    return (
                                        <div key={mood.label} style={{ marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <mood.icon size={14} color={mood.color} />
                                                    <span style={{ fontSize: '12px' }}>{mood.label}</span>
                                                </div>
                                                <span style={{ fontSize: '12px', color: '#888' }}>{count}x</span>
                                            </div>
                                            <div style={{
                                                height: '6px',
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${percentage}%`,
                                                    backgroundColor: mood.color,
                                                    borderRadius: '3px',
                                                    transition: 'width 0.3s'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {(!moodStats || moodStats.totalEntries === 0) && (
                        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
                            <h3 style={{ marginBottom: '10px', color: '#888' }}>No Data Yet</h3>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                Start logging your moods to see insights and trends here!
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Edit Modal */}
            {editingEntry && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
                        <button
                            onClick={() => setEditingEntry(null)}
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '15px',
                                background: 'none',
                                border: 'none',
                                color: '#888',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <h3 className="subtitle" style={{ marginBottom: '20px' }}>Edit Entry</h3>

                        {/* Mood Selector in Modal */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '12px', color: '#888', marginBottom: '8px', display: 'block' }}>Mood</label>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {moods.map((m) => (
                                    <div
                                        key={m.label}
                                        onClick={() => setEditMood(m.label)}
                                        style={{
                                            cursor: 'pointer',
                                            opacity: editMood && editMood !== m.label ? 0.3 : 1,
                                            transform: editMood === m.label ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'all 0.2s',
                                            padding: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: editMood === m.label ? `${m.color}20` : 'transparent'
                                        }}
                                    >
                                        <m.icon color={m.color} size={24} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <textarea
                            className="input-field"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={5}
                            style={{ resize: 'none', marginBottom: '15px' }}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => setEditingEntry(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                style={{ flex: 1 }}
                                onClick={handleSaveEdit}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PsychologyPage;
