import clsx from "clsx";

interface SessionListItemProps {
    title: string;
    subtitle: string;
    time: string;
    status: "active" | "pending" | "completed";
    badges?: string[];
    isActive?: boolean;
    onClick?: () => void;
}

export default function SessionListItem({ title, subtitle, time, status, badges, isActive, onClick }: SessionListItemProps) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "p-4 border-l-4 cursor-pointer transition-all duration-200 hover:bg-blue-50",
                isActive ? "bg-blue-50 border-blue-600" : "bg-white border-transparent"
            )}
        >
            <div className="flex justify-between items-start mb-1">
                <h3 className={clsx("font-bold text-gray-900", isActive ? "text-blue-900" : "")}>{title}</h3>
                <span className="text-xs font-medium text-gray-500">{time}</span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{subtitle}</p>

            <div className="flex flex-wrap gap-2">
                {badges?.map((badge, index) => (
                    <span
                        key={index}
                        className={clsx(
                            "px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider",
                            badge === "NUEVO MSJ" ? "bg-blue-100 text-blue-700" : "border border-gray-200 text-gray-500"
                        )}
                    >
                        {badge}
                    </span>
                ))}
            </div>
        </div>
    );
}
