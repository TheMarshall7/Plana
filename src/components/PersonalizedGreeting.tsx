import { useMemo } from 'react';

interface PersonalizedGreetingProps {
    userName?: string;
}

export default function PersonalizedGreeting({ userName }: PersonalizedGreetingProps) {
    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        if (hour < 21) return 'Good evening';
        return 'Good night';
    }, []);

    const displayName = userName || 'there';

    const motivationalMessages = [
        "You're doing great with your finances!",
        "Every dollar saved is a step toward your goals.",
        "Your financial discipline is paying off.",
        "Keep up the excellent work!",
        "You're building a strong financial future.",
    ];

    const randomMessage = useMemo(() => {
        return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    }, []);

    return (
        <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-semibold text-white/95 mb-1">
                {greeting}, {displayName}
            </h1>
            <p className="text-sm text-white/50">{randomMessage}</p>
        </div>
    );
}
