import React from 'react';

import UserProfileMenu from '../../components/UserProfileMenu';

interface OnboardingLayoutProps {
    step: number;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function OnboardingLayout({ step, title, subtitle, children, maxWidth = "max-w-2xl" }: OnboardingLayoutProps) {
    const totalSteps = 5;

    return (
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Didacta" className="h-8 w-auto" />
                    </div>
                    <UserProfileMenu />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 pt-24">
                <div className={`${maxWidth} w-full`}>
                    <div className="mb-8">
                        <div className="flex items-center justify-between text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                            <span>Paso {step} de {totalSteps}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
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
