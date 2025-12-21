import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Download, Shield, Zap, Target, Brain, Wallet, Gamepad2, User, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateModulePDF } from '../utils/reportGenerator';

const ModulePage = () => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            await generateModulePDF();
            alert('PDF Guide downloaded successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF.');
        } finally {
            setIsGenerating(false);
        }
    };

    const modules = [
        {
            title: "Pref AI Intelligence",
            icon: Zap,
            color: "#FFD700",
            content: "Pref AI is your intelligent productivity companion, powered by Google's Gemini 1.5 Pro. It goes beyond simple chat—it understands your context. You can upload PDF documents (lecture notes, reports) for instant summarization and 'RAG' (Retrieval-Augmented Generation) analysis. Pref AI also monitors your task load and mood to act as a supportive, stoic accountability partner."
        },
        {
            title: "Home Dashboard",
            icon: Target,
            color: "#FFD700",
            content: "The dashboard is your command center, designed to answer 'How am I doing today?'. It features 'Vital Signs' cards that track your Financial Health (Net Balance), Mental Streak, and Task Load in real-time. It also provides 'Quick Actions' for rapid navigation to Habits, Mind, or Calendar modules without infinite scrolling."
        },
        {
            title: "Calendar & Tasks",
            icon: Target, // Utilizing reusable icons
            color: "#00D4FF",
            content: "A unified timeline for your life. The Calendar view treats time blocks seriously—distinguishing between 'Events' (Fixed time, like meetings) and 'Tasks' (Flexible deadlines). You can set specific reminders that trigger system-level notifications, ensuring you never miss a deadline even when the app is closed."
        },
        {
            title: "Learning Center",
            icon: BookOpen,
            color: "#14B8A6",
            content: "Your digital study sanctuary. It combines a customizable Pomodoro Timer (Focus Engine) with high-fidelity 'Focus Soundscapes' (Rain, White Noise) to boost Alpha brain waves. It also features a Flashcard system for Active Recall and an AI-powered Note-taking tool that can auto-summarize your thoughts."
        },
        {
            title: "Financial Cortex",
            icon: Wallet,
            color: "#F97316",
            content: "A comprehensive finance tracker built for the local ecosystem. It auto-formats currency to IDR (Rp) standards and allows rapid transaction logging (Income/Expense). The 'Analytics' tab visualizes your spending habits with Donut Charts and Trend Lines, helping you curb overspending before it becomes a problem."
        },
        {
            title: "Mind & Wellness",
            icon: Brain,
            color: "#A855F7",
            content: "Your emotional gymnasium. Use the Mood Tracker to log daily emotional states (Happy, Sad, Neutral) and build a long-term stability graph. It includes a 'Mini-Journal' for micro-reflections and delivers daily Stoic Affirmations to help you start the morning with intention and resilience."
        },
        {
            title: "Atomic Habits",
            icon: Shield,
            color: "#EC4899",
            content: "Build routines that stick. Based on the 'Don't Break the Chain' methodology, this module lets you create custom habits with specific icons. Visual streaks gamify consistency—the longer your streak, the harder it is to break mentally. Perfect for tracking gym sessions, reading, or water intake."
        },
        {
            title: "Gamification & Arcade",
            icon: Gamepad2,
            color: "#FF4757",
            content: "Productivity meets Dopamine. The Arcade Room features three cognitive training games: 'Memory Matrix' for working memory enhancement through pattern recognition, 'Color Connect' for spatial reasoning and problem-solving via path-finding puzzles, and 'Card Match' for short-term memory speed training through number pair matching. The 'Trophy Room' rewards you with permanent badges (e.g., 'Pomodoro Master') for completing focused study sessions or maintaining streaks."
        },
        {
            title: "Profile & Data Privacy",
            icon: User,
            color: "#ffffff",
            content: "Your data, your control. This section lets you manage your personal bio and profile photo. Importantly, Prefrontal follows a 'Local First' architecture—your financial and journal data is encrypted and stored on-device. You can also generate detailed PDF reports of your weekly progress."
        }
    ];

    return (
        <div className="page-container animate-fade-in" style={{ paddingBottom: '120px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="title" style={{ margin: 0 }}>App Module Guide</h1>
                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Comprehensive documentation & manual</p>
                </div>
            </div>

            {/* Download Card */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(168, 85, 247, 0.1))',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(0, 212, 255, 0.2)'
            }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>Download PDF Manual</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#A0A0B0' }}>Get the complete guide with step-by-step instructions.</p>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: isGenerating ? 0.7 : 1
                    }}
                >
                    {isGenerating ? 'Generating...' : <><Download size={18} /> Download PDF</>}
                </button>
            </div>

            {/* Modules List */}
            <div style={{ display: 'grid', gap: '15px' }}>
                {modules.map((mod, index) => (
                    <div key={index} className="card" style={{ borderLeft: `4px solid ${mod.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                            <div style={{
                                background: `${mod.color}20`,
                                padding: '10px',
                                borderRadius: '12px',
                                color: mod.color
                            }}>
                                <mod.icon size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#fff' }}>{mod.title}</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#A0A0B0', lineHeight: '1.6' }}>
                                    {mod.content}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '40px', color: '#606070', fontSize: '12px' }}>
                <p>Copyright Fathir Ramadhan &copy; 2025</p>
            </div>
        </div>
    );
};

export default ModulePage;
