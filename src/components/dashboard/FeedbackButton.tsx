'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Star } from 'lucide-react';
import { FeedbackService } from '@/services/feedbackService';
import { useTenant } from '@/context/TenantContext';
import { toast } from 'sonner';

export default function FeedbackButton() {
    const { tenant } = useTenant();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [category, setCategory] = useState<'bug' | 'feature_request' | 'improvement' | 'other'>('improvement');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;
        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSubmitting(true);
        const { success } = await FeedbackService.submitFeedback({
            tenant_id: tenant.id,
            subject: category.replace('_', ' ').toUpperCase(),
            message,
            category,
            rating: rating || undefined
        });

        setIsSubmitting(false);
        if (success) {
            toast.success('Thank you for your feedback! It helps us build a better SOLO.');
            setIsOpen(false);
            setMessage('');
            setRating(0);
        } else {
            toast.error('Failed to submit feedback. Please try again.');
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 p-4 rounded-full bg-teal-600 text-white shadow-lg hover:shadow-teal-500/20 transition-all active:scale-95 group z-40"
                aria-label="Give Feedback"
            >
                <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>

            {/* Premium Glass Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Merchant Insights</h3>
                                <p className="text-sm text-gray-500">How can we improve your experience?</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Category Pills */}
                            <div className="flex flex-wrap gap-2">
                                {(['bug', 'feature_request', 'improvement'] as const).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${category === cat
                                                ? 'bg-teal-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cat.replace('_', ' ').toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 py-2">
                                <span className="text-sm font-medium text-gray-600">Satisfaction:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-transform active:scale-125 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= rating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message Area */}
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us more about your experience..."
                                className="w-full min-h-[120px] p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none text-sm outline-none"
                            />

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Insights
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
