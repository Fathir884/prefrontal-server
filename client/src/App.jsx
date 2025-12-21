import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import CalendarPage from './pages/Calendar';
import PsychologyPage from './pages/Psychology';
import LearningPage from './pages/Learning';
import FinancePage from './pages/Finance';
import LoginPage from './pages/Login';
import ProfilePage from './pages/Profile';
import DeveloperPage from './pages/Developer';
import HabitsPage from './pages/Habits';
import AchievementsPage from './pages/Achievements';
import ArcadePage from './pages/Arcade';
import ColorConnect from './pages/ColorConnect';
import CardMatch from './pages/CardMatch';
import ModulePage from './pages/Module';
import PrefAI from './components/PrefAI';
import { User, Calendar, Brain, BookOpen, Wallet, ChevronRight, Sparkles, Zap, Clock, Target, TrendingUp, Star, Gamepad2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};



const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    balance: 0,
    todayTasks: 0,
    journalStreak: 0,
    studyMinutes: 0
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Load stats from localStorage
    const transactions = JSON.parse(localStorage.getItem(`${user.username}_finance_transactions`) || '[]');
    const todos = JSON.parse(localStorage.getItem(`${user.username}_calendar_todos`) || '[]');
    const journals = JSON.parse(localStorage.getItem(`${user.username}_psych_journal_entries`) || '[]');
    const studySessions = JSON.parse(localStorage.getItem(`${user.username}_study_sessions`) || '[]');

    const balance = transactions.reduce((total, t) =>
      t.type === 'income' ? total + t.amount : total - t.amount, 0);

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = todos.filter(t => t.date === today && !t.completed).length;

    const todayStudy = studySessions
      .filter(s => new Date(s.completedAt).toDateString() === new Date().toDateString())
      .reduce((acc, s) => acc + s.duration, 0);

    setStats({
      balance,
      todayTasks,
      journalStreak: journals.length,
      studyMinutes: todayStudy
    });
  }, [user]);

  const formatRupiah = (number) => {
    if (Math.abs(number) >= 1000000) {
      return 'Rp' + (number / 1000000).toFixed(1) + 'M';
    }
    if (Math.abs(number) >= 1000) {
      return 'Rp' + (number / 1000).toFixed(0) + 'K';
    }
    return 'Rp' + number;
  };

  const quickActions = [
    {
      id: 'habits',
      title: 'Habits',
      subtitle: 'Daily Tracking',
      icon: Zap,
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.05))',
      path: '/habits'
    },
    {
      id: 'mind',
      title: 'Mind',
      subtitle: 'Mood & Journal',
      icon: Brain,
      color: '#A855F7',
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.05))',
      path: '/psychology'
    },
    {
      id: 'calendar',
      title: 'Calendar',
      subtitle: 'Events & Tasks',
      icon: Calendar,
      color: '#00D4FF',
      gradient: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.05))',
      path: '/calendar'
    },
    {
      id: 'learn',
      title: 'Learn',
      subtitle: 'Study & Notes',
      icon: BookOpen,
      color: '#14B8A6',
      gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05))',
      path: '/learning'
    },
    {
      id: 'finance',
      title: 'Finance',
      subtitle: 'Budget & Goals',
      icon: Wallet,
      color: '#F97316',
      gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.05))',
      path: '/finance'
    }
  ];

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '120px' }}>
      {/* Header Section */}
      <div style={{
        marginTop: '10px',
        marginBottom: '28px',
        position: 'relative'
      }}>
        {/* Decorative elements */}
        <Sparkles
          size={20}
          style={{
            position: 'absolute',
            top: '-5px',
            right: '60px',
            color: 'rgba(255, 215, 0, 0.4)',
            animation: 'float 4s ease-in-out infinite'
          }}
        />
        <Star
          size={16}
          style={{
            position: 'absolute',
            top: '30px',
            right: '20px',
            color: 'rgba(168, 85, 247, 0.3)',
            animation: 'float 5s ease-in-out infinite reverse'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{
              fontSize: '14px',
              color: '#A0A0B0',
              margin: '0 0 4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {greeting} ☀️
            </p>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              margin: '0 0 4px 0',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {user?.name}
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#606070',
              margin: 0
            }}>
              {currentTime.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1))',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <User size={22} color="#FFD700" />
          </button>
        </div>
      </div>

      {/* Stats Overview Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 215, 0, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-5%',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Zap size={18} color="#FFD700" />
            <span style={{ fontSize: '13px', color: '#A0A0B0', fontWeight: '500' }}>Today's Overview</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(0, 210, 106, 0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Wallet size={16} color="#00D26A" />
                </div>
                <span style={{ fontSize: '11px', color: '#606070' }}>Balance</span>
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: stats.balance >= 0 ? '#00D26A' : '#FF4757'
              }}>
                {formatRupiah(stats.balance)}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(0, 212, 255, 0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Target size={16} color="#00D4FF" />
                </div>
                <span style={{ fontSize: '11px', color: '#606070' }}>Tasks Today</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#00D4FF' }}>
                {stats.todayTasks} pending
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Brain size={16} color="#A855F7" />
                </div>
                <span style={{ fontSize: '11px', color: '#606070' }}>Journals</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#A855F7' }}>
                {stats.journalStreak} entries
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(20, 184, 166, 0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={16} color="#14B8A6" />
                </div>
                <span style={{ fontSize: '11px', color: '#606070' }}>Study Today</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#14B8A6' }}>
                {stats.studyMinutes} min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TrendingUp size={20} color="#FFD700" />
            Quick Actions
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              style={{
                background: action.gradient,
                borderRadius: '20px',
                padding: '20px 16px',
                border: `1px solid ${action.color}30`,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Icon background glow */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '60px',
                height: '60px',
                background: `radial-gradient(circle, ${action.color}15 0%, transparent 70%)`,
                borderRadius: '50%'
              }} />

              <div style={{
                width: '44px',
                height: '44px',
                background: `${action.color}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                border: `1px solid ${action.color}30`
              }}>
                <action.icon size={22} color={action.color} />
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '4px'
              }}>
                {action.title}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#A0A0B0'
              }}>
                {action.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        borderRadius: '20px',
        padding: '24px',
        textAlign: 'center',
        border: '1px solid rgba(255, 215, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Sparkles size={16} style={{ marginBottom: '12px', color: '#FFD700' }} />
        <p style={{
          fontSize: '15px',
          fontStyle: 'italic',
          color: '#A0A0B0',
          margin: '0 0 8px 0',
          lineHeight: '1.6'
        }}>
          "The secret of getting ahead is getting started."
        </p>
        <p style={{
          fontSize: '12px',
          color: '#606070',
          margin: 0
        }}>
          — Mark Twain
        </p>
      </div>
    </div>
  );
};

import TutorialOverlay from './components/TutorialOverlay';

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';
  const showNav = user && !isLoginPage;

  return (
    <>
      {children}
      {showNav && <BottomNav />}
      {showNav && <PrefAI />}
      {/* Move TutorialOverlay to the very end to ensure it overlays everything including BottomNav if needed, though z-index handles it */}
      {user && !isLoginPage && <TutorialOverlay />}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/psychology" element={<ProtectedRoute><PsychologyPage /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/developer" element={<ProtectedRoute><DeveloperPage /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
          <Route path="/arcade" element={<ProtectedRoute><ArcadePage /></ProtectedRoute>} />
          <Route path="/arcade/color-connect" element={<ProtectedRoute><ColorConnect /></ProtectedRoute>} />
          <Route path="/arcade/card-match" element={<ProtectedRoute><CardMatch /></ProtectedRoute>} />
          <Route path="/module" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
        </Routes>
      </MainLayout>
    </AuthProvider>
  );
}

export default App;
