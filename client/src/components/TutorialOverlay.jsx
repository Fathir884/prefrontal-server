import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, User, ArrowRight, X, ArrowDown, ArrowUp } from 'lucide-react';
import './TutorialOverlay.css';

const STEPS = [
    {
        id: 'welcome',
        route: '/',
        title: 'Hello! I am Pref AI',
        description: 'Welcome to Prefrontal. I am your personal AI assistant designed to help you manage your second brain. Let me show you around!',
        targetId: null,
        position: 'center'
    },
    {
        id: 'home',
        route: '/',
        title: 'Your Dashboard (Cortex)',
        description: 'This is your command center. See your daily tasks, finance summary, and mental state at a glance.',
        targetId: 'nav-home',
        position: 'bottom-target'
    },
    {
        id: 'calendar',
        route: '/calendar',
        title: 'Time Management',
        description: 'Schedule your life here. Add events, tasks, and sync your focus.',
        targetId: 'nav-cal',
        position: 'bottom-target'
    },
    {
        id: 'finance',
        route: '/finance',
        title: 'Financial Cortex',
        description: 'Track your income and expenses securely. All data is encrypted locally.',
        targetId: 'nav-money',
        position: 'bottom-target'
    },
    {
        id: 'learning',
        route: '/learning',
        title: 'Focus & Learning',
        description: 'Use the Pomodoro timer and listen to spatial audio to enter deep flow states.',
        targetId: 'nav-learn',
        position: 'bottom-target'
    },
    {
        id: 'arcade',
        route: '/arcade',
        title: 'Arcade Room',
        description: 'Relax and train your brain with memory games in the Arcade.',
        targetId: 'nav-play',
        position: 'bottom-target'
    },
    {
        id: 'finish',
        route: '/',
        title: 'You are Ready!',
        description: 'That is the basics. I am always here if you need me (tap the robot icon). Go build your legacy!',
        targetId: null,
        position: 'center'
    }
];

const TutorialOverlay = () => {
    const [stepIndex, setStepIndex] = useState(-1);
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        // Check localstorage or listen for event
        const checkTutorial = () => {
            const hasSeen = localStorage.getItem('tutorial_completed_v1');
            const isReplied = sessionStorage.getItem('replay_tutorial');
            const isLoginPage = location.pathname === '/login';

            if ((!hasSeen || isReplied === 'true') && !isLoginPage) {
                if (stepIndex === -1) {
                    setStepIndex(0);
                    setIsVisible(true);
                    sessionStorage.removeItem('replay_tutorial');
                }
            }
        };

        checkTutorial();

        // Listener for manual trigger from Profile
        const startHandler = () => {
            setStepIndex(0);
            setIsVisible(true);
        };

        window.addEventListener('start-tutorial', startHandler);
        return () => window.removeEventListener('start-tutorial', startHandler);

    }, [location.pathname]);

    // Update target rect when step changes or resize
    useEffect(() => {
        if (stepIndex >= 0 && isVisible) {
            const step = STEPS[stepIndex];
            if (step.targetId) {
                // Tiny delay to ensure DOM is ready after navigation
                setTimeout(() => {
                    const el = document.getElementById(step.targetId);
                    if (el) {
                        setTargetRect(el.getBoundingClientRect());
                    } else {
                        setTargetRect(null);
                    }
                }, 300);
            } else {
                setTargetRect(null);
            }
        }
    }, [stepIndex, isVisible, location.pathname]);


    const handleNext = () => {
        const nextIndex = stepIndex + 1;
        if (nextIndex < STEPS.length) {
            const nextStep = STEPS[nextIndex];
            if (nextStep.route !== location.pathname) {
                navigate(nextStep.route);
            }
            setStepIndex(nextIndex);
        } else {
            localStorage.setItem('tutorial_completed_v1', 'true');
            setIsVisible(false);
            setStepIndex(-1);
            navigate('/');
        }
    };

    const handleSkip = () => {
        if (confirm("Skip the tutorial?")) {
            localStorage.setItem('tutorial_completed_v1', 'true');
            setIsVisible(false);
            setStepIndex(-1);
        }
    };

    if (!isVisible || stepIndex === -1) return null;

    const currentStep = STEPS[stepIndex];

    // Calculate position style
    let style = {};
    let arrowStyle = {};

    if (currentStep.position === 'center') {
        style = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    } else if (currentStep.position === 'bottom-target' && targetRect) {
        // Position above the target
        // Target is at bottom.
        style = {
            position: 'absolute',
            bottom: window.innerHeight - targetRect.top + 20 + 'px',
            left: '50%',
            transform: 'translateX(-50%)'
        };

        // Calculate arrow position relative to card (which is centered)
        // The target might be offset from center.
        // But nav is centered.
        // Wait, nav items are distributed.
        // We want the CARD centered, but the ARROW pointing to target.
        // targetRect.left + width/2 is the center of target.
        // card is centered at 50% screen width.
        // center of screen
        const centerX = window.innerWidth / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const offset = targetCenterX - centerX;

        arrowStyle = {
            left: `calc(50% + ${offset}px)`
        };
    } else {
        // Fallback
        style = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    return (
        <div className="tutorial-overlay">
            {/* Target Highlight Ring if needed, or just Arrow */}

            <div className="tutorial-card glass-panel" style={style}>
                {/* Arrow */}
                {currentStep.targetId && targetRect && (
                    <div className="tutorial-arrow" style={arrowStyle}>
                        <ArrowDown size={32} className="arrow-icon" color="#8b5cf6" />
                    </div>
                )}

                <div className="tutorial-header">
                    <div className="ai-avatar-glow">
                        <Bot size={32} color="#8b5cf6" />
                    </div>
                    <h4>Pref AI</h4>
                    <button onClick={handleSkip} className="skip-btn"><X size={16} /></button>
                </div>

                <div className="tutorial-body">
                    <h3>{currentStep.title}</h3>
                    <p>{currentStep.description}</p>
                </div>

                <div className="tutorial-footer">
                    <div className="step-dots">
                        {STEPS.map((_, idx) => (
                            <span key={idx} className={`dot ${idx === stepIndex ? 'active' : ''}`}></span>
                        ))}
                    </div>
                    <button onClick={handleNext} className="btn-next">
                        {stepIndex === STEPS.length - 1 ? 'Start Journey' : 'Next'} <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
