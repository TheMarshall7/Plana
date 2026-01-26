export function generateGoogleCalendarLink(title: string, amount: number, dueDate: number): string {
    const now = new Date();
    // Calculate next occurrence
    let targetDate = new Date(now.getFullYear(), now.getMonth(), dueDate);
    if (targetDate < now) {
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDate);
    }

    const start = targetDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    // End 1 hour later
    targetDate.setHours(targetDate.getHours() + 1);
    const end = targetDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const details = `Reminder to pay bill: ${title} - Amount: $${amount}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pay+${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&dates=${start}/${end}&recur=RRULE:FREQ=MONTHLY`;
}
