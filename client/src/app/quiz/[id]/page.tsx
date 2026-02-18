'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { startQuiz, getQuizQuestions, submitAnswer, completeQuiz } from '../../../services/quizService';
import { AlertTriangle, Timer, XCircle } from 'lucide-react';

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const levelId = params.id as string;

    // State variables
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [timer, setTimer] = useState(600); // 10 minutes
    const [warnings, setWarnings] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string; correctOption?: number } | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // Refs
    const questionStartTime = useRef(Date.now());

    // Computed values
    const currentQuestion = questions[currentIndex];

    // Initialize quiz
    useEffect(() => {
        const initQuiz = async () => {
            try {
                // Start quiz session
                const session = await startQuiz(levelId);
                setSessionId(session.id);

                // Get questions
                const quizQuestions = await getQuizQuestions(levelId);
                setQuestions(quizQuestions);
                setLoading(false);
                questionStartTime.current = Date.now();
            } catch (error) {
                console.error('Error initializing quiz:', error);
                router.push('/subjects');
            }
        };

        initQuiz();
    }, [levelId, router]);

    // Timer countdown
    useEffect(() => {
        if (loading || !sessionId) return;

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    finishQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [loading, sessionId]);

    // Tab switch detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && sessionId) {
                setWarnings(prev => {
                    const newWarnings = prev + 1;
                    if (newWarnings >= 3) {
                        finishQuiz();
                    } else {
                        setShowWarning(true);
                    }
                    return newWarnings;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [sessionId]);

    // Prevent copy/paste
    useEffect(() => {
        const preventCopy = (e: Event) => e.preventDefault();
        document.addEventListener('copy', preventCopy);
        document.addEventListener('paste', preventCopy);
        document.addEventListener('contextmenu', preventCopy);

        return () => {
            document.removeEventListener('copy', preventCopy);
            document.removeEventListener('paste', preventCopy);
            document.removeEventListener('contextmenu', preventCopy);
        };
    }, []);

    const handleAnswer = async (optionId: number) => {
        if (!sessionId || selectedOption !== null) return; // Prevent multiple clicks

        setSelectedOption(optionId);
        const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
        const currentQ = questions[currentIndex];

        try {
            const res = await submitAnswer({
                sessionId,
                questionId: currentQ.id,
                selectedOptionId: optionId,
                timeTaken
            });

            setFeedback({
                isCorrect: res.isCorrect,
                text: res.feedback,
                correctOption: res.correctOption
            });

        } catch (error) {
            console.error("Error submitting answer:", error);
        }
    };

    const nextQuestion = () => {
        setFeedback(null);
        setSelectedOption(null);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            questionStartTime.current = Date.now();
        } else {
            finishQuiz();
        }
    };

    const [showQuitConfirm, setShowQuitConfirm] = useState(false);

    // Refs
    // ... (existing refs)

    const finishQuiz = async () => {
        if (!sessionId) {
            router.push('/subjects');
            return;
        }
        setLoading(true);
        try {
            const res = await completeQuiz(sessionId);
            const dataStr = encodeURIComponent(JSON.stringify(res));
            router.push(`/quiz/result/${sessionId}?data=${dataStr}`);
        } catch (error) {
            console.error("Error completing quiz:", error);
            router.push('/subjects');
        }
    };

    const handleQuitClick = () => {
        setShowQuitConfirm(true);
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white flex flex-col select-none relative overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#151B2D] relative z-30">
                <div className="flex items-center gap-4">
                    <button onClick={handleQuitClick} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                        <XCircle size={24} />
                    </button>
                    <div className="h-4 w-px bg-gray-700"></div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">Question {currentIndex + 1} / {questions.length}</span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full text-sm">
                        <Timer size={14} className="text-cyan-400" />
                        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-red-500 hidden md:flex">
                        <AlertTriangle size={18} />
                        <span className="font-bold text-sm">Warnings: {warnings}/3</span>
                    </div>
                    <button onClick={handleQuitClick} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 text-xs font-bold transition-all">
                        Quit Test
                    </button>
                </div>
            </div>

            {/* Main Content ... (Keep same) */}
            <div className="flex-1 flex items-center justify-center p-8 pb-32">
                <div className="max-w-3xl w-full relative z-10">
                    <h2 className="text-2xl font-bold mb-8 leading-relaxed">
                        {currentQuestion?.content}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion?.options.map((opt: any) => {
                            let statusClass = "bg-[#1A2333] border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/10";
                            if (selectedOption !== null) {
                                if (opt.id === feedback?.correctOption) {
                                    statusClass = "bg-green-500/20 border-green-500 text-green-400"; // Correct Answer
                                } else if (opt.id === selectedOption && !feedback?.isCorrect) {
                                    statusClass = "bg-red-500/20 border-red-500 text-red-400"; // Wrong Selection
                                } else {
                                    statusClass = "bg-gray-800/50 border-gray-800 opacity-50"; // Others
                                }
                            }

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleAnswer(opt.id)}
                                    disabled={selectedOption !== null}
                                    className={`p-6 border rounded-xl transition-all text-left group relative overflow-hidden ${statusClass}`}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${selectedOption !== null && opt.id === feedback?.correctOption ? 'bg-green-500 text-white' :
                                            selectedOption === opt.id && !feedback?.isCorrect ? 'bg-red-500 text-white' :
                                                'bg-gray-800 text-gray-400'
                                            }`}>
                                            {String.fromCharCode(64 + opt.id)}
                                        </div>
                                        <span className="text-lg">{opt.text}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Feedback Bottom Sheet ... (Keep same) */}
            <div className={`fixed bottom-0 left-0 w-full bg-[#151B2D] border-t border-gray-700 p-8 transform transition-transform duration-300 z-20 ${feedback ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="pr-8">
                        <div className={`text-xl font-bold mb-1 ${feedback?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {feedback?.isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
                        </div>
                        <p className="text-gray-400 line-clamp-2">{feedback?.text}</p>
                    </div>
                    <button
                        onClick={nextQuestion}
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors shrink-0"
                    >
                        {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                </div>
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-[#151B2D] p-8 rounded-3xl border border-red-500/50 max-w-md text-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Warning!</h3>
                        <p className="text-gray-400 mb-6">
                            Tab switching is strictly prohibited. You have used {warnings} of 3 warnings.
                            Further violations will result in immediate disqualification.
                        </p>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            )}

            {/* Quit Confirmation Modal */}
            {showQuitConfirm && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-[#151B2D] p-8 rounded-3xl border border-gray-700 max-w-md text-center shadow-2xl">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Quit Test?</h3>
                        <p className="text-gray-400 mb-8">
                            Are you sure you want to quit? Your current progress will be submitted as is, and this attempt will be counted.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowQuitConfirm(false)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowQuitConfirm(false);
                                    finishQuiz();
                                }}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20"
                            >
                                Yes, Quit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

