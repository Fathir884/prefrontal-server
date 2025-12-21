import React from 'react';
import { Code, Github, Mail, Heart, Sparkles, Star, Zap, Rocket, ChevronLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeveloperPage = () => {
    const navigate = useNavigate();

    const techStack = [
        { name: 'React', icon: '⚛️', color: '#61DAFB' },
        { name: 'Vite', icon: '⚡', color: '#646CFF' },
        { name: 'LocalStorage', icon: '💾', color: '#FFD700' },
        { name: 'CSS3', icon: '🎨', color: '#EC4899' }
    ];

    const features = [
        { emoji: '📊', text: 'Finance Management with Goals' },
        { emoji: '📅', text: 'Calendar & To-Do List' },
        { emoji: '📚', text: 'Learning Center with Pomodoro' },
        { emoji: '🧠', text: 'Mind Journal & Mood Tracking' },
        { emoji: '👤', text: 'User Authentication & Profile' },
        { emoji: '💾', text: 'Offline-First with LocalStorage' }
    ];

    return (
        <div className="page-container animate-fade-in" style={{ paddingBottom: '120px' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: '#A0A0B0',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    padding: 0
                }}
            >
                <ChevronLeft size={20} />
                Back
            </button>

            {/* Header */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <h1 className="title" style={{ marginBottom: '8px' }}>Developer</h1>
                <p style={{ color: '#A0A0B0', fontSize: '14px', margin: 0 }}>About the creator</p>

                {/* Decorative */}
                <Sparkles
                    size={20}
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '20px',
                        color: 'rgba(255, 215, 0, 0.4)',
                        animation: 'float 4s ease-in-out infinite'
                    }}
                />
            </div>

            {/* Developer Profile Card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(0, 212, 255, 0.1) 50%, rgba(255, 215, 0, 0.08) 100%)',
                borderRadius: '28px',
                padding: '32px 24px',
                marginBottom: '24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {/* Background decorations */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(30px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    left: '-10%',
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(25px)'
                }} />

                <Star
                    size={16}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        color: 'rgba(255, 215, 0, 0.3)'
                    }}
                />
                <Zap
                    size={14}
                    style={{
                        position: 'absolute',
                        bottom: '30px',
                        right: '30px',
                        color: 'rgba(0, 212, 255, 0.3)'
                    }}
                />

                {/* Profile Avatar */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #00D4FF 100%)',
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '52px',
                    fontWeight: '800',
                    color: '#000',
                    position: 'relative',
                    boxShadow: '0 15px 40px rgba(255, 215, 0, 0.25), 0 0 60px rgba(168, 85, 247, 0.15)'
                }}>
                    F
                    {/* Ring animation */}
                    <div style={{
                        position: 'absolute',
                        inset: '-4px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.5), transparent, rgba(0, 212, 255, 0.5))',
                        zIndex: -1,
                        animation: 'spin 8s linear infinite'
                    }} />
                </div>

                <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '28px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #fff 0%, #A0A0B0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Fathir
                </h2>
                <p style={{
                    background: 'linear-gradient(135deg, #FFD700, #00D4FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '16px',
                    fontWeight: '700',
                    margin: 0
                }}>
                    Full Stack Developer
                </p>
            </div>

            {/* About This App */}
            <div className="card" style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(168, 85, 247, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Rocket size={18} color="#00D4FF" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>About This App</h3>
                </div>
                <p style={{ color: '#A0A0B0', lineHeight: '1.7', marginBottom: '12px', fontSize: '14px' }}>
                    Productivity Super App is an all-in-one application designed to help you manage your daily life more efficiently and organized.
                </p>
                <p style={{ color: '#A0A0B0', lineHeight: '1.7', margin: 0, fontSize: '14px' }}>
                    This app combines finance management, scheduling, learning, mental health features, and more in one easy-to-use platform.
                </p>
                <button
                    onClick={() => navigate('/module')}
                    style={{
                        marginTop: '16px',
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <BookOpen size={16} /> View App Module & Manual
                </button>
            </div>

            {/* Tech Stack */}
            <div className="card" style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Code size={18} color="#FFD700" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Tech Stack</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {techStack.map((tech, index) => (
                        <div key={index} style={{
                            padding: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '14px',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.06)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{tech.icon}</div>
                            <div style={{ fontSize: '13px', color: tech.color, fontWeight: '600' }}>{tech.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div className="card" style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(0, 212, 255, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Zap size={18} color="#14B8A6" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Features</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {features.map((feature, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <span style={{ fontSize: '18px' }}>{feature.emoji}</span>
                            <span style={{ fontSize: '14px', color: '#A0A0B0' }}>{feature.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact */}
            <div className="card" style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.15)'
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
                        <Heart size={18} color="#FF4757" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Contact</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <a href="mailto:fathir@example.com" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '14px 16px',
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05))',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 215, 0, 0.15)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Mail size={18} color="#FFD700" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>Email</div>
                            <div style={{ fontSize: '12px', color: '#A0A0B0' }}>fathir@example.com</div>
                        </div>
                    </a>
                    <a href="https://github.com/fathir" target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '14px 16px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))',
                        borderRadius: '14px',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(168, 85, 247, 0.15)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Github size={18} color="#A855F7" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>GitHub</div>
                            <div style={{ fontSize: '12px', color: '#A0A0B0' }}>github.com/fathir</div>
                        </div>
                    </a>
                </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '24px', color: '#606070', fontSize: '12px' }}>
                <p style={{ margin: '0 0 4px 0' }}>Made with 💛 by Fathir</p>
                <p style={{ margin: 0 }}>© 2024 Productivity Super App</p>
            </div>
        </div>
    );
};

export default DeveloperPage;
