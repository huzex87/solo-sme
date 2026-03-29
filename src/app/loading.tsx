import { BrandLogo } from '@/components/shared/BrandLogo';

export default function RootLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-5">
                <BrandLogo variant="light" size={52} showText={true} textSide="bottom" />
                <div className="w-28 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-primary rounded-full animate-[loading_1s_ease-in-out_infinite]" />
                </div>
            </div>
        </div>
    );
}
