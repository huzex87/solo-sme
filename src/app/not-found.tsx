import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center noise-bg">
            <div className="max-w-md w-100 p-8 glass-card border-glass shadow-glow-primary animate-fadeIn">
                <div className="text-8xl font-black mb-4 gradient-text opacity-50">404</div>
                <h1 className="text-3xl font-black mb-2 text-primary">Page Not Found</h1>
                <p className="text-secondary mb-8 leading-relaxed">
                    The requested page doesn&apos;t exist or has been moved.
                    Let&apos;s get you back on track.
                </p>
                <div className="flex flex-col gap-3">
                    <Link
                        href="/dashboard"
                        className="btn btn-primary w-full py-4 text-sm font-bold tracking-widest uppercase"
                    >
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="btn btn-ghost w-full py-4 text-sm font-bold tracking-widest uppercase"
                    >
                        Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
