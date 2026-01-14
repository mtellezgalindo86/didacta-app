import clsx from "clsx";

interface ChatBubbleProps {
    message: string;
    author: string;
    role: string;
    time: string;
    isOwn?: boolean;
    avatarInitials?: string;
}

export default function ChatBubble({ message, author, role, time, isOwn = false, avatarInitials = "DR" }: ChatBubbleProps) {
    return (
        <div className={clsx("flex gap-3 max-w-[80%]", isOwn ? "ml-auto flex-row-reverse" : "")}>
            <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1",
                isOwn ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
            )}>
                {avatarInitials}
            </div>

            <div className="flex flex-col gap-1">
                <div className={clsx(
                    "p-4 rounded-2xl text-sm shadow-sm",
                    isOwn ? "bg-gray-50 text-gray-800 rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                )}>
                    {message}
                </div>
                <div className={clsx("flex items-center gap-2 text-[10px] text-gray-400 font-medium", isOwn ? "flex-row-reverse" : "")}>
                    <span>{role}</span>
                    <span>•</span>
                    <span>{time}</span>
                </div>
            </div>
        </div>
    );
}
