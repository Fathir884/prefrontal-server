import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Info, Maximize2 } from 'lucide-react';

const LEVELS = [
    {
        id: 1,
        size: 5,
        dots: [
            // Level 1: "Diagonal Slide" (4 Colors)
            // All dots allow a smooth diagonal path from Top-Leftish to Bottom-Rightish
            { r: 0, c: 0, color: '#ef4444' }, { r: 4, c: 1, color: '#ef4444' }, // Red (Shift +1)
            { r: 0, c: 1, color: '#3b82f6' }, { r: 4, c: 2, color: '#3b82f6' }, // Blue (Shift +1)
            { r: 0, c: 2, color: '#fbbf24' }, { r: 4, c: 3, color: '#fbbf24' }, // Yellow (Shift +1)
            { r: 0, c: 3, color: '#22c55e' }, { r: 4, c: 4, color: '#22c55e' }, // Green (Shift +1)
            // Col 4 Top and Col 0 Bottom are empty buffers
        ]
    },
    {
        id: 2,
        size: 6,
        dots: [
            // Level 2: "The Twist" (5 Colors)
            // Pairs swap columns. Needs S-shapes.
            { r: 0, c: 0, color: '#ef4444' }, { r: 5, c: 1, color: '#ef4444' }, // Red (0 -> 1)
            { r: 0, c: 1, color: '#3b82f6' }, { r: 5, c: 0, color: '#3b82f6' }, // Blue (1 -> 0) SWAP!

            { r: 0, c: 3, color: '#fbbf24' }, { r: 5, c: 4, color: '#fbbf24' }, // Yellow (3 -> 4)
            { r: 0, c: 4, color: '#22c55e' }, { r: 5, c: 3, color: '#22c55e' }, // Green (4 -> 3) SWAP!

            { r: 2, c: 2, color: '#a855f7' }, { r: 3, c: 2, color: '#a855f7' }, // Purple (Center Divider)
        ]
    },
    {
        id: 3,
        size: 7,
        dots: [
            // Level 3: "Triple Braid" (6 Colors)
            // 3 Pairs twisting around each other.
            { r: 0, c: 0, color: '#ef4444' }, { r: 6, c: 1, color: '#ef4444' }, // Red
            { r: 0, c: 1, color: '#f97316' }, { r: 6, c: 0, color: '#f97316' }, // Orange

            { r: 0, c: 2, color: '#fbbf24' }, { r: 6, c: 3, color: '#fbbf24' }, // Yellow
            { r: 0, c: 3, color: '#22c55e' }, { r: 6, c: 2, color: '#22c55e' }, // Green

            { r: 0, c: 4, color: '#3b82f6' }, { r: 6, c: 5, color: '#3b82f6' }, // Blue
            { r: 0, c: 5, color: '#a855f7' }, { r: 6, c: 4, color: '#a855f7' }, // Purple

            // Col 6 is the safety valve / empty lane
        ]
    }
];

const ColorConnect = () => {
    const navigate = useNavigate();
    const [levelIndex, setLevelIndex] = useState(0);
    const [paths, setPaths] = useState({});
    const [activeColor, setActiveColor] = useState(null);
    const [isComplete, setIsComplete] = useState(false);

    // We store touch start element to prevent scrolling
    const gridRef = useRef(null);

    const currentLevel = LEVELS[levelIndex];
    const gridSize = currentLevel.size;

    // Helper: Check if cell has a dot
    const getDot = (r, c) => currentLevel.dots.find(d => d.r === r && d.c === c);

    // Helper: Get path info for a cell
    const getPathInfo = (r, c) => {
        for (const [color, path] of Object.entries(paths)) {
            const index = path.findIndex(p => p.r === r && p.c === c);
            if (index !== -1) {
                // Check connections
                const prev = path[index - 1];
                const next = path[index + 1];
                return { color, index, prev, next };
            }
        }
        return null;
    };

    const handleStart = (r, c) => {
        if (isComplete) return;

        const dot = getDot(r, c);
        const pathData = getPathInfo(r, c);

        // Case 1: Start from a dot
        if (dot) {
            setActiveColor(dot.color);
            setPaths(prev => ({
                ...prev,
                [dot.color]: [{ r, c }] // Start new path
            }));
            return;
        }

        // Case 2: Continue from broken/existing path
        if (pathData) {
            setActiveColor(pathData.color);
            // Slice path to restart from this point
            const existingPath = paths[pathData.color];
            setPaths(prev => ({
                ...prev,
                [pathData.color]: existingPath.slice(0, pathData.index + 1)
            }));
        }
    };

    const handleMove = (e) => {
        if (!activeColor || isComplete) return;

        // Normalize coordinates for Touch vs Mouse
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            // Only process mouse move if button is held down
            if (e.buttons !== 1) return;
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // MATH-BASED CALCULATION (Faster & More Accurate than elementFromPoint)
        const rect = gridRef.current.getBoundingClientRect();

        // 1. Check if we are inside the grid bounds with a small buffer
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
            return;
        }

        // 2. Calculate relative position
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // 3. Determine Row & Col
        // We know width/height and gridSize
        const cellSize = rect.width / gridSize;
        const c = Math.floor(x / cellSize);
        const r = Math.floor(y / cellSize);

        // Security check for array bounds
        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;

        // --- GAME LOGIC (UNCHANGED) ---
        const currentPath = paths[activeColor] || [];
        const lastPos = currentPath[currentPath.length - 1];

        // Ensure we moved to a new cell
        if (lastPos && lastPos.r === r && lastPos.c === c) return;

        // Ensure adjacent move (Manhattan distance === 1)
        // Note: Math approach allows diagonal if we are not careful, strictly enforce adjacency
        if (lastPos) {
            const diff = Math.abs(lastPos.r - r) + Math.abs(lastPos.c - c);
            if (diff !== 1) return; // Ignore jumps or diagonals
        }

        const pathData = getPathInfo(r, c);
        const dot = getDot(r, c);

        // 1. Hit own path (backtracking)
        if (pathData && pathData.color === activeColor) {
            setPaths(prev => ({
                ...prev,
                [activeColor]: prev[activeColor].slice(0, pathData.index + 1)
            }));
            return;
        }

        // 2. Blocked by others
        if ((pathData && pathData.color !== activeColor) || (dot && dot.color !== activeColor)) return;

        // 3. Complete Path
        if (dot && dot.color === activeColor) {
            setPaths(prev => ({
                ...prev,
                [activeColor]: [...prev[activeColor], { r, c }]
            }));
            setActiveColor(null);
            checkWin();
            return;
        }

        // 4. Extend Path
        setPaths(prev => ({
            ...prev,
            [activeColor]: [...(prev[activeColor] || []), { r, c }]
        }));
    };

    const handleEnd = () => {
        setActiveColor(null);
        checkWin();
    };

    const checkWin = () => {
        setTimeout(() => {
            const colors = new Set(currentLevel.dots.map(d => d.color));
            let allConnected = true;

            colors.forEach(color => {
                const path = paths[color];
                if (!path || path.length < 2) {
                    allConnected = false;
                    return;
                }
                const start = path[0];
                const end = path[path.length - 1];

                const startDot = getDot(start.r, start.c);
                const endDot = getDot(end.r, end.c);

                if (!startDot || !endDot || startDot.color !== color || endDot.color !== color) {
                    allConnected = false;
                }
            });

            // Also check if grid is mostly filled (optional rule, but good for "Flow")
            if (allConnected) {
                setIsComplete(true);
            }
        }, 100);
    };

    const nextLevel = () => {
        if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1);
            setPaths({});
            setIsComplete(false);
        } else {
            alert("All levels completed! Back to start.");
            setLevelIndex(0);
            setPaths({});
            setIsComplete(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0f172a',
            color: 'white',
            fontFamily: 'sans-serif',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header - Fixed Height & Flex Layout */}
            <div style={{
                height: '60px',
                padding: '0 20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                position: 'fixed',
                top: 0, left: 0, right: 0,
                zIndex: 50
            }}>
                <button onClick={() => navigate('/arcade')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <span style={{ fontSize: '18px', fontWeight: 'bold', background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Color Connect
                </span>
                <button onClick={() => { setPaths({}); setIsComplete(false); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Main Content Center */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '60px' // Offset for fixed header
            }}>

                {/* Level Indicator */}
                <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                        Level {levelIndex + 1}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                        {LEVELS.map((_, i) => (
                            <div key={i} style={{ width: '20px', height: '100%', borderRadius: '2px', backgroundColor: i <= levelIndex ? '#a855f7' : '#334155' }} />
                        ))}
                    </div>
                </div>

                {/* VISIBLE GRID BOARD */}
                <div
                    ref={gridRef}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gap: '6px', // Visual gap
                        // Responsive Sizing: Use min() to fit either width or height safely
                        width: 'min(90vw, 50vh)',
                        height: 'min(90vw, 50vh)',
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        padding: '8px',
                        borderRadius: '16px',
                        border: '1px solid #334155',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                        touchAction: 'none', // VITAL: Prevents scroll whilst playing
                        userSelect: 'none'
                    }}
                    // Add listeners to CONTAINER, so we track moves anywhere inside it
                    onMouseLeave={handleEnd}
                    onMouseUp={handleEnd}
                    onTouchEnd={handleEnd}
                    onTouchMove={handleMove}
                    onMouseMove={handleMove}
                >
                    {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                        const r = Math.floor(i / gridSize);
                        const c = i % gridSize;
                        const dot = getDot(r, c);
                        const pathData = getPathInfo(r, c);
                        const color = pathData?.color || dot?.color;

                        const isTop = pathData?.prev?.r === r - 1 || pathData?.next?.r === r - 1;
                        const isBottom = pathData?.prev?.r === r + 1 || pathData?.next?.r === r + 1;
                        const isLeft = pathData?.prev?.c === c - 1 || pathData?.next?.c === c - 1;
                        const isRight = pathData?.prev?.c === c + 1 || pathData?.next?.c === c + 1;

                        return (
                            <div
                                key={i}
                                data-r={r}
                                data-c={c}
                                className="grid-cell"
                                style={{
                                    backgroundColor: '#1e293b',
                                    borderRadius: '6px',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                                onMouseDown={() => handleStart(r, c)}
                                onMouseEnter={(e) => { if (e.buttons === 1) handleMove(e) }}
                                onTouchStart={(e) => { handleStart(r, c); }}
                            >
                                {pathData && (
                                    <>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40%', height: '40%', backgroundColor: color, zIndex: 10 }} />
                                        {isTop && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: '50%', backgroundColor: color }} />}
                                        {isBottom && <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: '50%', backgroundColor: color }} />}
                                        {isLeft && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '50%', height: '40%', backgroundColor: color }} />}
                                        {isRight && <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: '50%', height: '40%', backgroundColor: color }} />}
                                        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, filter: 'blur(4px)', backgroundColor: color }} />
                                    </>
                                )}

                                {dot && (
                                    <div
                                        style={{
                                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                            width: '65%', height: '65%', borderRadius: '50%', zIndex: 20,
                                            backgroundColor: dot.color,
                                            boxShadow: `0 0 10px ${dot.color}`
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: '30px', color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} />
                    <span>Slide smoothly to connect dots</span>
                </div>

                {isComplete && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                    }} className="animate-fade-in">
                        <div style={{
                            backgroundColor: '#0f172a', border: '1px solid #a855f7', borderRadius: '24px',
                            padding: '30px', width: '100%', maxWidth: '300px', textAlign: 'center', boxShadow: '0 0 50px rgba(168, 85, 247, 0.2)'
                        }} className="animate-scale-in">
                            <div style={{ fontSize: '64px', marginBottom: '10px' }}>🏆</div>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Level Complete!</h2>
                            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Great focus.</p>
                            <button
                                onClick={nextLevel}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '12px',
                                    border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
                                    backgroundColor: 'white', color: '#0f172a'
                                }}
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

export default ColorConnect;
