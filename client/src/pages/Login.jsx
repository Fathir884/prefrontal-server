import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Sparkles, Zap, Star, Heart, Brain } from 'lucide-react';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            let success = false;

            if (isLogin) {
                success = login(username, password);
                if (!success) setError('Invalid credentials');
            } else {
                success = register(username, password);
                if (!success) setError('Username already taken');
            }

            setIsLoading(false);
            if (success) navigate('/');
        }, 800);
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
            maxWidth: '480px',
            margin: '0 auto'
        }}>
            {/* Decorative Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-30%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 8s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-20%',
                width: '350px',
                height: '350px',
                background: 'radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(50px)',
                animation: 'float 10s ease-in-out infinite reverse'
            }} />
            <div style={{
                position: 'absolute',
                top: '30%',
                left: '10%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                animation: 'float 12s ease-in-out infinite'
            }} />

            {/* Floating Decorative Icons */}
            <Sparkles
                size={24}
                style={{
                    position: 'absolute',
                    top: '15%',
                    right: '15%',
                    color: 'rgba(255, 215, 0, 0.4)',
                    animation: 'float 4s ease-in-out infinite'
                }}
            />
            <Star
                size={20}
                style={{
                    position: 'absolute',
                    top: '25%',
                    left: '10%',
                    color: 'rgba(168, 85, 247, 0.4)',
                    animation: 'float 5s ease-in-out infinite reverse'
                }}
            />
            <Zap
                size={18}
                style={{
                    position: 'absolute',
                    bottom: '30%',
                    right: '10%',
                    color: 'rgba(0, 212, 255, 0.4)',
                    animation: 'float 6s ease-in-out infinite'
                }}
            />
            <Heart
                size={16}
                style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '15%',
                    color: 'rgba(236, 72, 153, 0.4)',
                    animation: 'float 7s ease-in-out infinite reverse'
                }}
            />

            {/* Logo & Branding */}
            <div className="animate-fade-in" style={{ marginBottom: '40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '28px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
                    margin: '0 auto 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 40px rgba(255, 165, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.2)',
                    position: 'relative',
                    animation: 'float 6s ease-in-out infinite'
                }}>
                    {/* Inner glow ring */}
                    <div style={{
                        position: 'absolute',
                        inset: '-4px',
                        borderRadius: '32px',
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.5), transparent, rgba(255, 165, 0, 0.5))',
                        zIndex: -1,
                        animation: 'spin 8s linear infinite'
                    }} />
                    <Brain size={56} color="#000" strokeWidth={2.5} />
                </div>

                <div style={{ textAlign: 'center', width: '100%', marginBottom: '12px' }}>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: '800',
                        margin: '0',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #00D4FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-1px'
                    }}>
                        Prefrontal
                    </h1>
                </div>
                <p style={{
                    color: '#A0A0B0',
                    fontSize: '15px',
                    fontWeight: '400'
                }}>
                    ✨ Your personal growth companion
                </p>
            </div>

            {/* Login Card */}
            <div
                className="animate-slide-up"
                style={{
                    width: '100%',
                    maxWidth: '380px',
                    background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '32px 28px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 100px rgba(168, 85, 247, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    zIndex: 1
                }}
            >
                {/* Card top accent line */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #FFD700, #00D4FF, #A855F7)',
                    borderRadius: '24px 24px 0 0'
                }} />

                {/* Card inner glow */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '28px',
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#fff'
                }}>
                    {isLogin ? '👋 Welcome Back' : '🚀 Create Account'}
                </h2>

                {error && (
                    <div style={{
                        background: 'rgba(255, 71, 87, 0.15)',
                        border: '1px solid rgba(255, 71, 87, 0.3)',
                        color: '#FF4757',
                        textAlign: 'center',
                        marginBottom: '20px',
                        fontSize: '14px',
                        padding: '12px',
                        borderRadius: '12px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <div style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(168, 85, 247, 0.2))',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <User size={18} color="#00D4FF" />
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '18px 18px 18px 64px',
                                borderRadius: '14px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(30, 30, 50, 0.6)',
                                color: '#fff',
                                fontSize: '15px',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#00D4FF';
                                e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.boxShadow = 'none';
                            }}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative', marginBottom: '28px' }}>
                        <div style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Lock size={18} color="#A855F7" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '18px 18px 18px 64px',
                                borderRadius: '14px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(30, 30, 50, 0.6)',
                                color: '#fff',
                                fontSize: '15px',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#A855F7';
                                e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.boxShadow = 'none';
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '18px',
                            borderRadius: '14px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            color: '#000',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: isLoading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 15px 40px rgba(255, 215, 0, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.3)';
                        }}
                    >
                        {isLoading ? (
                            <div style={{
                                width: '24px',
                                height: '24px',
                                border: '3px solid rgba(0,0,0,0.2)',
                                borderTop: '3px solid #000',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }} />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '24px 0',
                    gap: '16px'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                    <span style={{ color: '#606070', fontSize: '12px' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#A0A0B0', fontSize: '14px' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#00D4FF',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#5CE1FF'}
                        onMouseLeave={(e) => e.target.style.color = '#00D4FF'}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <p style={{
                marginTop: '32px',
                fontSize: '12px',
                color: '#606070',
                textAlign: 'center',
                zIndex: 1
            }}>
                Made with 💛 for productivity
            </p>
        </div>
    );
};

export default LoginPage;
