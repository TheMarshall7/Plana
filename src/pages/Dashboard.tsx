import { useStore } from '../store/store';
import NetWorthChart from '../components/charts/NetWorthChart';
import AccountBalanceChart from '../components/charts/AccountBalanceChart';
import MonthlyComparisonChart from '../components/charts/MonthlyComparisonChart';
import SpendingTrendChart from '../components/charts/SpendingTrendChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import PersonalizedGreeting from '../components/PersonalizedGreeting';

export default function Dashboard() {
  const { getSafeToSpend, accounts, subscriptions, transactions, addToast, users, activeUserId } = useStore();
  const activeUser = users.find(u => u.id === activeUserId) || users[0];
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
    <div className="px-5 lg:px-0 space-y-6 lg:space-y-8 animate-fade-in">
      <PersonalizedGreeting userName={activeUser?.name} />

      {/* Main Grid Layout */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">

        {/* Left Column - Main Content (8/12) */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">

          {/* 1. HERO CARD & KPIs */}
          <section className="space-y-6">
            <div className="glass-card rounded-[32px] p-8 lg:p-12 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center">
                <p className="text-emerald-200/60 text-sm font-medium tracking-wide uppercase mb-4">Safe to Spend Today</p>

                <div className="flex items-baseline gap-1 text-white mb-2">
                  <span className="text-4xl font-light text-white/30 align-top mt-2">$</span>
                  <span className="text-[5rem] leading-none font-medium tracking-tighter drop-shadow-xl text-balance">
                    {safeToSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="mt-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-xl">
                  <iconify-icon icon="solar:calendar-mark-linear" className="text-emerald-400" width="16"></iconify-icon>
                  <span className="text-sm text-white/70 font-medium">After bills · Next Payday in 4 days</span>
                </div>
              </div>
            </div>

            {/* KPI Summary Strip */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card rounded-[24px] p-5 flex flex-col items-center justify-center group hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] uppercase tracking-[0.1em] text-white/40 font-bold mb-2">Total Cash</span>
                <span className="text-lg font-semibold text-white/90">${totalCash.toLocaleString()}</span>
              </div>
              <div className="glass-card rounded-[24px] p-5 flex flex-col items-center justify-center group hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] uppercase tracking-[0.1em] text-white/40 font-bold mb-2">Monthly Income</span>
                <span className="text-lg font-semibold text-emerald-400">${monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="glass-card rounded-[24px] p-5 flex flex-col items-center justify-center group hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] uppercase tracking-[0.1em] text-white/40 font-bold mb-2">Spent This Month</span>
                <span className="text-lg font-semibold text-rose-400">${monthlySpent.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* 2. MAIN CHARTS SECTION */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-medium text-white/90">Financial Trends</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-white/50">Last 6 Months</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-1 gap-6">
              {/* Primary Net Worth Chart */}
              {accounts.filter(a => !a.archived).length > 0 && (
                <div className="glass-card rounded-[28px] p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-white/90">Net Worth Growth</h3>
                      <p className="text-xs text-white/40 mt-1">Tracking cumulative asset value</p>
                    </div>
                  </div>
                  <NetWorthChart accounts={accounts} transactions={transactions} months={6} />
                </div>
              )}

              {/* Spending Trend Chart */}
              {transactions.filter(t => t.type === 'expense').length > 0 && (
                <div className="glass-card rounded-[28px] p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-white/90">Spending Intensity</h3>
                      <p className="text-xs text-white/40 mt-1">Monthly outflow analysis</p>
                    </div>
                  </div>
                  <SpendingTrendChart transactions={transactions} months={6} />
                </div>
              )}

              {/* Monthly Comparison Chart */}
              {transactions.length > 0 && (
                <div className="glass-card rounded-[28px] p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-white/90">Cash Flow Comparison</h3>
                      <p className="text-xs text-white/40 mt-1">Income vs Expenses monthly</p>
                    </div>
                  </div>
                  <MonthlyComparisonChart transactions={transactions} months={6} />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Sidebar (4/12) */}
        <div className="lg:col-span-4 mt-8 lg:mt-0 space-y-6 lg:space-y-8">

          {/* 3. QUICK ACTIONS - Now Integrated & Responsive */}
          <section className="glass-card rounded-[28px] p-6">
            <h2 className="text-sm font-medium text-white/80 mb-6 px-1">Quick Actions</h2>
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-2 group p-3 rounded-2xl hover:bg-white/[0.03] transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                  <iconify-icon icon="solar:card-transfer-linear" width="24"></iconify-icon>
                </div>
                <span className="text-[10px] font-medium text-white/50">Transfer</span>
              </button>
              <button className="flex flex-col items-center gap-2 group p-3 rounded-2xl hover:bg-white/[0.03] transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10 group-hover:scale-110 transition-transform">
                  <iconify-icon icon="solar:bill-list-linear" width="24"></iconify-icon>
                </div>
                <span className="text-[10px] font-medium text-white/50">Add Bill</span>
              </button>
              <button className="flex flex-col items-center gap-2 group p-3 rounded-2xl hover:bg-white/[0.03] transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10 group-hover:scale-110 transition-transform">
                  <iconify-icon icon="solar:pie-chart-2-linear" width="24"></iconify-icon>
                </div>
                <span className="text-[10px] font-medium text-white/50">Budget</span>
              </button>
              <button className="flex flex-col items-center gap-2 group p-3 rounded-2xl hover:bg-white/[0.03] transition-all">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/10 group-hover:scale-110 transition-transform">
                  <iconify-icon icon="solar:target-linear" width="24"></iconify-icon>
                </div>
                <span className="text-[10px] font-medium text-white/50">Goals</span>
              </button>
            </div>
          </section>

          {/* 4. UPCOMING BILLS */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm font-medium text-white/80">Upcoming Bills</h2>
              <button className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Calendar</button>
            </div>
            <div className="space-y-3">
              {upcomingBills.length > 0 ? (
                upcomingBills.map((bill) => (
                  <div key={bill.id} className="glass-card rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/[0.03] transition-colors border border-white/[0.02]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                        <iconify-icon icon="solar:bill-list-linear" width="20"></iconify-icon>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/90">{bill.name}</p>
                        <p className="text-[10px] text-white/40 font-medium">Due in {bill.dueDate - now.getDate()} days</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white/90">-${bill.amount.toFixed(0)}</p>
                  </div>
                ))
              ) : (
                <div className="glass-card rounded-2xl p-6 text-center">
                  <p className="text-xs text-white/40 font-medium">No bills for the next few days</p>
                </div>
              )}
            </div>
          </section>

          {/* 6. DISTRIBUTION CHART - Smaller in sidebar */}
          {accounts.filter(a => !a.archived).length > 0 && (
            <div className="space-y-6 lg:space-y-8">
              <section className="glass-card rounded-[28px] p-6">
                <h3 className="text-sm font-medium text-white/90 mb-6 px-1">Asset Allocation</h3>
                <div className="h-64">
                  <AccountBalanceChart accounts={accounts} transactions={transactions} />
                </div>
              </section>

              <section className="glass-card rounded-[28px] p-6">
                <h3 className="text-sm font-medium text-white/90 mb-6 px-1">Spending Categories</h3>
                <div className="h-64">
                  <CategoryPieChart transactions={transactions} type="expense" />
                </div>
              </section>
            </div>
          )}

          {/* 5. NEXT MOVE / INSIGHT */}
          <section className="glass-card rounded-[28px] p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex-shrink-0 flex items-center justify-center border border-yellow-500/10">
                <iconify-icon icon="solar:star-linear" className="text-yellow-400" width="20"></iconify-icon>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/90 mb-1">Financial Tip</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-4">You have a $200 surplus. Moving it to "Emergency Fund" would reach your 3-month goal 2 weeks earlier.</p>
                <button
                  onClick={() => addToast('Strategy applied to Emergency Fund', 'success')}
                  className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Apply Strategy
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
