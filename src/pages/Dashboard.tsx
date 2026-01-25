import { useStore } from '../store/store';
import NetWorthChart from '../components/charts/NetWorthChart';
import AccountBalanceChart from '../components/charts/AccountBalanceChart';
import MonthlyComparisonChart from '../components/charts/MonthlyComparisonChart';
import SpendingTrendChart from '../components/charts/SpendingTrendChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';

export default function Dashboard() {
  const { getSafeToSpend, accounts, subscriptions, transactions } = useStore();
  const safeToSpend = getSafeToSpend();
  
  // Calculate KPIs
  const totalCash = accounts
    .filter(a => (a.type === 'checking' || a.type === 'savings') && !a.archived)
    .reduce((sum, a) => sum + a.balance, 0);
  
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlySpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Get upcoming bills
  const now = new Date();
  const upcomingBills = subscriptions
    .filter(s => !s.cancelled && s.dueDate >= now.getDate())
    .slice(0, 2);

  return (
    <div className="px-5 lg:px-0 space-y-5 lg:space-y-6">
      {/* Desktop: Top Row with Hero and Status */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 space-y-5">
        {/* 1. HERO CARD */}
        <section className="lg:col-span-2 glass-card rounded-[32px] p-8 lg:p-10 text-center relative overflow-hidden group animate-fade-in">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <p className="text-emerald-200/60 text-sm font-medium tracking-wide uppercase mb-4">Safe to Spend Today</p>
          
          <div className="flex items-baseline gap-1 text-white mb-2">
            <span className="text-3xl font-light text-white/50 align-top mt-2">$</span>
            <span className="text-[4rem] leading-none font-medium tracking-tighter drop-shadow-lg">
              {safeToSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
            <iconify-icon icon="solar:calendar-mark-linear" className="text-emerald-400" width="14"></iconify-icon>
            <span className="text-xs text-white/70 font-medium">After bills · Payday in 4 days</span>
          </div>
        </div>
      </section>

        {/* 2. MONEY STATUS CARD */}
        <section className="glass-card rounded-2xl p-4 lg:p-6 flex items-center justify-between animate-fade-in delay-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <iconify-icon icon="solar:check-circle-linear" width="18"></iconify-icon>
          </div>
          <p className="text-sm text-emerald-100/90 font-medium">You are on track for the week.</p>
        </div>
        <iconify-icon icon="solar:alt-arrow-right-linear" className="text-white/30" width="16"></iconify-icon>
      </section>
      </div>

      {/* 3. KPI SUMMARY STRIP */}
      <section className="grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 animate-fade-in delay-100">
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1">Cash</span>
          <span className="text-sm font-semibold text-white/90">${totalCash.toLocaleString()}</span>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1">Income</span>
          <span className="text-sm font-semibold text-emerald-200">${monthlyIncome.toLocaleString()}</span>
        </div>
        <div className="glass-card rounded-2xl p-4 lg:p-5 flex flex-col items-center justify-center">
          <span className="text-[10px] lg:text-xs uppercase tracking-wider text-white/40 font-medium mb-1">Spent</span>
          <span className="text-sm lg:text-base font-semibold text-white/90">${monthlySpent.toLocaleString()}</span>
        </div>
        <div className="hidden lg:flex glass-card rounded-2xl p-4 lg:p-5 flex-col items-center justify-center">
          <span className="text-xs uppercase tracking-wider text-white/40 font-medium mb-1">Net Worth</span>
          <span className="text-base font-semibold text-emerald-400">${(totalCash - Math.abs(accounts.filter(a => a.type === 'credit' || a.type === 'loan').reduce((sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0), 0))).toLocaleString()}</span>
        </div>
      </section>

      {/* Desktop: Middle Row with Next Move and Quick Actions */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 space-y-5">
        {/* 4. YOUR NEXT MOVE (COACHING) */}
        <section className="lg:col-span-2 glass-card rounded-2xl p-5 lg:p-6 relative overflow-hidden animate-fade-in delay-200">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-200/40 to-transparent"></div>
        
        <div className="flex gap-4">
          <div className="mt-1 w-10 h-10 rounded-full bg-yellow-500/10 flex-shrink-0 flex items-center justify-center border border-yellow-500/10">
            <iconify-icon icon="solar:idea-linear" className="text-yellow-200" width="20"></iconify-icon>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white/90 mb-1">Surplus detected</h3>
            <p className="text-xs text-white/60 leading-relaxed mb-4">You have $200 more than usual. Consider moving it to your "Trip to Japan" goal.</p>
            <button className="text-xs bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 w-fit">
              Move to Goals
              <iconify-icon icon="solar:arrow-right-linear" width="12"></iconify-icon>
            </button>
          </div>
        </div>
      </section>

        {/* 6. QUICK ACTIONS */}
        <section className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4 animate-fade-in delay-200">
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <iconify-icon icon="solar:card-transfer-linear" className="text-emerald-300" width="24"></iconify-icon>
          </div>
          <span className="text-[10px] font-medium text-white/50">Transfer</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <iconify-icon icon="solar:bill-list-linear" className="text-blue-300" width="24"></iconify-icon>
          </div>
          <span className="text-[10px] font-medium text-white/50">Add Bill</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <iconify-icon icon="solar:pie-chart-2-linear" className="text-purple-300" width="24"></iconify-icon>
          </div>
          <span className="text-[10px] font-medium text-white/50">Budget</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <iconify-icon icon="solar:target-linear" className="text-yellow-200" width="24"></iconify-icon>
          </div>
          <span className="text-[10px] lg:text-xs font-medium text-white/50">Goals</span>
        </button>
      </section>
      </div>

      {/* Desktop: Bottom Row with Bills and Charts */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 space-y-5">
        {/* 5. UPCOMING BILLS */}
        <section className="pt-2 animate-fade-in delay-300">
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-sm font-medium text-white/80">Upcoming</h2>
          <button className="text-xs text-emerald-400/80 hover:text-emerald-300 transition-colors">View Calendar</button>
        </div>

        <div className="space-y-3">
          {upcomingBills.map((bill) => (
            <div key={bill.id} className="glass-card rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-white/80">
                  <iconify-icon icon="solar:music-library-linear" width="20"></iconify-icon>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{bill.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {bill.dueDate === now.getDate() ? 'Today' : `Oct ${bill.dueDate}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white/90">-${bill.amount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

        {/* 7. CHARTS - Desktop: Show in grid, Mobile: Stack */}
        <section className="lg:pt-2 pt-4 pb-4 space-y-5 animate-fade-in delay-300">
          {/* Desktop: Charts in grid, Mobile: Stack */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 space-y-5">
            {/* Net Worth Chart */}
            {accounts.filter(a => !a.archived).length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white/90 mb-4">Net Worth Trend (6 Months)</h3>
                <NetWorthChart accounts={accounts} transactions={transactions} months={6} />
              </div>
            )}

            {/* Account Balance Distribution */}
            {accounts.filter(a => !a.archived).length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white/90 mb-4">Account Balance Distribution</h3>
                <AccountBalanceChart accounts={accounts} transactions={transactions} />
              </div>
            )}

            {/* Monthly Comparison */}
            {transactions.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white/90 mb-4">Monthly Income vs Expenses</h3>
                <MonthlyComparisonChart transactions={transactions} months={6} />
              </div>
            )}

            {/* Spending Trend */}
            {transactions.filter(t => t.type === 'expense').length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white/90 mb-4">Spending Trend (6 Months)</h3>
                <SpendingTrendChart transactions={transactions} months={6} />
              </div>
            )}

            {/* Category Breakdown */}
            {transactions.filter(t => t.type === 'expense').length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white/90 mb-4">Spending by Category</h3>
                <CategoryPieChart transactions={transactions} type="expense" />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
