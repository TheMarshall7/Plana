import { useMemo } from 'react';

interface PersonalizedGreetingProps {
    userName?: string;
}

export default function PersonalizedGreeting({ userName }: PersonalizedGreetingProps) {
    const { greeting, icon, iconColor } = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 5) return { greeting: 'Good night', icon: 'solar:moon-linear', iconColor: 'text-indigo-300' };
        if (hour < 12) return { greeting: 'Good morning', icon: 'solar:sun-2-linear', iconColor: 'text-amber-300' };
        if (hour < 17) return { greeting: 'Good afternoon', icon: 'solar:sun-fog-linear', iconColor: 'text-orange-300' };
        if (hour < 21) return { greeting: 'Good evening', icon: 'solar:sunset-linear', iconColor: 'text-rose-300' };
        return { greeting: 'Good night', icon: 'solar:moon-linear', iconColor: 'text-indigo-300' };
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
        <div className="mb-6 animate-fade-in flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl glass-card flex items-center justify-center ${iconColor} border border-white/5`}>
                <iconify-icon icon={icon} width="24"></iconify-icon>
            </div>
            <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-white/95 mb-0.5">
                    {greeting}, {displayName}
                </h1>
                <p className="text-sm text-white/50">{randomMessage}</p>
            </div>
        </div>
    );
}
