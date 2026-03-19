export default function RootLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg animate-pulse">
                    S
                </div>
                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-primary rounded-full animate-[loading_1s_ease-in-out_infinite]" />
                </div>
            </div>
        </div>
    );
}
