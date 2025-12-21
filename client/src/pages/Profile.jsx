import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Settings, LogOut, Trash2, Save, Camera, Target, BookOpen, Brain, Wallet, Code, ChevronRight, Sparkles, Award, TrendingUp, FileText, Clock, Calendar, Cloud, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generatePDFReport } from '../utils/reportGenerator';
import { syncService } from '../utils/syncService';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [bio, setBio] = useState(() => localStorage.getItem(`${user?.username}_user_bio`) || 'Productivity Enthusiast');
    const [goals, setGoals] = useState(() => localStorage.getItem(`${user?.username}_user_goals`) || 'Master React, Save Money, Meditate Daily');
    const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem(`${user?.username}_profile_photo`) || null);
    const photoInputRef = useRef(null);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Cloud Sync State
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(localStorage.getItem('last_sync_time'));

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePhoto(reader.result);
            if (user) {
                localStorage.setItem(`${user.username}_profile_photo`, reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const [stats, setStats] = useState({
        journalEntries: 0,
        studySessions: 0,
        savedMoney: 0,
        tasksCompleted: 0
    });

    useEffect(() => {
        if (!user) return;
        const journals = JSON.parse(localStorage.getItem(`${user.username}_psych_journal_entries`) || '[]');
        const financeTransactions = JSON.parse(localStorage.getItem(`${user.username}_finance_transactions`) || '[]');
        const studySessions = JSON.parse(localStorage.getItem(`${user.username}_study_sessions`) || '[]');
        const completedHistory = JSON.parse(localStorage.getItem(`${user.username}_completed_history`) || '[]');

        const calculatedBalance = financeTransactions.reduce((total, t) => {
            return t.type === 'income' ? total + t.amount : total - t.amount;
        }, 0);

        setStats({
            journalEntries: journals.length,
            studySessions: studySessions.length,
            savedMoney: calculatedBalance,
            tasksCompleted: completedHistory.length
        });
    }, [user]);

    const handleGenerateReport = (type) => {
        setIsGenerating(true);
        const transactions = JSON.parse(localStorage.getItem(`${user.username}_finance_transactions`) || '[]');
        const tasks = JSON.parse(localStorage.getItem(`${user.username}_calendar_todos`) || '[]');
        const journals = JSON.parse(localStorage.getItem(`${user.username}_psych_journal_entries`) || '[]');
        const studySessions = JSON.parse(localStorage.getItem(`${user.username}_study_sessions`) || '[]');

        setTimeout(() => {
            generatePDFReport(type, user, { transactions, tasks, journals, studySessions });
            setIsGenerating(false);
            setShowSavedToast(true);
        }, 1500);
    };

    const handleCloudSync = async (action) => {
        setIsSyncing(true);
        try {
            if (action === 'push') {
                await syncService.pushData(user);
                const time = new Date().toLocaleString();
                setLastSyncTime(time);
                localStorage.setItem('last_sync_time', time);
                alert('✅ Data successfully backed up to cloud!');
            } else {
                const result = await syncService.pullData(user);
                if (result) {
                    alert(`✅ Data restored from ${new Date(result.lastUpdated).toLocaleString()}! Please refresh.`);
                    window.location.reload();
                } else {
                    alert('⚠️ No backup found in cloud.');
                }
            }
        } catch (error) {
            console.error(error);
            alert('❌ Sync failed. Make sure the server is running.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveProfile = () => {
        if (user) {
            localStorage.setItem(`${user.username}_user_bio`, bio);
            localStorage.setItem(`${user.username}_user_goals`, goals);
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 2000);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleResetData = () => {
        if (window.confirm('Are you sure you want to wipe ALL app history? This cannot be undone.')) {
            localStorage.clear();
            logout();
            window.location.href = '/';
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    return (
        <div className="page-container animate-fade-in" style={{ paddingBottom: '120px' }}>
            {/* Profile Header with Background */}
            <div style={{
                position: 'relative',
                marginBottom: '80px',
                marginTop: '-20px',
                marginLeft: '-20px',
                marginRight: '-20px',
                padding: '40px 20px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(0, 212, 255, 0.15) 50%, rgba(255, 215, 0, 0.1) 100%)',
                borderRadius: '0 0 40px 40px',
                overflow: 'hidden'
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: '100px',
                    height: '100px',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(20px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '5%',
                    width: '80px',
                    height: '80px',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(15px)'
                }} />

                <Sparkles
                    size={20}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '30px',
                        color: 'rgba(255, 215, 0, 0.5)',
                        animation: 'float 4s ease-in-out infinite'
                    }}
                />

                {/* Profile Photo */}
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <input
                        type="file"
                        ref={photoInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <div
                        onClick={() => photoInputRef.current?.click()}
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: profilePhoto
                                ? `url(${profilePhoto}) center/cover`
                                : 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
                            margin: '0 auto 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                            fontWeight: '800',
                            color: '#000',
                            cursor: 'pointer',
                            position: 'relative',
                            border: '4px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 60px rgba(168, 85, 247, 0.2)'
                        }}
                    >
                        {!profilePhoto && (user?.name?.[0]?.toUpperCase() || 'U')}
                        <div style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #00D4FF, #A855F7)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #0F0F1A',
                            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.4)'
                        }}>
                            <Camera size={16} color="#fff" />
                        </div>
                    </div>
                    <h2 style={{
                        margin: '0 0 8px 0',
                        fontSize: '24px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #fff 0%, #A0A0B0 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {user?.name}
                    </h2>
                    <p style={{ color: '#A0A0B0', fontSize: '14px', margin: 0 }}>{bio}</p>
                </div>

                {/* Stats Cards floating at bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: '-60px',
                    left: '20px',
                    right: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px'
                }}>
                    {[
                        { value: stats.journalEntries, label: 'Journals', icon: Brain, color: '#A855F7' },
                        { value: stats.studySessions, label: 'Sessions', icon: BookOpen, color: '#14B8A6' },
                        { value: stats.tasksCompleted, label: 'Tasks', icon: Target, color: '#FFD700' },
                        { value: formatRupiah(stats.savedMoney).replace('Rp', ''), label: 'Balance', icon: Wallet, color: '#00D26A' }
                    ].map((stat, index) => (
                        <div key={index} style={{
                            background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            padding: '14px 8px',
                            textAlign: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                        }}>
                            <stat.icon size={18} color={stat.color} style={{ marginBottom: '6px' }} />
                            <div style={{
                                fontSize: index === 3 ? '11px' : '18px',
                                fontWeight: '700',
                                color: stat.color,
                                marginBottom: '2px'
                            }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '9px', color: '#606070', fontWeight: '500' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Smart Reports & Cloud Sync Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Premium Reports Card */}
                <div className="card" style={{
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '-10px', right: '-10px',
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        filter: 'blur(20px)', opacity: 0.2
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'rgba(255, 215, 0, 0.15)',
                            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FileText size={18} color="#FFD700" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#FFD700' }}>
                                Smart Reports
                            </h3>
                            <span style={{ fontSize: '10px', color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '1px' }}>PREMIUM</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                            onClick={() => handleGenerateReport('weekly')}
                            disabled={isGenerating}
                            style={{
                                padding: '12px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
                            }}
                        >
                            <Clock size={16} color="#00D4FF" />
                            <span style={{ fontSize: '12px' }}>Weekly Report</span>
                        </button>
                        <button
                            onClick={() => handleGenerateReport('monthly')}
                            disabled={isGenerating}
                            style={{
                                padding: '12px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
                            }}
                        >
                            <Calendar size={16} color="#EC4899" />
                            <span style={{ fontSize: '12px' }}>Monthly Report</span>
                        </button>
                    </div>

                    {isGenerating && (
                        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Sparkles size={12} className="animate-spin" /> Generating AI Insights...
                        </div>
                    )}
                </div>

                {/* Cloud Sync Card */}
                <div className="card" style={{
                    background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Cloud size={18} color="#38BDF8" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#38BDF8' }}>Cloud Sync</h3>
                            <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                                {lastSyncTime ? `Last synced: ${lastSyncTime}` : 'Not synced yet'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                            onClick={() => handleCloudSync('push')}
                            disabled={isSyncing}
                            style={{
                                padding: '12px', borderRadius: '12px',
                                background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
                                color: '#38BDF8', cursor: isSyncing ? 'wait' : 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <Upload size={18} />
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>Backup Data</span>
                        </button>

                        <button
                            onClick={() => handleCloudSync('pull')}
                            disabled={isSyncing}
                            style={{
                                padding: '12px', borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff', cursor: isSyncing ? 'wait' : 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <Download size={18} />
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>Restore Data</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* About Me Card */}
            <div className="card" style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                marginTop: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={18} color="#A855F7" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>About Me</h3>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#A0A0B0', marginBottom: '8px', fontWeight: '500' }}>
                        Bio / Tagline
                    </label>
                    <input
                        className="input-field"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Describe yourself..."
                        style={{ marginBottom: 0 }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#A0A0B0', marginBottom: '8px', fontWeight: '500' }}>
                        Current Goals
                    </label>
                    <textarea
                        className="input-field"
                        rows={3}
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder="What are you working towards?"
                        style={{ resize: 'none', marginBottom: 0 }}
                    />
                </div>
                <button
                    onClick={handleSaveProfile}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)'
                    }}
                >
                    <Save size={16} /> Save Changes
                </button>
            </div>

            {/* Quick Links */}
            <div className="card" style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(20, 184, 166, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Settings size={18} color="#00D4FF" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Quick Links</h3>
                </div>

                <button
                    onClick={() => navigate('/achievements')}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 165, 0, 0.05))',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '10px',
                        textAlign: 'left'
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(249, 115, 22, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Award size={18} color="#FFD700" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>Achievements</div>
                        <div style={{ fontSize: '12px', color: '#606070' }}>Badges & milestones</div>
                    </div>
                    <ChevronRight size={18} color="#606070" />
                </button>

                <button
                    onClick={() => navigate('/developer')}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '10px',
                        textAlign: 'left'
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Code size={18} color="#FFD700" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>Developer Info</div>
                        <div style={{ fontSize: '12px', color: '#606070' }}>About the creator</div>
                    </div>
                    <ChevronRight size={18} color="#606070" />
                </button>

                <button
                    onClick={() => navigate('/learning')}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textAlign: 'left'
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(0, 212, 255, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <TrendingUp size={18} color="#14B8A6" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>View Statistics</div>
                        <div style={{ fontSize: '12px', color: '#606070' }}>Learning progress & more</div>
                    </div>
                    <ChevronRight size={18} color="#606070" />
                </button>
                <button
                    onClick={() => {
                        sessionStorage.setItem('replay_tutorial', 'true');
                        window.dispatchEvent(new Event('start-tutorial'));
                        navigate('/');
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '10px',
                        textAlign: 'left'
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Target size={18} color="#A855F7" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>App Tour</div>
                        <div style={{ fontSize: '12px', color: '#606070' }}>Replay tutorial</div>
                    </div>
                    <ChevronRight size={18} color="#606070" />
                </button>
            </div>

            {/* Danger Zone */}
            <div className="card" style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)',
                border: '1px solid rgba(255, 71, 87, 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'rgba(255, 71, 87, 0.15)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Settings size={18} color="#FF4757" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#FF4757' }}>Danger Zone</h3>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '10px'
                    }}
                >
                    <LogOut size={16} /> Sign Out
                </button>

                <button
                    onClick={handleResetData}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 71, 87, 0.3)',
                        background: 'rgba(255, 71, 87, 0.1)',
                        color: '#FF4757',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Trash2 size={16} /> Reset All Data
                </button>
            </div>

            {/* App Version */}
            <p style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#606070',
                marginTop: '20px'
            }}>
                SuperApp v1.0.0 • Made with 💛
            </p>

            {/* Toast Notification */}
            {showSavedToast && (
                <div style={{
                    position: 'fixed',
                    bottom: '120px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, rgba(0, 210, 106, 0.9), rgba(20, 184, 166, 0.9))',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50px',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 10px 40px rgba(0, 210, 106, 0.4)',
                    animation: 'slideUp 0.3s ease',
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    ✓ Profile saved!
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
