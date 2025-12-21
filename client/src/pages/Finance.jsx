import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PlusCircle, X, Trash2, Edit2, Target, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Sparkles, Search, Filter, BarChart3, Calendar, Download, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FinancePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_finance_transactions`);
        return saved ? JSON.parse(saved) : [];
    });

    const [balance, setBalance] = useState(() => {
        if (!user) return 0;
        const saved = localStorage.getItem(`${user.username}_finance_transactions`);
        const txns = saved ? JSON.parse(saved) : [];
        return txns.reduce((total, t) => {
            return t.type === 'income' ? total + t.amount : total - t.amount;
        }, 0);
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [newTrans, setNewTrans] = useState({ title: '', amount: '', type: 'expense' });

    const [goals, setGoals] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`${user.username}_finance_goals`);
        return saved ? JSON.parse(saved) : [];
    });
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '' });

    // New states for search, filter, and analytics
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', 'expense'
    const [activeTab, setActiveTab] = useState('transactions'); // 'transactions', 'analytics'
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

    // Calculate income and expense totals
    const { totalIncome, totalExpense } = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.totalIncome += t.amount;
            } else {
                acc.totalExpense += t.amount;
            }
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [transactions]);

    React.useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_finance_transactions`, JSON.stringify(transactions));
            const newBalance = transactions.reduce((total, t) => {
                return t.type === 'income' ? total + t.amount : total - t.amount;
            }, 0);
            setBalance(newBalance);
        }
    }, [transactions, user]);

    React.useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_finance_goals`, JSON.stringify(goals));
        }
    }, [goals, user]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // Filter transactions based on search, type, and date
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Search filter
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());

            // Type filter
            const matchesType = typeFilter === 'all' || t.type === typeFilter;

            // Date filter
            let matchesDate = true;
            if (dateFilter !== 'all') {
                const today = new Date();
                const txDate = new Date(t.date);
                if (dateFilter === 'today') {
                    matchesDate = txDate.toDateString() === today.toDateString();
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDate = txDate >= weekAgo;
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    matchesDate = txDate >= monthAgo;
                }
            }

            return matchesSearch && matchesType && matchesDate;
        });
    }, [transactions, searchQuery, typeFilter, dateFilter]);

    // Calculate weekly spending data for chart
    const weeklyData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayExpense = transactions
                .filter(t => t.date === dateStr && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const dayIncome = transactions
                .filter(t => t.date === dateStr && t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            data.push({
                day: days[date.getDay()],
                expense: dayExpense,
                income: dayIncome
            });
        }
        return data;
    }, [transactions]);

    const maxChartValue = useMemo(() => {
        return Math.max(...weeklyData.map(d => Math.max(d.expense, d.income)), 1);
    }, [weeklyData]);

    const handleAddTransaction = () => {
        if (!newTrans.title || !newTrans.amount) return;

        const amount = parseInt(newTrans.amount);

        if (isEditMode && selectedTransaction) {
            setTransactions(transactions.map(t =>
                t.id === selectedTransaction.id
                    ? { ...t, title: newTrans.title, amount: amount, type: newTrans.type }
                    : t
            ));
        } else {
            const newTransaction = {
                id: Date.now(),
                title: newTrans.title,
                amount: amount,
                type: newTrans.type,
                date: new Date().toISOString().split('T')[0]
            };
            setTransactions([newTransaction, ...transactions]);
        }

        setIsModalOpen(false);
        setNewTrans({ title: '', amount: '', type: 'expense' });
        setIsEditMode(false);
        setSelectedTransaction(null);
    };

    const openEditTransactionModal = (transaction) => {
        setIsEditMode(true);
        setSelectedTransaction(transaction);
        setNewTrans({
            title: transaction.title,
            amount: transaction.amount.toString(),
            type: transaction.type
        });
        setIsModalOpen(true);
    };

    const openAddTransactionModal = () => {
        setIsEditMode(false);
        setSelectedTransaction(null);
        setNewTrans({ title: '', amount: '', type: 'expense' });
        setIsModalOpen(true);
    };

    const handleDeleteTransaction = (transactionId) => {
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) return;
        if (!window.confirm(`Delete "${transactionToDelete.title}"?`)) return;
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };

    const addGoal = () => {
        if (!newGoal.title || !newGoal.targetAmount) return;
        const goal = {
            id: Date.now(),
            title: newGoal.title,
            targetAmount: parseInt(newGoal.targetAmount),
            currentAmount: 0
        };
        setGoals([...goals, goal]);
        setNewGoal({ title: '', targetAmount: '' });
        setShowGoalModal(false);
    };

    const deleteGoal = (goalId) => {
        if (window.confirm('Delete this goal?')) {
            setGoals(goals.filter(g => g.id !== goalId));
        }
    };

    const updateGoalProgress = (goalId, amount) => {
        setGoals(goals.map(g =>
            g.id === goalId ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g
        ));
    };

    return (
        <div className="page-container animate-fade-in" style={{ paddingBottom: '120px' }}>
            {/* Header with decorative element */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => navigate('/')}
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
                        <h1 className="title" style={{ marginBottom: '12px', marginTop: 0 }}>Finance</h1>
                        <p style={{ color: '#A0A0B0', fontSize: '14px', margin: 0 }}>Track your money flow</p>
                    </div>
                </div>

                {/* Decorative sparkle */}
                <Sparkles
                    size={24}
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '20px',
                        color: 'rgba(255, 215, 0, 0.4)',
                        animation: 'float 4s ease-in-out infinite'
                    }}
                />
            </div>

            {/* Main Balance Card - Premium Design */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                borderRadius: '24px',
                padding: '28px',
                marginBottom: '20px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(0, 212, 255, 0.1)'
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30%',
                    left: '-10%',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />

                {/* Wallet icon */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(168, 85, 247, 0.2))',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Wallet size={24} color="#00D4FF" />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '8px', fontWeight: '500' }}>
                        Total Balance
                    </div>
                    <div style={{
                        fontSize: '36px',
                        fontWeight: '800',
                        background: balance >= 0
                            ? 'linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)'
                            : 'linear-gradient(135deg, #FF4757 0%, #FF6B7A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '20px',
                        letterSpacing: '-1px'
                    }}>
                        {formatRupiah(balance)}
                    </div>

                    {/* Income/Expense Summary */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{
                            flex: 1,
                            background: 'rgba(0, 210, 106, 0.1)',
                            borderRadius: '14px',
                            padding: '14px',
                            border: '1px solid rgba(0, 210, 106, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    background: 'rgba(0, 210, 106, 0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ArrowUpRight size={16} color="#00D26A" />
                                </div>
                                <span style={{ fontSize: '11px', color: '#A0A0B0', fontWeight: '500' }}>Income</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#00D26A' }}>
                                {formatRupiah(totalIncome)}
                            </div>
                        </div>
                        <div style={{
                            flex: 1,
                            background: 'rgba(255, 71, 87, 0.1)',
                            borderRadius: '14px',
                            padding: '14px',
                            border: '1px solid rgba(255, 71, 87, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    background: 'rgba(255, 71, 87, 0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ArrowDownRight size={16} color="#FF4757" />
                                </div>
                                <span style={{ fontSize: '11px', color: '#A0A0B0', fontWeight: '500' }}>Expense</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#FF4757' }}>
                                {formatRupiah(totalExpense)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={openAddTransactionModal}
                style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#000',
                    fontSize: '15px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)',
                    transition: 'all 0.3s ease'
                }}
            >
                <PlusCircle size={20} />
                Add Transaction
            </button>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                    onClick={() => setActiveTab('transactions')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: activeTab === 'transactions' ? '2px solid #00D4FF' : '1px solid rgba(255,255,255,0.1)',
                        background: activeTab === 'transactions' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: activeTab === 'transactions' ? '#00D4FF' : '#A0A0B0',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <Wallet size={16} />
                    Transactions
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: activeTab === 'analytics' ? '2px solid #A855F7' : '1px solid rgba(255,255,255,0.1)',
                        background: activeTab === 'analytics' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: activeTab === 'analytics' ? '#A855F7' : '#A0A0B0',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <BarChart3 size={16} />
                    Analytics
                </button>
            </div>

            {/* Search and Filter - Only show for transactions tab */}
            {activeTab === 'transactions' && (
                <div style={{ marginBottom: '16px' }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#606070'
                        }} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 14px 14px 44px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(30, 30, 50, 0.6)',
                                color: '#fff',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Type Filter */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {['all', 'income', 'expense'].map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: typeFilter === type ? '2px solid' : '1px solid rgba(255,255,255,0.1)',
                                    borderColor: typeFilter === type
                                        ? (type === 'income' ? '#00D26A' : type === 'expense' ? '#FF4757' : '#00D4FF')
                                        : 'rgba(255,255,255,0.1)',
                                    background: typeFilter === type
                                        ? (type === 'income' ? 'rgba(0,210,106,0.15)' : type === 'expense' ? 'rgba(255,71,87,0.15)' : 'rgba(0,212,255,0.15)')
                                        : 'rgba(255,255,255,0.03)',
                                    color: typeFilter === type
                                        ? (type === 'income' ? '#00D26A' : type === 'expense' ? '#FF4757' : '#00D4FF')
                                        : '#A0A0B0',
                                    fontWeight: '600',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Date Filter */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { key: 'all', label: 'All Time' },
                            { key: 'today', label: 'Today' },
                            { key: 'week', label: '7 Days' },
                            { key: 'month', label: '30 Days' }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setDateFilter(key)}
                                style={{
                                    flex: 1,
                                    padding: '8px 6px',
                                    borderRadius: '8px',
                                    border: dateFilter === key ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.08)',
                                    background: dateFilter === key ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.02)',
                                    color: dateFilter === key ? '#FFD700' : '#606070',
                                    fontWeight: '500',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Financial Goals - Only show on transactions tab */}
            {activeTab === 'transactions' && (
                <div className="card" style={{
                    background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Target size={18} color="#A855F7" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Savings Goals</h2>
                        </div>
                        <button
                            onClick={() => setShowGoalModal(true)}
                            style={{
                                background: 'rgba(168, 85, 247, 0.2)',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                color: '#A855F7',
                                padding: '8px 14px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <PlusCircle size={14} /> Add
                        </button>
                    </div>

                    {goals.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#606070' }}>
                            <PiggyBank size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '14px' }}>No savings goals yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {goals.map(goal => {
                                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                                const isComplete = progress >= 100;
                                return (
                                    <div key={goal.id} style={{
                                        padding: '16px',
                                        background: isComplete
                                            ? 'linear-gradient(135deg, rgba(0, 210, 106, 0.1), rgba(20, 184, 166, 0.1))'
                                            : 'rgba(255,255,255,0.02)',
                                        borderRadius: '14px',
                                        border: `1px solid ${isComplete ? 'rgba(0, 210, 106, 0.3)' : 'rgba(255,255,255,0.08)'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ fontWeight: '600', fontSize: '15px' }}>
                                                {isComplete && '🎉 '}{goal.title}
                                            </span>
                                            <button
                                                onClick={() => deleteGoal(goal.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#606070',
                                                    padding: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                            <span style={{ color: '#A0A0B0' }}>{formatRupiah(goal.currentAmount)}</span>
                                            <span style={{ color: '#606070' }}>{formatRupiah(goal.targetAmount)}</span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            marginBottom: '12px'
                                        }}>
                                            <div style={{
                                                width: `${Math.min(progress, 100)}%`,
                                                height: '100%',
                                                background: isComplete
                                                    ? 'linear-gradient(90deg, #00D26A, #14B8A6)'
                                                    : 'linear-gradient(90deg, #A855F7, #EC4899)',
                                                borderRadius: '4px',
                                                transition: 'width 0.5s ease',
                                                boxShadow: isComplete
                                                    ? '0 0 10px rgba(0, 210, 106, 0.5)'
                                                    : '0 0 10px rgba(168, 85, 247, 0.5)'
                                            }} />
                                        </div>
                                        {!isComplete && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {[50000, 100000, 500000].map(amount => (
                                                    <button
                                                        key={amount}
                                                        onClick={() => updateGoalProgress(goal.id, amount)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px',
                                                            fontSize: '11px',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            background: 'rgba(255,255,255,0.03)',
                                                            color: '#A0A0B0',
                                                            cursor: 'pointer',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        +{amount / 1000}K
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Transactions List */}
            {activeTab === 'transactions' && (
                <div className="card" style={{
                    background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                            {searchQuery || typeFilter !== 'all' || dateFilter !== 'all' ? 'Filtered' : 'Recent'} Transactions
                        </h2>
                        <span style={{ fontSize: '12px', color: '#606070' }}>
                            {filteredTransactions.length}{filteredTransactions.length !== transactions.length ? ` of ${transactions.length}` : ''} total
                        </span>
                    </div>

                    {filteredTransactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#606070' }}>
                            <DollarSign size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '14px' }}>No transactions yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredTransactions.slice(0, 20).map(t => (
                                <div key={t.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '14px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '12px',
                                            background: t.type === 'income'
                                                ? 'linear-gradient(135deg, rgba(0, 210, 106, 0.2), rgba(0, 210, 106, 0.1))'
                                                : 'linear-gradient(135deg, rgba(255, 71, 87, 0.2), rgba(255, 71, 87, 0.1))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `1px solid ${t.type === 'income' ? 'rgba(0, 210, 106, 0.3)' : 'rgba(255, 71, 87, 0.3)'}`
                                        }}>
                                            {t.type === 'income'
                                                ? <ArrowUpRight size={18} color="#00D26A" />
                                                : <ArrowDownRight size={18} color="#FF4757" />
                                            }
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{t.title}</div>
                                            <div style={{ fontSize: '11px', color: '#606070' }}>{t.date}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            fontWeight: '700',
                                            fontSize: '14px',
                                            color: t.type === 'income' ? '#00D26A' : '#FF4757'
                                        }}>
                                            {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => openEditTransactionModal(t)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#606070',
                                                    padding: '6px',
                                                    cursor: 'pointer',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTransaction(t.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#606070',
                                                    padding: '6px',
                                                    cursor: 'pointer',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Analytics Tab Content */}
            {activeTab === 'analytics' && (
                <div className="card" style={{
                    background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(0, 212, 255, 0.2))',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <BarChart3 size={18} color="#A855F7" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Weekly Spending Trends</h2>
                    </div>

                    {/* Chart */}
                    <div style={{ padding: '10px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '12px', fontSize: '11px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#00D26A' }} />
                                <span style={{ color: '#A0A0B0' }}>Income</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#FF4757' }} />
                                <span style={{ color: '#A0A0B0' }}>Expense</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '150px', padding: '0 4px' }}>
                            {weeklyData.map((day, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '120px' }}>
                                        <div style={{
                                            width: '12px',
                                            height: `${Math.max((day.income / maxChartValue) * 100, day.income > 0 ? 5 : 0)}%`,
                                            background: 'linear-gradient(180deg, #00D26A, #14B8A6)',
                                            borderRadius: '3px 3px 0 0',
                                            transition: 'height 0.5s ease'
                                        }} />
                                        <div style={{
                                            width: '12px',
                                            height: `${Math.max((day.expense / maxChartValue) * 100, day.expense > 0 ? 5 : 0)}%`,
                                            background: 'linear-gradient(180deg, #FF4757, #FF6B7A)',
                                            borderRadius: '3px 3px 0 0',
                                            transition: 'height 0.5s ease'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#606070' }}>{day.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{
                            padding: '16px',
                            background: 'rgba(0, 210, 106, 0.08)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 210, 106, 0.2)'
                        }}>
                            <div style={{ fontSize: '11px', color: '#A0A0B0', marginBottom: '6px' }}>This Week Income</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#00D26A' }}>
                                {formatRupiah(weeklyData.reduce((sum, d) => sum + d.income, 0))}
                            </div>
                        </div>
                        <div style={{
                            padding: '16px',
                            background: 'rgba(255, 71, 87, 0.08)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 71, 87, 0.2)'
                        }}>
                            <div style={{ fontSize: '11px', color: '#A0A0B0', marginBottom: '6px' }}>This Week Expense</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#FF4757' }}>
                                {formatRupiah(weeklyData.reduce((sum, d) => sum + d.expense, 0))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Transaction Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '380px',
                        background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '28px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                        position: 'relative'
                    }}>
                        {/* Top accent */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #FFD700, #00D4FF)',
                            borderRadius: '24px 24px 0 0'
                        }} />

                        <button
                            onClick={() => { setIsModalOpen(false); setIsEditMode(false); }}
                            style={{
                                position: 'absolute',
                                right: '20px',
                                top: '20px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#A0A0B0',
                                width: '32px',
                                height: '32px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} />
                        </button>

                        <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
                            {isEditMode ? '✏️ Edit Transaction' : '➕ New Transaction'}
                        </h3>

                        <input
                            className="input-field"
                            placeholder="What's this for?"
                            value={newTrans.title}
                            onChange={e => setNewTrans({ ...newTrans, title: e.target.value })}
                            style={{ marginBottom: '12px' }}
                        />

                        <input
                            type="number"
                            className="input-field"
                            placeholder="Amount (Rp)"
                            value={newTrans.amount}
                            onChange={e => setNewTrans({ ...newTrans, amount: e.target.value })}
                            style={{ marginBottom: '16px' }}
                        />

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <button
                                onClick={() => setNewTrans({ ...newTrans, type: 'expense' })}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: newTrans.type === 'expense' ? '2px solid #FF4757' : '1px solid rgba(255,255,255,0.1)',
                                    background: newTrans.type === 'expense' ? 'rgba(255, 71, 87, 0.15)' : 'rgba(255,255,255,0.03)',
                                    color: newTrans.type === 'expense' ? '#FF4757' : '#A0A0B0',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <ArrowDownRight size={18} />
                                Expense
                            </button>
                            <button
                                onClick={() => setNewTrans({ ...newTrans, type: 'income' })}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: newTrans.type === 'income' ? '2px solid #00D26A' : '1px solid rgba(255,255,255,0.1)',
                                    background: newTrans.type === 'income' ? 'rgba(0, 210, 106, 0.15)' : 'rgba(255,255,255,0.03)',
                                    color: newTrans.type === 'income' ? '#00D26A' : '#A0A0B0',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <ArrowUpRight size={18} />
                                Income
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setIsModalOpen(false); setIsEditMode(false); }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: '#A0A0B0',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTransaction}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                    color: '#000',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)'
                                }}
                            >
                                {isEditMode ? 'Save Changes' : 'Add Transaction'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Goal Modal */}
            {showGoalModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '380px',
                        background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '28px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                        position: 'relative'
                    }}>
                        {/* Top accent */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #A855F7, #EC4899)',
                            borderRadius: '24px 24px 0 0'
                        }} />

                        <button
                            onClick={() => setShowGoalModal(false)}
                            style={{
                                position: 'absolute',
                                right: '20px',
                                top: '20px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#A0A0B0',
                                width: '32px',
                                height: '32px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} />
                        </button>

                        <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
                            🎯 New Savings Goal
                        </h3>

                        <input
                            className="input-field"
                            placeholder="Goal name (e.g., New Laptop)"
                            value={newGoal.title}
                            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                            style={{ marginBottom: '12px' }}
                        />

                        <input
                            className="input-field"
                            type="number"
                            placeholder="Target amount (Rp)"
                            value={newGoal.targetAmount}
                            onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                            style={{ marginBottom: '24px' }}
                            onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowGoalModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: '#A0A0B0',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addGoal}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
                                    color: '#fff',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)'
                                }}
                            >
                                Create Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
