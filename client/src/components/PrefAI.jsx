import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle, X, Send, Sparkles, Bot, User,
    Loader2, Minimize2, Maximize2, Brain, Trash2,
    Lightbulb, BookOpen, Wallet, Calendar, Target, Paperclip, FileText, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractTextFromPDF } from '../utils/pdfReader';

// AI Response Generator - Simulated AI with contextual responses
// AI Response Generator - Simulated AI with contextual responses OR Gemini API
const generateAIResponse = async (message, context, apiKey) => {
    // 1. Gemini API Integration
    if (apiKey) {
        try {
            const sysPrompt = `You are PrefAI, a smart, friendly, and motivational productivity assistant for a web app.
            Your persona: "Pref" stands for Prefrontal Cortex (planning/decision making). You are logical but empathetic.
            User Input: ${message}
            User Context (JSON): ${JSON.stringify({ ...context, pdfText: context.isPdfAnalysis ? '(PDF Content Attached)' : 'None' })}
            
            ${context.isPdfAnalysis ? `Document Content: ${context.pdfText.substring(0, 30000)}...` : ''}

            Instructions:
            - Respond in Indonesian (unless user speaks English).
            - Be concise and use Markdown (bold, lists) for readability.
            - Relate answers to the user's data (e.g. "Wow, you finished 5 tasks today!").
            - If analyzing PDF, give deep insights.
            `;

            // Dynamic Model Discovery Strategy
            let selectedModel = 'gemini-1.5-flash';

            try {
                const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                const modelsData = await modelsResponse.json();

                if (modelsData.models) {
                    const availableModels = modelsData.models
                        .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                        .map(m => m.name.replace('models/', ''));

                    const priorities = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
                    const bestMatch = priorities.find(p => availableModels.includes(p));
                    if (bestMatch) selectedModel = bestMatch;
                    else if (availableModels.length > 0) selectedModel = availableModels[0];
                }
            } catch (e) {
                console.warn("Failed to fetch models list, using default:", e);
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: sysPrompt }]
                    }]
                })
            });

            const data = await response.json();

            if (data.error) {
                if (data.error.code === 429) throw new Error("API Quota Exceeded (Limit Habis). Tunggu sebentar.");
                throw new Error(data.error.message);
            }

            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            }

            throw new Error('No response from AI');



        } catch (err) {
            console.error("Gemini Error:", err);
            // Show actual error message for debugging
            // Enhanced Error Handling
            let friendlyError = err.message;
            if (friendlyError.includes('Fetch')) friendlyError = "Koneksi Bermasalah (Cek Internet)";
            if (friendlyError.includes('404')) friendlyError = "Model AI Sedang Gangguan";
            if (friendlyError.includes('API key')) friendlyError = "API Key Tidak Valid/Kedaluwarsa";
            if (friendlyError.includes('Quota')) friendlyError = "Limit Penggunaan Habis";

            return `⚠️ **Gagal: ${friendlyError}**
Switching to Offline Mode.
` + (await generateOfflineResponse(message, context));
        }
    }

    return generateOfflineResponse(message, context);
};

const generateOfflineResponse = async (message, context) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const lowerMessage = message.toLowerCase();

    // Greeting responses
    if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        const greetings = [
            `Hai ${context.userName}! 👋 Aku prefAI, asisten produktivitasmu. Ada yang bisa kubantu hari ini?`,
            `Halo ${context.userName}! ✨ Senang bertemu denganmu. Mau diskusi tentang apa hari ini?`,
            `Hi there, ${context.userName}! 🌟 Aku siap membantu dengan pertanyaan atau goalmu!`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Help/capability questions
    if (lowerMessage.includes('bisa apa') || lowerMessage.includes('kemampuan') || lowerMessage.includes('help') || lowerMessage.includes('bantuan')) {
        return `Aku bisa membantu ${context.userName} dalam banyak hal! 🚀

📚 **Belajar**: Tips belajar, teknik Pomodoro, flashcards
📄 **Analisis PDF**: Upload dokumen, aku akan rangkum isinya!
💰 **Keuangan**: Tips menabung, budgeting, financial planning
📅 **Produktivitas**: Time management, goal setting, habit building
🧠 **Mental Health**: Mindfulness, journaling prompts, stress relief
💪 **Motivasi**: Daily motivation, quotes, encouragement

Coba tanyakan sesuatu! Contoh:
- "Bagaimana cara fokus belajar?"
- "Tips menabung untuk pemula"
- "Cara membangun habit baik"`;
    }

    // PDF Analysis Request
    if (context.isPdfAnalysis) {
        const text = context.pdfText;
        // Simple heuristic summarization
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const summary = sentences.slice(0, 3).join('. ') + '... ' + sentences.slice(-2).join('. ');
        const wordCount = text.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200);

        return `📄 **Analisis Dokumen: ${context.fileName}**

📊 **Quick Stats:**
• Halaman: ${context.pageCount} ${context.isTruncated ? '(Reading first 10)' : ''}
• Kata: ~${wordCount}
• Est. Baca: ${readTime} menit

📝 **Ringkasan Singkat:**
"${summary}"

💡 **Saran:**
Dokumen ini sepertinya tentang topik yang menarik. Kamu bisa membuat Flashcard dari poin-poin penting di sini menggunakan fitur Learning!

Ada bagian spesifik yang ingin kamu tanyakan lagi?`;
    }

    // Study/Learning related
    if (lowerMessage.includes('belajar') || lowerMessage.includes('study') || lowerMessage.includes('fokus') || lowerMessage.includes('pomodoro')) {
        const studyTips = [
            `📚 **Tips Belajar Efektif:**

1. **Teknik Pomodoro** - Belajar 25 menit, istirahat 5 menit
2. **Active Recall** - Uji diri sendiri, jangan hanya membaca
3. **Spaced Repetition** - Review materi secara berkala
4. **Environment** - Buat ruang belajar yang nyaman
5. **Sleep** - Tidur cukup 7-8 jam untuk memory consolidation

Mau aku jelaskan teknik yang mana lebih detail? 🎯`,
            `🎯 **Cara Meningkatkan Fokus:**

• **Single-tasking** - Fokus satu hal sampai selesai
• **Remove distractions** - Silent HP, tutup sosmed
• **Time blocking** - Jadwalkan waktu khusus belajar
• **The 2-minute rule** - Jika butuh <2 menit, kerjakan sekarang
• **Deep work sessions** - 90 menit fokus penuh

Kamu sudah punya ${context.studySessions} sesi Pomodoro! Keep going! 🔥`,
            `✨ **Study Smart, Not Hard:**

Brain butuh variasi! Coba:
1. **Interleaving** - Campur berbagai topik
2. **Teaching** - Jelaskan ke orang lain
3. **Mind mapping** - Visualisasi konsep
4. **Feynman Technique** - Jelaskan dengan bahasa simpel

Use the Flashcards feature in Learning module! 🃏`
        ];
        return studyTips[Math.floor(Math.random() * studyTips.length)];
    }

    // Finance/Money related
    if (lowerMessage.includes('uang') || lowerMessage.includes('nabung') || lowerMessage.includes('keuangan') || lowerMessage.includes('budget') || lowerMessage.includes('hemat')) {
        const financeTips = [
            `💰 **Tips Menabung untuk Pemula:**

1. **50/30/20 Rule**
   - 50% untuk kebutuhan
   - 30% untuk keinginan
   - 20% untuk tabungan

2. **Pay Yourself First** - Sisihkan tabungan di awal bulan

3. **Track expenses** - Catat semua pengeluaran (pake Finance module!)

4. **Emergency fund** - Siapkan 3-6 bulan pengeluaran

Balance kamu sekarang: ${context.balance}. Keep tracking! 📊`,
            `📊 **Financial Planning 101:**

• **Set goals** - Tentukan target spesifik (liburan, gadget, dll)
• **Automate savings** - Auto-transfer ke tabungan
• **Avoid impulse buying** - Tunggu 24 jam sebelum beli
• **Review monthly** - Evaluasi spending habits

Pro tip: Buat goals di Finance module dan track progressnya! 🎯`,
            `🎯 **Cara Mengontrol Pengeluaran:**

1. **Needs vs Wants** - Bedakan kebutuhan dan keinginan
2. **Cash envelope** - Pakai cash untuk kategori tertentu
3. **Unsubscribe** - Cancel langganan yang ga perlu
4. **Meal prep** - Masak sendiri, hemat makan di luar
5. **Compare prices** - Cek harga sebelum beli

Track di Finance module untuk lihat spending pattern! 📈`
        ];
        return financeTips[Math.floor(Math.random() * financeTips.length)];
    }

    // Motivation
    if (lowerMessage.includes('motivasi') || lowerMessage.includes('semangat') || lowerMessage.includes('malas') || lowerMessage.includes('down') || lowerMessage.includes('sedih')) {
        const motivations = [
            `💪 **Kamu Lebih Kuat dari yang Kamu Kira!**

"The only way to do great work is to love what you do." - Steve Jobs

Remember:
• Progress > Perfection
• Small steps count
• It's okay to rest, but don't quit
• Every expert was once a beginner

Kamu sudah menyelesaikan ${context.tasksCompleted} tasks! That's amazing! 🌟`,
            `🌟 **You've Got This, ${context.userName}!**

"Believe you can and you're halfway there." - Theodore Roosevelt

When feeling down:
1. Take a 5-min break 🧘
2. Go outside, get fresh air 🌿
3. Talk to someone you trust 💬
4. Write in your journal 📝
5. Remember your wins! 🏆

Mood journaling di Psychology module bisa bantu track perasaanmu! 💜`,
            `✨ **Motivation Boost:**

Hey ${context.userName}, rasa malas itu normal! Here's what helps:

• **5-Second Rule** - Count 5-4-3-2-1, then act!
• **Break it down** - Pecah task jadi lebih kecil
• **Reward yourself** - Celebrate small wins
• **Accountability** - Tell someone your goals
• **Start small** - Just 2 minutes, then continue

Your ${context.streak}-day streak shows you're committed! Don't break it! 🔥`
        ];
        return motivations[Math.floor(Math.random() * motivations.length)];
    }

    // Habit building
    if (lowerMessage.includes('habit') || lowerMessage.includes('kebiasaan') || lowerMessage.includes('rutin') || lowerMessage.includes('konsisten')) {
        return `🔄 **Building Lasting Habits:**

**The 4 Laws of Habit Formation** (from Atomic Habits):

1. **Make it Obvious** - Set clear cues and reminders
2. **Make it Attractive** - Pair with something you enjoy
3. **Make it Easy** - Start with 2-minute version
4. **Make it Satisfying** - Reward yourself immediately

**Habit Stacking Formula:**
"After [CURRENT HABIT], I will [NEW HABIT]"

Example: "After I pour my morning coffee, I will write in my journal"

Use the Habits module to track your daily habits! 📊 Your current streak: ${context.streak} days! 🔥`;
    }

    // Mental health / Journal
    if (lowerMessage.includes('journal') || lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('mental') || lowerMessage.includes('mindfulness')) {
        return `🧠 **Mental Wellness Tips:**

**Journaling Prompts:**
• What am I grateful for today?
• What's one thing I accomplished?
• How am I feeling right now?
• What did I learn today?

**Quick Stress Relief:**
1. **4-7-8 Breathing** - Inhale 4s, hold 7s, exhale 8s
2. **Grounding** - Name 5 things you can see, 4 you can touch...
3. **Move your body** - Even 5 min walk helps
4. **Talk it out** - Share with someone you trust

Try the Psychology module for mood tracking and journaling! You have ${context.journalEntries} entries already! 💜`;
    }

    // Time management / Productivity
    if (lowerMessage.includes('waktu') || lowerMessage.includes('produktif') || lowerMessage.includes('time') || lowerMessage.includes('procrastin')) {
        return `⏰ **Time Management Mastery:**

**Top Techniques:**
1. **Time Blocking** - Schedule specific tasks in calendar
2. **Eat That Frog** - Do hardest task first
3. **2-Minute Rule** - If it takes <2 min, do it now
4. **Batching** - Group similar tasks together
5. **Energy Management** - Match tasks to energy levels

**Beat Procrastination:**
• Break tasks into smaller pieces
• Set deadlines (use Calendar module!)
• Remove distractions
• Start with just 5 minutes
• Reward progress, not just completion

You have ${context.todayTasks} tasks today. Let's tackle them! 💪`;
    }

    // Goals
    if (lowerMessage.includes('goal') || lowerMessage.includes('target') || lowerMessage.includes('tujuan') || lowerMessage.includes('impian')) {
        return `🎯 **SMART Goal Setting:**

Make your goals:
• **S**pecific - Clear and well-defined
• **M**easurable - Track progress with numbers
• **A**chievable - Realistic but challenging
• **R**elevant - Aligned with your values
• **T**ime-bound - With a deadline

**Goal Categories to Consider:**
📚 Learning - Skills, courses, books
💰 Financial - Savings, investments
💪 Health - Exercise, nutrition, sleep
🧠 Personal - Relationships, hobbies
💼 Career - Projects, promotions

Check out the Achievements page to see your progress badges! 🏆`;
    }

    // About prefAI
    if (lowerMessage.includes('siapa kamu') || lowerMessage.includes('who are you') || lowerMessage.includes('prefai') || lowerMessage.includes('nama')) {
        return `🤖 **About Me:**

Aku **prefAI** - Productivity Companion AI! 

Nama "pref" dari "Prefrontal" - bagian otak untuk decision-making dan planning. Cocok untuk aplikasi produktivitas ini! 🧠

**My Mission:**
• Membantu kamu lebih produktif
• Memberikan tips dan motivasi
• Menjawab pertanyaan seputar belajar, keuangan, mental health
• Menjadi companion dalam journey produktivitasmu

Developed with 💛 for ${context.userName}'s productivity journey!`;
    }

    // Default response
    const defaultResponses = [
        `Pertanyaan menarik, ${context.userName}! 🤔 

Aku bisa membantu dengan:
• 📚 Tips belajar & Pomodoro
• 💰 Keuangan & budgeting
• 📅 Produktivitas & time management
• 🧠 Mental health & journaling
• 💪 Motivasi & goal setting

Coba tanyakan sesuatu yang lebih spesifik! 😊`,
        `Hmm, aku perlu belajar lebih banyak tentang topik itu! 📖

Meanwhile, aku jago membantu dengan:
• Teknik belajar efektif
• Tips mengelola keuangan
• Membangun habits positif
• Meningkatkan produktivitas

Ada yang mau kamu tanyakan dari topik-topik itu? ✨`,
        `Thanks for chatting, ${context.userName}! 💬

Aku belum 100% yakin tentang itu, tapi aku bisa bantu dengan banyak hal lain!

Try asking:
- "Bagaimana cara fokus belajar?"
- "Tips menabung"
- "Cara membangun habit"
- "Butuh motivasi!"

Let me know! 🌟`
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

const PrefAI = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_prefai_messages`);
        return saved ? JSON.parse(saved) : [];
    });
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    // Use provided key as default if not in local storage
    const defaultKey = 'AIzaSyA6cELfuGM5YIcm94gtcgHehC4zXg9RfVo';
    const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || defaultKey);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Force sync default key if needed
    useEffect(() => {
        if (!localStorage.getItem('gemini_api_key')) {
            localStorage.setItem('gemini_api_key', defaultKey);
        }
    }, []);

    // User context for AI responses
    const [userContext, setUserContext] = useState({
        userName: user?.name || 'User',
        studySessions: 0,
        tasksCompleted: 0,
        journalEntries: 0,
        balance: 'Rp 0',
        streak: 0,
        todayTasks: 0
    });

    // Load user context
    useEffect(() => {
        if (!user) return;

        const studySessions = JSON.parse(localStorage.getItem(`${user.username}_study_sessions`) || '[]');
        const completedHistory = JSON.parse(localStorage.getItem(`${user.username}_completed_history`) || '[]');
        const journals = JSON.parse(localStorage.getItem(`${user.username}_psych_journal_entries`) || '[]');
        const transactions = JSON.parse(localStorage.getItem(`${user.username}_finance_transactions`) || '[]');
        const todos = JSON.parse(localStorage.getItem(`${user.username}_calendar_todos`) || '[]');
        const activityDates = JSON.parse(localStorage.getItem(`${user.username}_activity_dates`) || '[]');

        const balance = transactions.reduce((total, t) =>
            t.type === 'income' ? total + t.amount : total - t.amount, 0);

        const today = new Date().toISOString().split('T')[0];
        const todayTasks = todos.filter(t => t.date === today && !t.completed).length;

        // Calculate streak
        const sortedDates = [...activityDates].sort().reverse();
        let streak = 0;
        const todayDate = new Date();
        for (let i = 0; i < sortedDates.length; i++) {
            const expectedDate = new Date(todayDate);
            expectedDate.setDate(todayDate.getDate() - i);
            if (sortedDates.includes(expectedDate.toISOString().split('T')[0])) {
                streak++;
            } else break;
        }

        setUserContext({
            userName: user.name,
            studySessions: studySessions.length,
            tasksCompleted: completedHistory.length,
            journalEntries: journals.length,
            balance: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(balance),
            streak,
            todayTasks
        });
    }, [user, isOpen]);

    // Save messages
    useEffect(() => {
        if (user && messages.length > 0) {
            localStorage.setItem(`${user.username}_prefai_messages`, JSON.stringify(messages.slice(-50)));
        }
    }, [messages, user]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, isMinimized]);

    // Add welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0 && user) {
            setMessages([{
                id: Date.now(),
                role: 'assistant',
                content: `Hai ${user.name}! 👋 Aku **prefAI**, asisten produktivitasmu!\n\nAku bisa membantu dengan:\n• 📚 Tips belajar & focus\n• 💰 Keuangan & budgeting\n• 🧠 Mental wellness\n• 💪 Motivasi & goals\n\nAda yang bisa kubantu hari ini? 😊`,
                timestamp: new Date().toISOString()
            }]);
        }
    }, [isOpen, user]);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: 'Maaf, aku hanya bisa membaca file PDF untuk saat ini. 🙏',
                timestamp: new Date().toISOString()
            }]);
            return;
        }

        setIsAnalyzing(true);

        // Add user message about file
        const userMsgId = Date.now();
        setMessages(prev => [...prev, {
            id: userMsgId,
            role: 'user',
            content: `📂 Uploaded: ${file.name}`,
            timestamp: new Date().toISOString()
        }]);

        try {
            const { text, pageCount, info } = await extractTextFromPDF(file);

            // Generate response with PDF context
            const analysisContext = {
                ...userContext,
                isPdfAnalysis: true,
                pdfText: text,
                fileName: file.name,
                pageCount,
                isTruncated: info.isTruncated
            };

            const response = await generateAIResponse('', analysisContext, geminiKey);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Gagal membaca PDF. Pastikan file tidak dikunci password.',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsAnalyzing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isTyping || isAnalyzing) return;
        // ... (rest of function same as before)
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            // clear PDF context flag for normal messages
            const interactionContext = { ...userContext, isPdfAnalysis: false };
            const response = await generateAIResponse(inputValue.trim(), interactionContext, geminiKey);

            const assistantMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error generating response:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Maaf, terjadi error. Coba lagi ya! 🙏',
                timestamp: new Date().toISOString()
            }]);
        }

        setIsTyping(false);
    };

    const handleClearChat = () => {
        if (window.confirm('Clear all chat history?')) {
            setMessages([]);
            localStorage.removeItem(`${user?.username}_prefai_messages`);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Quick prompts
    const quickPrompts = [
        { icon: BookOpen, text: 'Tips belajar', color: '#14B8A6' },
        { icon: Wallet, text: 'Tips nabung', color: '#F97316' },
        { icon: Target, text: 'Butuh motivasi', color: '#A855F7' },
        { icon: Calendar, text: 'Time management', color: '#00D4FF' }
    ];

    if (!user) return null;

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '100px',
                        right: '20px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 30px rgba(168, 85, 247, 0.4)',
                        zIndex: 1000,
                        transition: 'all 0.3s ease',
                        animation: 'pulse 2s infinite'
                    }}
                >
                    <Bot size={28} color="#fff" />
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '20px',
                        height: '20px',
                        background: '#00D26A',
                        borderRadius: '50%',
                        border: '3px solid #0F0F1A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Sparkles size={10} color="#fff" />
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: isMinimized ? '100px' : '90px',
                    right: '20px',
                    width: isMinimized ? '280px' : '340px',
                    height: isMinimized ? '56px' : '500px',
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%)',
                    borderRadius: '20px',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '14px 16px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Bot size={20} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                                prefAI
                            </div>
                            <div style={{ fontSize: '11px', color: '#00D26A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '6px', height: '6px', background: '#00D26A', borderRadius: '50%' }} />
                                Online
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <Settings size={16} color="#888" />
                        </button>
                        <button
                            onClick={handleClearChat}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: isMinimized ? 'none' : 'flex'
                            }}
                        >
                            <Trash2 size={16} color="#888" />
                        </button>
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            {isMinimized ? <Maximize2 size={16} color="#888" /> : <Minimize2 size={16} color="#888" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'rgba(255, 71, 87, 0.2)',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={16} color="#FF4757" />
                        </button>
                    </div>

                    {/* Settings Modal Overlay */}
                    {showSettings && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 15, 26, 0.95)',
                            zIndex: 10,
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ color: '#fff', margin: 0 }}>AI Settings</h3>
                                <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Gemini API Key</label>
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => {
                                        setGeminiKey(e.target.value);
                                        localStorage.setItem('gemini_api_key', e.target.value);
                                    }}
                                    placeholder="Paste your key here..."
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: '#fff',
                                        fontSize: '13px'
                                    }}
                                />
                                <p style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                                    Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" style={{ color: '#A855F7' }}>Google AI Studio</a> to enable smarter responses.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {!isMinimized && (
                        <>
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                {messages.map(message => (
                                    <div
                                        key={message.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                            gap: '8px'
                                        }}
                                    >
                                        {message.role === 'assistant' && (
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Bot size={14} color="#fff" />
                                            </div>
                                        )}
                                        <div style={{
                                            maxWidth: '80%',
                                            padding: '12px 14px',
                                            borderRadius: message.role === 'user'
                                                ? '16px 16px 4px 16px'
                                                : '16px 16px 16px 4px',
                                            background: message.role === 'user'
                                                ? 'linear-gradient(135deg, #A855F7, #EC4899)'
                                                : 'rgba(255, 255, 255, 0.08)',
                                            color: '#fff',
                                            fontSize: '13px',
                                            lineHeight: '1.5',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {message.content.split('**').map((part, i) =>
                                                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                            )}
                                            <div style={{
                                                fontSize: '10px',
                                                color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : '#666',
                                                marginTop: '4px',
                                                textAlign: 'right'
                                            }}>
                                                {formatTime(message.timestamp)}
                                            </div>
                                        </div>
                                        {message.role === 'user' && (
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <User size={14} color="#888" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Typing indicator */}
                                {(isTyping || isAnalyzing) && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Bot size={14} color="#fff" />
                                        </div>
                                        <div style={{
                                            padding: '12px 16px',
                                            borderRadius: '16px 16px 16px 4px',
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Loader2 size={14} color="#A855F7" style={{ animation: 'spin 1s linear infinite' }} />
                                            <span style={{ fontSize: '13px', color: '#888' }}>
                                                {isAnalyzing ? 'Reading document...' : 'prefAI is typing...'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Prompts */}
                            {messages.length <= 1 && (
                                <div style={{
                                    padding: '0 16px 12px',
                                    display: 'flex',
                                    gap: '8px',
                                    flexWrap: 'wrap'
                                }}>
                                    {quickPrompts.map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInputValue(prompt.text);
                                                inputRef.current?.focus();
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                border: `1px solid ${prompt.color}40`,
                                                background: `${prompt.color}15`,
                                                color: prompt.color,
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <prompt.icon size={12} />
                                            {prompt.text}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div style={{
                                padding: '12px 16px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center'
                            }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isAnalyzing || isTyping}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        cursor: (isAnalyzing || isTyping) ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#A0A0B0'
                                    }}
                                    title="Upload PDF Analysis"
                                >
                                    <Paperclip size={18} />
                                </button>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask prefAI anything..."
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isTyping}
                                    style={{
                                        width: '46px',
                                        height: '46px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: inputValue.trim()
                                            ? 'linear-gradient(135deg, #A855F7, #EC4899)'
                                            : 'rgba(255, 255, 255, 0.1)',
                                        cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Send size={18} color={inputValue.trim() ? '#fff' : '#666'} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default PrefAI;
