import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Volume2, VolumeX, Play, Pause, CloudRain, Trees,
    Waves, Coffee, Wind, Music, Flame, Bird, Moon,
    ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

// Ambient Sound Generator using Web Audio API
const createAmbientSound = (audioContext, type) => {
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0;

    let nodes = [];

    switch (type) {
        case 'rain':
            // Brown noise for rain
            const rainBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
            const rainData = rainBuffer.getChannelData(0);
            let lastOut = 0.0;
            for (let i = 0; i < rainBuffer.length; i++) {
                const white = Math.random() * 2 - 1;
                rainData[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = rainData[i];
                rainData[i] *= 3.5;
            }
            const rainSource = audioContext.createBufferSource();
            rainSource.buffer = rainBuffer;
            rainSource.loop = true;

            const rainFilter = audioContext.createBiquadFilter();
            rainFilter.type = 'lowpass';
            rainFilter.frequency.value = 400;

            rainSource.connect(rainFilter);
            rainFilter.connect(gainNode);
            nodes.push({ source: rainSource, filter: rainFilter });
            break;

        case 'forest':
            // Pink noise for forest ambience
            const forestBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
            const forestData = forestBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < forestBuffer.length; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                forestData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                forestData[i] *= 0.11;
                b6 = white * 0.115926;
            }
            const forestSource = audioContext.createBufferSource();
            forestSource.buffer = forestBuffer;
            forestSource.loop = true;

            const forestFilter = audioContext.createBiquadFilter();
            forestFilter.type = 'bandpass';
            forestFilter.frequency.value = 800;
            forestFilter.Q.value = 0.5;

            forestSource.connect(forestFilter);
            forestFilter.connect(gainNode);
            nodes.push({ source: forestSource, filter: forestFilter });
            break;

        case 'ocean':
            // Modulated noise for ocean waves
            const oceanBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 4, audioContext.sampleRate);
            const oceanData = oceanBuffer.getChannelData(0);
            for (let i = 0; i < oceanBuffer.length; i++) {
                const wave = Math.sin(i / (audioContext.sampleRate * 0.5)) * 0.5 + 0.5;
                const noise = (Math.random() * 2 - 1) * 0.3;
                oceanData[i] = noise * wave;
            }
            const oceanSource = audioContext.createBufferSource();
            oceanSource.buffer = oceanBuffer;
            oceanSource.loop = true;

            const oceanFilter = audioContext.createBiquadFilter();
            oceanFilter.type = 'lowpass';
            oceanFilter.frequency.value = 500;

            oceanSource.connect(oceanFilter);
            oceanFilter.connect(gainNode);
            nodes.push({ source: oceanSource, filter: oceanFilter });
            break;

        case 'cafe':
            // Filtered noise for cafe ambience
            const cafeBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
            const cafeData = cafeBuffer.getChannelData(0);
            for (let i = 0; i < cafeBuffer.length; i++) {
                cafeData[i] = (Math.random() * 2 - 1) * 0.15;
                // Add some random "chatter" spikes
                if (Math.random() > 0.9995) {
                    cafeData[i] *= 3;
                }
            }
            const cafeSource = audioContext.createBufferSource();
            cafeSource.buffer = cafeBuffer;
            cafeSource.loop = true;

            const cafeFilter = audioContext.createBiquadFilter();
            cafeFilter.type = 'bandpass';
            cafeFilter.frequency.value = 1000;
            cafeFilter.Q.value = 0.3;

            cafeSource.connect(cafeFilter);
            cafeFilter.connect(gainNode);
            nodes.push({ source: cafeSource, filter: cafeFilter });
            break;

        case 'wind':
            // Modulated white noise for wind
            const windBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
            const windData = windBuffer.getChannelData(0);
            for (let i = 0; i < windBuffer.length; i++) {
                const mod = Math.sin(i / (audioContext.sampleRate * 2)) * 0.4 + 0.6;
                windData[i] = (Math.random() * 2 - 1) * mod * 0.3;
            }
            const windSource = audioContext.createBufferSource();
            windSource.buffer = windBuffer;
            windSource.loop = true;

            const windFilter = audioContext.createBiquadFilter();
            windFilter.type = 'highpass';
            windFilter.frequency.value = 200;

            windSource.connect(windFilter);
            windFilter.connect(gainNode);
            nodes.push({ source: windSource, filter: windFilter });
            break;

        case 'fireplace':
            // Crackling fire sound
            const fireBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
            const fireData = fireBuffer.getChannelData(0);
            for (let i = 0; i < fireBuffer.length; i++) {
                const base = (Math.random() * 2 - 1) * 0.1;
                // Add crackles
                if (Math.random() > 0.998) {
                    fireData[i] = (Math.random() - 0.5) * 0.8;
                } else {
                    fireData[i] = base;
                }
            }
            const fireSource = audioContext.createBufferSource();
            fireSource.buffer = fireBuffer;
            fireSource.loop = true;

            const fireFilter = audioContext.createBiquadFilter();
            fireFilter.type = 'lowpass';
            fireFilter.frequency.value = 2000;

            fireSource.connect(fireFilter);
            fireFilter.connect(gainNode);
            nodes.push({ source: fireSource, filter: fireFilter });
            break;

        case 'birds':
            // High frequency chirps
            const birdsBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 4, audioContext.sampleRate);
            const birdsData = birdsBuffer.getChannelData(0);
            for (let i = 0; i < birdsBuffer.length; i++) {
                birdsData[i] = 0;
                // Random bird chirps
                if (Math.random() > 0.9998) {
                    for (let j = 0; j < 500 && (i + j) < birdsBuffer.length; j++) {
                        const freq = 2000 + Math.random() * 2000;
                        birdsData[i + j] = Math.sin(j * freq / audioContext.sampleRate * Math.PI * 2) *
                            Math.exp(-j / 100) * 0.3;
                    }
                }
            }
            const birdsSource = audioContext.createBufferSource();
            birdsSource.buffer = birdsBuffer;
            birdsSource.loop = true;

            birdsSource.connect(gainNode);
            nodes.push({ source: birdsSource });
            break;

        case 'night':
            // Crickets and night sounds
            const nightBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
            const nightData = nightBuffer.getChannelData(0);
            for (let i = 0; i < nightBuffer.length; i++) {
                // Base ambience
                nightData[i] = (Math.random() * 2 - 1) * 0.02;
                // Cricket chirps
                const cricketFreq = 4000;
                const cricketMod = Math.sin(i / (audioContext.sampleRate * 0.1)) > 0.8 ? 1 : 0;
                nightData[i] += Math.sin(i * cricketFreq / audioContext.sampleRate * Math.PI * 2) * 0.05 * cricketMod;
            }
            const nightSource = audioContext.createBufferSource();
            nightSource.buffer = nightBuffer;
            nightSource.loop = true;

            nightSource.connect(gainNode);
            nodes.push({ source: nightSource });
            break;

        default:
            // White noise fallback
            const defaultBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
            const defaultData = defaultBuffer.getChannelData(0);
            for (let i = 0; i < defaultBuffer.length; i++) {
                defaultData[i] = (Math.random() * 2 - 1) * 0.2;
            }
            const defaultSource = audioContext.createBufferSource();
            defaultSource.buffer = defaultBuffer;
            defaultSource.loop = true;
            defaultSource.connect(gainNode);
            nodes.push({ source: defaultSource });
    }

    return { gainNode, nodes };
};

const AMBIENT_SOUNDS = [
    { id: 'rain', name: 'Rain', icon: CloudRain, color: '#00D4FF', description: 'Gentle rainfall' },
    { id: 'birds', name: 'Birds', icon: Bird, color: '#A855F7', description: 'Bird songs' },
    { id: 'forest', name: 'Forest', icon: Trees, color: '#22C55E', description: 'Peaceful forest' },
    { id: 'ocean', name: 'Ocean', icon: Waves, color: '#0EA5E9', description: 'Ocean waves' },
    { id: 'cafe', name: 'Café', icon: Coffee, color: '#D97706', description: 'Coffee shop ambience' },
    { id: 'wind', name: 'Wind', icon: Wind, color: '#94A3B8', description: 'Gentle breeze' },
    { id: 'fireplace', name: 'Fire', icon: Flame, color: '#F97316', description: 'Crackling fire' },
    { id: 'night', name: 'Night', icon: Moon, color: '#6366F1', description: 'Night sounds' }
];

const FocusSounds = ({ compact = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeSounds, setActiveSounds] = useState({});
    const [volumes, setVolumes] = useState({});
    const [masterVolume, setMasterVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);

    const audioContextRef = useRef(null);
    const soundNodesRef = useRef({});

    // Initialize Audio Context
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    }, []);

    // Toggle individual sound
    const toggleSound = useCallback((soundId) => {
        const audioContext = initAudioContext();

        if (activeSounds[soundId]) {
            // Stop sound
            if (soundNodesRef.current[soundId]) {
                const { gainNode, nodes } = soundNodesRef.current[soundId];
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
                setTimeout(() => {
                    nodes.forEach(n => {
                        try { n.source.stop(); } catch (e) { }
                    });
                    delete soundNodesRef.current[soundId];
                }, 600);
            }
            setActiveSounds(prev => ({ ...prev, [soundId]: false }));
        } else {
            // Start sound
            const soundNodes = createAmbientSound(audioContext, soundId);
            soundNodesRef.current[soundId] = soundNodes;

            const vol = (volumes[soundId] || 0.5) * masterVolume * (isMuted ? 0 : 1);
            soundNodes.gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            soundNodes.gainNode.gain.linearRampToValueAtTime(vol, audioContext.currentTime + 0.5);

            soundNodes.nodes.forEach(n => n.source.start());
            setActiveSounds(prev => ({ ...prev, [soundId]: true }));

            // Initialize volume if not set
            if (!volumes[soundId]) {
                setVolumes(prev => ({ ...prev, [soundId]: 0.5 }));
            }
        }
    }, [activeSounds, volumes, masterVolume, isMuted, initAudioContext]);

    // Update volume for a specific sound
    const updateVolume = useCallback((soundId, value) => {
        setVolumes(prev => ({ ...prev, [soundId]: value }));

        if (soundNodesRef.current[soundId] && audioContextRef.current) {
            const vol = value * masterVolume * (isMuted ? 0 : 1);
            soundNodesRef.current[soundId].gainNode.gain.linearRampToValueAtTime(
                vol,
                audioContextRef.current.currentTime + 0.1
            );
        }
    }, [masterVolume, isMuted]);

    // Update master volume
    useEffect(() => {
        Object.keys(activeSounds).forEach(soundId => {
            if (activeSounds[soundId] && soundNodesRef.current[soundId] && audioContextRef.current) {
                const vol = (volumes[soundId] || 0.5) * masterVolume * (isMuted ? 0 : 1);
                soundNodesRef.current[soundId].gainNode.gain.linearRampToValueAtTime(
                    vol,
                    audioContextRef.current.currentTime + 0.1
                );
            }
        });
    }, [masterVolume, isMuted, activeSounds, volumes]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(soundNodesRef.current).forEach(({ nodes }) => {
                nodes.forEach(n => {
                    try { n.source.stop(); } catch (e) { }
                });
            });
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const activeCount = Object.values(activeSounds).filter(Boolean).length;

    // Compact mode for embedding in other components
    if (compact) {
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#fff'
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: activeCount > 0
                            ? 'linear-gradient(135deg, #A855F7, #EC4899)'
                            : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Music size={16} color={activeCount > 0 ? '#fff' : '#888'} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>Focus Sounds</div>
                        <div style={{ fontSize: '11px', color: '#888' }}>
                            {activeCount > 0 ? `${activeCount} sound${activeCount > 1 ? 's' : ''} playing` : 'Tap to add ambience'}
                        </div>
                    </div>
                    {activeCount > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            {isMuted ? <VolumeX size={14} color="#FF4757" /> : <Volume2 size={14} color="#00D26A" />}
                        </button>
                    )}
                    {isExpanded ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                    <div style={{ padding: '0 14px 14px' }}>
                        {/* Sound Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px',
                            marginBottom: '12px'
                        }}>
                            {AMBIENT_SOUNDS.map(sound => (
                                <button
                                    key={sound.id}
                                    onClick={() => toggleSound(sound.id)}
                                    style={{
                                        padding: '10px 6px',
                                        borderRadius: '10px',
                                        border: activeSounds[sound.id]
                                            ? `2px solid ${sound.color}`
                                            : '1px solid rgba(255, 255, 255, 0.1)',
                                        background: activeSounds[sound.id]
                                            ? `${sound.color}20`
                                            : 'rgba(255, 255, 255, 0.03)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <sound.icon
                                        size={18}
                                        color={activeSounds[sound.id] ? sound.color : '#888'}
                                    />
                                    <span style={{
                                        fontSize: '9px',
                                        color: activeSounds[sound.id] ? sound.color : '#888',
                                        fontWeight: activeSounds[sound.id] ? '600' : '400'
                                    }}>
                                        {sound.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Volume sliders for active sounds */}
                        {activeCount > 0 && (
                            <div style={{ marginTop: '8px' }}>
                                {/* Master volume */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px',
                                    padding: '8px 10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '8px'
                                }}>
                                    <Volume2 size={14} color="#888" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={masterVolume}
                                        onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                                        style={{
                                            flex: 1,
                                            height: '4px',
                                            accentColor: '#A855F7',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <span style={{ fontSize: '11px', color: '#888', width: '30px' }}>
                                        {Math.round(masterVolume * 100)}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Full page/card mode
    return (
        <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
            }}>
                <h2 className="subtitle" style={{
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Music size={18} color="#A855F7" />
                    </div>
                    Focus Sounds
                    {activeCount > 0 && (
                        <span style={{
                            background: '#A855F7',
                            color: '#fff',
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: '600'
                        }}>
                            {activeCount} active
                        </span>
                    )}
                </h2>

                {activeCount > 0 && (
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        style={{
                            background: isMuted ? 'rgba(255, 71, 87, 0.2)' : 'rgba(0, 210, 106, 0.2)',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        {isMuted ? <VolumeX size={18} color="#FF4757" /> : <Volume2 size={18} color="#00D26A" />}
                    </button>
                )}
            </div>

            <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                Mix ambient sounds to create your perfect focus environment ✨
            </p>

            {/* Sound Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '20px'
            }}>
                {AMBIENT_SOUNDS.map(sound => (
                    <button
                        key={sound.id}
                        onClick={() => toggleSound(sound.id)}
                        style={{
                            padding: '16px 8px',
                            borderRadius: '14px',
                            border: activeSounds[sound.id]
                                ? `2px solid ${sound.color}`
                                : '1px solid rgba(255, 255, 255, 0.1)',
                            background: activeSounds[sound.id]
                                ? `linear-gradient(135deg, ${sound.color}30, ${sound.color}10)`
                                : 'rgba(255, 255, 255, 0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {activeSounds[sound.id] && (
                            <div style={{
                                position: 'absolute',
                                top: '-20%',
                                right: '-20%',
                                width: '40px',
                                height: '40px',
                                background: `radial-gradient(circle, ${sound.color}40 0%, transparent 70%)`,
                                borderRadius: '50%'
                            }} />
                        )}
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: activeSounds[sound.id]
                                ? `${sound.color}30`
                                : 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}>
                            <sound.icon
                                size={20}
                                color={activeSounds[sound.id] ? sound.color : '#666'}
                            />
                        </div>
                        <span style={{
                            fontSize: '11px',
                            color: activeSounds[sound.id] ? sound.color : '#888',
                            fontWeight: activeSounds[sound.id] ? '600' : '400'
                        }}>
                            {sound.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Volume Controls */}
            {activeCount > 0 && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <div style={{
                        fontSize: '12px',
                        color: '#888',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Sparkles size={14} color="#FFD700" />
                        Volume Mixer
                    </div>

                    {/* Master Volume */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px',
                        padding: '10px 12px',
                        background: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: '10px'
                    }}>
                        <Volume2 size={16} color="#A855F7" />
                        <span style={{ fontSize: '12px', color: '#A855F7', width: '50px', fontWeight: '600' }}>Master</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={masterVolume}
                            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                            style={{
                                flex: 1,
                                height: '6px',
                                accentColor: '#A855F7',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ fontSize: '12px', color: '#A855F7', width: '35px', textAlign: 'right' }}>
                            {Math.round(masterVolume * 100)}%
                        </span>
                    </div>

                    {/* Individual sound volumes */}
                    {AMBIENT_SOUNDS.filter(s => activeSounds[s.id]).map(sound => (
                        <div
                            key={sound.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '8px'
                            }}
                        >
                            <sound.icon size={14} color={sound.color} />
                            <span style={{ fontSize: '12px', color: '#888', width: '50px' }}>{sound.name}</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volumes[sound.id] || 0.5}
                                onChange={(e) => updateVolume(sound.id, parseFloat(e.target.value))}
                                style={{
                                    flex: 1,
                                    height: '4px',
                                    accentColor: sound.color,
                                    cursor: 'pointer'
                                }}
                            />
                            <span style={{ fontSize: '11px', color: '#666', width: '35px', textAlign: 'right' }}>
                                {Math.round((volumes[sound.id] || 0.5) * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FocusSounds;
