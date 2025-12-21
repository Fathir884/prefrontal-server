import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Brain, Zap } from 'lucide-react';

const LEVEL_CONFIG = {
    1: { grid: 4, pairs: 8, time: 3000 },    // 4x4, 3s preview
    2: { grid: 4, pairs: 8, time: 2000 },    // 4x4, 2s preview
    3: { grid: 6, pairs: 18, time: 4000 },    // 6x6, 4s preview (Hardcore)
};

const CardMatch = () => {
    const navigate = useNavigate();
    const [level, setLevel] = useState(1);
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]); // Indexes of currently flipped cards (max 2)
    const [matched, setMatched] = useState([]); // IDs of matched numbers
    const [isGameActive, setIsGameActive] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);

    // Initialize Game
    useEffect(() => {
        startLevel(level);
    }, [level]);

    const startLevel = (lvl) => {
        const config = LEVEL_CONFIG[lvl] || LEVEL_CONFIG[1];
        const totalCards = config.pairs * 2;

        // Generate pairs
        let numbers = [];
        for (let i = 1; i <= config.pairs; i++) {
            numbers.push(i);
            numbers.push(i);
        }

        // Shuffle
        numbers = numbers.sort(() => Math.random() - 0.5);

        setCards(numbers);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setIsWon(false);
        setIsGameActive(false);
        setIsPreview(true);

        // Preview Phase
        setTimeout(() => {
            setIsPreview(false);
            setIsGameActive(true);
        }, config.time);
    };

    const handleCardClick = (index) => {
        if (!isGameActive || isPreview) return;
        if (flipped.length >= 2) return;
        if (flipped.includes(index)) return; // Can't click same card
        if (matched.includes(cards[index])) return; // Can't click matched card

        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const firstIndex = newFlipped[0];
            const secondIndex = newFlipped[1];

            if (cards[firstIndex] === cards[secondIndex]) {
                // Match!
                setMatched(prev => [...prev, cards[firstIndex]]);
                setFlipped([]);

                // Check Win
                if (matched.length + 1 === cards.length / 2) {
                    setTimeout(() => setIsWon(true), 500);
                }
            } else {
                // No Match - Flip back after delay
                setTimeout(() => {
                    setFlipped([]);
                }, 1000);
            }
        }
    };

    const nextLevel = () => {
        if (level < 3) {
            setLevel(l => l + 1);
        } else {
            // Loop or restart
            setLevel(1);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0f172a',
            color: 'white',
            fontFamily: 'sans-serif',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                height: '60px',
                padding: '0 20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50
            }}>
                <button onClick={() => navigate('/arcade')} style={{ background: 'none', border: 'none', color: '#94a3b8' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Brain size={20} className="text-cyan-400" />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Card Match</span>
                </div>
                <button onClick={() => startLevel(level)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}>
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Game Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '80px',
                paddingBottom: '20px'
            }}>
                {/* Stats */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trophy size={16} className="text-yellow-400" />
                        <span>Level {level}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={16} className="text-blue-400" />
                        <span>Moves: {moves}</span>
                    </div>
                </div>

                {/* Status Text */}
                <div style={{ height: '30px', marginBottom: '10px', color: '#38bdf8', fontWeight: 'bold', fontSize: '18px' }}>
                    {isPreview ? 'Memorize!' : isWon ? 'Excellent!' : 'Find Pairs'}
                </div>

                {/* GRID */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${level === 3 ? 6 : 4}, 1fr)`,
                    gap: '10px',
                    width: '90vw',
                    maxWidth: '400px',
                    aspectRatio: level === 3 ? '1/1' : '1/1',
                }}>
                    {cards.map((num, i) => {
                        const isFlipped = isPreview || flipped.includes(i) || matched.includes(num);
                        const isSolved = matched.includes(num);

                        return (
                            <div
                                key={i}
                                onClick={() => handleCardClick(i)}
                                style={{
                                    backgroundColor: isFlipped
                                        ? (isSolved ? '#22c55e' : '#3b82f6') // Green if solved, Blue if flipped
                                        : '#1e293b', // Dark Slate if face down
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    transition: 'transform 0.3s, background-color 0.3s',
                                    boxShadow: isFlipped ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none',
                                    border: isFlipped ? '2px solid rgba(255,255,255,0.2)' : '1px solid #334155'
                                }}
                            >
                                <div style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}>
                                    {isFlipped ? num : '?'}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Win Overlay Modal */}
                {isWon && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div style={{
                            backgroundColor: '#1e293b',
                            padding: '40px',
                            borderRadius: '24px',
                            textAlign: 'center',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            transform: 'scale(1)',
                            animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🏆</div>
                            <h2 style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Level {level} Complete!
                            </h2>
                            <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '18px' }}>
                                Start Memory Sync: {moves} moves
                            </p>
                            <button
                                onClick={nextLevel}
                                style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    padding: '16px 40px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                Next Level
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardMatch;
