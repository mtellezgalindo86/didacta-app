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
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center fixed w-full top-0 z-50">
                <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    <img src="/logo.png" alt="Didacta Logo" className="h-8" />
                </div>
                <div className="text-sm text-gray-400">
                    {step < 3 ? 'Casi terminamos' : 'Último paso'}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 pt-24">
                <div className="max-w-2xl w-full">
                    <div className="mb-8">
                        <div className="flex items-center justify-between text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                            <span>Paso {step} de 3</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">{title}</h1>
                    <p className="text-gray-500 mb-8 max-w-2xl text-center mx-auto">{subtitle}</p>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
