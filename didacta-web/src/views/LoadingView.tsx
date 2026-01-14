interface LoadingViewProps {
    message?: string;
}

export default function LoadingView({ message = "Cargando..." }: LoadingViewProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 cursor-wait">
            <div className="mb-8">
                <img src="/logo.png" alt="Didacta" className="h-12 w-auto animate-pulse" />
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
                <p className="text-gray-500 font-medium text-sm animate-pulse">{message}</p>
            </div>
        </div>
    );
}
