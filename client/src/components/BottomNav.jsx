import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Brain, BookOpen, DollarSign, Home, Flame, Gamepad2 } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Home', color: '#FFD700' },
        { path: '/learning', icon: BookOpen, label: 'Learn', color: '#14B8A6' },
        { path: '/arcade', icon: Gamepad2, label: 'Play', color: '#8B5CF6' },
        { path: '/calendar', icon: Calendar, label: 'Cal', color: '#00D4FF' },
        { path: '/finance', icon: DollarSign, label: 'Money', color: '#F97316' },
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '430px',
            background: 'linear-gradient(180deg, rgba(15, 15, 26, 0.95) 0%, rgba(15, 15, 26, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            padding: '8px 10px 24px 10px',
            zIndex: 1000,
            boxSizing: 'border-box'
        }}>
            {/* Top gradient fade */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                left: 0,
                right: 0,
                height: '20px',
                background: 'linear-gradient(to top, rgba(15, 15, 26, 0.95), transparent)',
                pointerEvents: 'none'
            }} />

            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        id={`nav-${item.label.toLowerCase()}`}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            flex: 1,
                            position: 'relative',
                            padding: '8px 0'
                        }}
                    >
                        {/* Active indicator line */}
                        {isActive && (
                            <div style={{
                                position: 'absolute',
                                top: '-8px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '32px',
                                height: '3px',
                                background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                                borderRadius: '0 0 4px 4px'
                            }} />
                        )}

                        {/* Icon container with glow */}
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isActive
                                ? `linear-gradient(135deg, ${item.color}25, ${item.color}10)`
                                : 'transparent',
                            border: isActive
                                ? `1px solid ${item.color}40`
                                : '1px solid transparent',
                            marginBottom: '4px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: isActive
                                ? `0 4px 15px ${item.color}30`
                                : 'none'
                        }}>
                            <Icon
                                size={22}
                                color={isActive ? item.color : '#606070'}
                                style={{
                                    transition: 'all 0.3s ease',
                                    filter: isActive ? `drop-shadow(0 0 8px ${item.color}60)` : 'none'
                                }}
                            />
                        </div>

                        {/* Label */}
                        <span style={{
                            fontSize: '10px',
                            fontWeight: isActive ? '600' : '500',
                            color: isActive ? item.color : '#606070',
                            transition: 'all 0.3s ease',
                            letterSpacing: '0.3px'
                        }}>
                            {item.label}
                        </span>

                        {/* Active dot indicator */}
                        {isActive && (
                            <div style={{
                                position: 'absolute',
                                bottom: '2px',
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: item.color,
                                boxShadow: `0 0 8px ${item.color}`
                            }} />
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default BottomNav;
