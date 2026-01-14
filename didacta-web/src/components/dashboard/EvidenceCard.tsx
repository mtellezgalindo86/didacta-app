interface EvidenceCardProps {
    type: "image" | "add";
    src?: string;
    alt?: string;
    onClick?: () => void;
}

export default function EvidenceCard({ type, src, alt, onClick }: EvidenceCardProps) {
    if (type === "add") {
        return (
            <div
                onClick={onClick}
                className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors group"
            >
                <div className="p-3 bg-blue-50 rounded-full mb-2 group-hover:bg-blue-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <span className="text-xs font-bold tracking-wide uppercase">Agregar</span>
            </div>
        );
    }

    return (
        <div className="aspect-video rounded-xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
            <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
        </div>
    );
}
