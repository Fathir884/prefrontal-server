import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCw, Trophy, Grid, Zap, Brain, X, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MemoryMatrix = () => {
    const { user } = useAuth();

    // Game States
    const [gameState, setGameState] = useState('menu'); // menu, playing, won, lost
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);

    // Grid Logic
    const [gridSize, setGridSize] = useState(3); // Start with 3x3
    const [pattern, setPattern] = useState([]); // Array of indices
    const [userPattern, setUserPattern] = useState([]);
    const [showingPattern, setShowingPattern] = useState(false);

    useEffect(() => {
        if (gameState === 'playing') {
            startLevel();
        }
    }, [gameState, level]);

    const startLevel = async () => {
        // Reset turn
        setUserPattern([]);
        setShowingPattern(true);

        // Calculate difficulty
        // Level 1-2: 3x3 grid, 3-4 tiles
        // Level 3-5: 4x4 grid, 4-6 tiles
        // Level 6+: 5x5 grid, 5-8 tiles

        let newGridSize = 3;
        if (level >= 3) newGridSize = 4;
        if (level >= 6) newGridSize = 5;

        setGridSize(newGridSize);

        const tileCount = Math.min(newGridSize * newGridSize - 1, 3 + Math.floor(level / 2));

        // Generate random unique tiles
        const newPattern = [];
        while (newPattern.length < tileCount) {
            const index = Math.floor(Math.random() * (newGridSize * newGridSize));
            if (!newPattern.includes(index)) {
                newPattern.push(index);
            }
        }

        setPattern(newPattern);

        // Show pattern time depends on level (faster as you go, but consistent)
        setTimeout(() => {
            setShowingPattern(false);
        }, 1500); // 1.5s to memorize
    };

    const handleTileClick = (index) => {
        if (gameState !== 'playing' || showingPattern) return;

        // Prevent clicking same tile twice if not needed (logic depends on game variant, usually unique)
        if (userPattern.includes(index)) return;

        const newUserPattern = [...userPattern, index];
        setUserPattern(newUserPattern);

        // Check if Correct
        if (pattern.includes(index)) {
            // Correct tile
            if (newUserPattern.length === pattern.length) {
                // Level Complete
                setTimeout(() => {
                    setScore(s => s + (100 * level));
                    setLevel(l => l + 1);
                }, 500);
            }
        } else {
            // Wrong tile
            setLives(prev => prev - 1);

            // Visual feedback handled by render
            if (lives <= 1) {
                setTimeout(() => setGameState('lost'), 500);
            } else {
                // Retry level (optional: generate new pattern or keep same)
                setTimeout(() => {
                    setUserPattern([]);
                    setShowingPattern(true);
                    setTimeout(() => setShowingPattern(false), 1500);
                }, 1000);
            }
        }
    };

    const isCorrect = (index) => userPattern.includes(index) && pattern.includes(index);
    const isWrong = (index) => userPattern.includes(index) && !pattern.includes(index);
    const isRevealed = (index) => showingPattern && pattern.includes(index);

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            {gameState === 'menu' && (
                <div className="animate-fade-in">
                    <div style={{
                        width: '80px', height: '80px', margin: '0 auto 20px',
                        background: 'linear-gradient(135deg, #00D4FF, #00D26A)',
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(0, 212, 255, 0.4)'
                    }}>
                        <Brain size={40} color="#fff" />
                    </div>
                    <h2 className="title" style={{ fontSize: '28px', marginBottom: '10px' }}>Memory Matrix</h2>
                    <p style={{ color: '#888', marginBottom: '30px' }}>Memorize the pattern. Replay it accurately.</p>

                    <button
                        onClick={() => { setLevel(1); setScore(0); setLives(3); setGameState('playing'); }}
                        className="btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 'bold' }}
                    >
                        <Play size={20} style={{ marginRight: '8px' }} /> Start Game
                    </button>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#888' }}>High Score</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00D4FF' }}>2,450</div>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="animate-scale-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '0 10px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Level</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{level}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Score</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFD700' }}>{score}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Lives</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[...Array(3)].map((_, i) => (
                                    <Zap key={i} size={16} color={i < lives ? '#FF4757' : '#333'} fill={i < lives ? '#FF4757' : 'none'} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gap: '8px',
                        maxWidth: '350px',
                        margin: '0 auto',
                        aspectRatio: '1',
                        padding: '10px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {[...Array(gridSize * gridSize)].map((_, index) => (
                            <div
                                key={index}
                                onClick={() => handleTileClick(index)}
                                style={{
                                    backgroundColor: isRevealed(index) ? '#00D4FF'
                                        : isCorrect(index) ? '#00D26A'
                                            : isWrong(index) ? '#FF4757'
                                                : showingPattern ? '#1a1a2e' // Darker when showing to isolate pattern
                                                    : '#2a2a3e', // Default state
                                    borderRadius: '8px',
                                    border: isRevealed(index) ? '2px solid #fff' : '1px solid rgba(255,255,255,0.05)',
                                    cursor: showingPattern ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isRevealed(index) ? '0 0 15px rgba(0, 212, 255, 0.6)' : 'none',
                                    transform: isCorrect(index) ? 'scale(0.95)' : 'scale(1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {isCorrect(index) && <Check size={20} color="#fff" />}
                                {isWrong(index) && <X size={20} color="#fff" />}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', height: '20px', fontSize: '14px', color: '#888' }}>
                        {showingPattern ? 'Memorize pattern...' : 'Repeat the pattern!'}
                    </div>
                </div>
            )}

            {gameState === 'lost' && (
                <div className="animate-fade-in">
                    <div style={{ fontSize: '60px', marginBottom: '10px' }}>💀</div>
                    <h2 className="title" style={{ color: '#FF4757' }}>Game Over</h2>
                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '30px' }}>
                        You reached Level <span style={{ color: '#fff' }}>{level}</span>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '20px',
                        borderRadius: '16px',
                        marginBottom: '30px'
                    }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>Final Score</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFD700' }}>{score}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setGameState('menu')}
                            className="btn-secondary"
                            style={{ flex: 1, padding: '14px' }}
                        >
                            Menu
                        </button>
                        <button
                            onClick={() => { setLevel(1); setScore(0); setLives(3); setGameState('playing'); }}
                            className="btn-primary"
                            style={{ flex: 1, padding: '14px' }}
                        >
                            <RotateCw size={18} style={{ marginRight: '8px' }} /> Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ArcadePage = () => {
    const navigate = useNavigate();
    const [selectedGame, setSelectedGame] = useState(null); // 'memory' or null

    return (
        <div className="page-container animate-fade-in" style={{ paddingBottom: '120px' }}>
            {/* Header */}
            {!selectedGame && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                            padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="title" style={{ marginBottom: '5px', marginTop: 0 }}>Arcade Room</h1>
                        <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Train your brain with cognitive games.</p>
                    </div>
                </div>
            )}

            {/* Game Menu */}
            {!selectedGame && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Game 1: Memory Matrix */}
                    <div
                        onClick={() => setSelectedGame('memory')}
                        style={{
                            position: 'relative',
                            background: 'linear-gradient(145deg, rgba(20, 184, 166, 0.1), rgba(15, 23, 42, 0.6))',
                            border: '1px solid rgba(20, 184, 166, 0.3)',
                            borderRadius: '24px',
                            padding: '24px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                        className="active:scale-[0.98] hover:translate-y-[-2px]"
                    >
                        {/* Background Glow */}
                        <div style={{
                            position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px',
                            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)',
                            filter: 'blur(40px)', opacity: 0.6
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
                            {/* Icon Box */}
                            <div style={{
                                width: '80px', height: '80px',
                                background: 'linear-gradient(135deg, #2dd4bf, #0f766e)',
                                borderRadius: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(20, 184, 166, 0.3)',
                                flexShrink: 0
                            }}>
                                <Brain size={40} color="#fff" />
                            </div>

                            {/* Text Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                                        Memory Matrix
                                    </h3>
                                    <span style={{
                                        fontSize: '10px', fontWeight: '700',
                                        background: '#2dd4bf', color: '#0f172a',
                                        padding: '4px 8px', borderRadius: '12px'
                                    }}>
                                        POPULAR
                                    </span>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                                    Boost your working memory and pattern recognition skills.
                                </p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#2dd4bf',
                                padding: '10px 24px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}>
                                <Play size={16} fill="currentColor" /> PLAY NOW
                            </button>
                        </div>
                    </div>

                    {/* Game 2: Color Connect */}
                    <div
                        onClick={() => navigate('/arcade/color-connect')}
                        style={{
                            position: 'relative',
                            background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.1), rgba(15, 23, 42, 0.6))',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: '24px',
                            padding: '24px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                        className="active:scale-[0.98] hover:translate-y-[-2px]"
                    >
                        {/* Background Glow */}
                        <div style={{
                            position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px',
                            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                            filter: 'blur(40px)', opacity: 0.6
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
                            {/* Icon Box */}
                            <div style={{
                                width: '80px', height: '80px',
                                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                                borderRadius: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)',
                                flexShrink: 0
                            }}>
                                <Grid size={40} color="#fff" />
                            </div>

                            {/* Text Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                                        Color Connect
                                    </h3>
                                    <span style={{
                                        fontSize: '10px', fontWeight: '700',
                                        background: '#a855f7', color: '#fff',
                                        padding: '4px 8px', borderRadius: '12px'
                                    }}>
                                        NEW
                                    </span>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                                    Train spatial reasoning by connecting matching colors.
                                </p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#d8b4fe',
                                padding: '10px 24px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}>
                                <Play size={16} fill="currentColor" /> PLAY NOW
                            </button>
                        </div>
                    </div>

                    {/* Game 3: Card Match */}
                    <div
                        onClick={() => navigate('/arcade/card-match')}
                        style={{
                            position: 'relative',
                            background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1), rgba(15, 23, 42, 0.6))',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '24px',
                            padding: '24px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                        className="active:scale-[0.98] hover:translate-y-[-2px]"
                    >
                        {/* Background Glow */}
                        <div style={{
                            position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px',
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                            filter: 'blur(40px)', opacity: 0.6
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
                            {/* Icon Box */}
                            <div style={{
                                width: '80px', height: '80px',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                borderRadius: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
                                flexShrink: 0
                            }}>
                                <Zap size={40} color="#fff" />
                            </div>

                            {/* Text Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                                        Card Match
                                    </h3>
                                    <span style={{
                                        fontSize: '10px', fontWeight: '700',
                                        background: '#3b82f6', color: '#fff',
                                        padding: '4px 8px', borderRadius: '12px'
                                    }}>
                                        FOCUS
                                    </span>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                                    Find matching number pairs. Test your short-term memory speed.
                                </p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#93c5fd',
                                padding: '10px 24px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}>
                                <Play size={16} fill="currentColor" /> PLAY NOW
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Game: Memory Matrix */}
            {selectedGame === 'memory' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                        <button
                            onClick={() => setSelectedGame(null)}
                            style={{
                                background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                                padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="title" style={{ margin: 0 }}>Memory Matrix</h2>
                    </div>
                    <MemoryMatrix />
                </div>
            )}
        </div>
    );
};

export default ArcadePage;
