import React from 'react';

interface OnboardingLayoutProps {
    step: number;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export default function OnboardingLayout({ step, title, subtitle, children }: OnboardingLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
                <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-md text-white flex items-center justify-center">D</div>
                    Didacta
                </div>
                <div className="text-sm text-gray-400">
                    {step < 3 ? 'Casi terminamos' : 'Último paso'}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 max-w-5xl mx-auto w-full p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                        <span>Paso {step} de 3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                <p className="text-gray-500 mb-8 max-w-2xl">{subtitle}</p>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
