import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { format, parseISO } from 'date-fns';
import Modal from '../Modal';

export default function TripDetailsView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { trips, transactions, addItineraryItem, updateItineraryItem, deleteItineraryItem, addToast } = useStore();

    const trip = trips.find(t => t.id === id);
    const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <p className="text-white/50">Trip not found</p>
                <button onClick={() => navigate('/travel')} className="btn-primary px-4 py-2 rounded-lg">Go back to Travel</button>
            </div>
        );
    }

    const tripTransactions = transactions.filter(t => t.tripId === trip.id);
    const totalSpent = tripTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalPlanned = trip.itinerary.reduce((sum, item) => sum + (item.cost || 0), 0);
    const remainingBudget = trip.budget - totalSpent;

    // Group itinerary by date
    const groupedItinerary = useMemo(() => {
        const groups: Record<string, any[]> = {};
        trip.itinerary.forEach(item => {
            if (!groups[item.date]) groups[item.date] = [];
            groups[item.date].push(item);
        });
        // Sort items within each day by time
        Object.keys(groups).forEach(date => {
            groups[date].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        });
        return groups;
    }, [trip.itinerary]);

    const sortedDates = Object.keys(groupedItinerary).sort();

    const handleAddItem = (date?: string) => {
        setEditingItem({ date: date || trip.startDate });
        setIsItineraryModalOpen(true);
    };

    const handleEditItem = (item: any) => {
        setEditingItem(item);
        setIsItineraryModalOpen(true);
    };

    return (
        <div className="px-5 lg:px-0 py-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/travel')}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors"
                    >
                        <iconify-icon icon="solar:alt-arrow-left-linear" width="20"></iconify-icon>
                    </button>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-semibold text-white/95">{trip.name}</h1>
                        <p className="text-sm text-white/50 flex items-center gap-1.5 mt-1">
                            <iconify-icon icon="solar:map-point-linear" width="14"></iconify-icon>
                            {trip.destination} • {format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex-1 lg:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/5 flex items-center justify-center gap-2">
                        <iconify-icon icon="solar:document-text-linear" width="20"></iconify-icon>
                        Notes
                    </button>
                    <button
                        onClick={() => handleAddItem()}
                        className="flex-1 lg:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <iconify-icon icon="solar:add-circle-linear" width="20"></iconify-icon>
                        Add Activity
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-[24px] p-5">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Total Budget</p>
                    <p className="text-xl font-semibold text-white/90">${trip.budget.toLocaleString()}</p>
                </div>
                <div className="glass-card rounded-[24px] p-5">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Total Spent</p>
                    <p className="text-xl font-semibold text-rose-400">${totalSpent.toLocaleString()}</p>
                </div>
                <div className="glass-card rounded-[24px] p-5">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Remaining</p>
                    <p className={`text-xl font-semibold ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${remainingBudget.toLocaleString()}
                    </p>
                </div>
                <div className="glass-card rounded-[24px] p-5">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Planned Costs</p>
                    <p className="text-xl font-semibold text-white/90">${totalPlanned.toLocaleString()}</p>
                </div>
            </div>

            {/* Tabs / View Selector */}
            <div className="flex gap-6 border-b border-white/5 px-2">
                <button className="pb-3 text-sm font-medium text-emerald-400 border-b-2 border-emerald-400">Itinerary</button>
                <button className="pb-3 text-sm font-medium text-white/40 hover:text-white/60 transition-colors">Expenses</button>
                <button className="pb-3 text-sm font-medium text-white/40 hover:text-white/60 transition-colors">Documents</button>
            </div>

            {/* Itinerary Timeline */}
            <div className="space-y-8">
                {trip.itinerary.length === 0 ? (
                    <div className="glass-card rounded-[32px] p-12 text-center">
                        <p className="text-white/50">Your itinerary is empty. Start adding flights, hotels, or activities!</p>
                    </div>
                ) : (
                    sortedDates.map((date) => (
                        <div key={date} className="space-y-4">
                            <div className="flex items-center gap-4 px-2">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                                    <span className="text-[10px] uppercase font-bold text-white/40">{format(parseISO(date), 'MMM')}</span>
                                    <span className="text-lg font-bold text-white/90 leading-none">{format(parseISO(date), 'd')}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white/90">{format(parseISO(date), 'EEEE')}</h3>
                                    <p className="text-xs text-white/40">{groupedItinerary[date].length} activities planned</p>
                                </div>
                            </div>

                            <div className="relative pl-6 ml-6 border-l border-emerald-500/20 space-y-4">
                                {groupedItinerary[date].map((item) => (
                                    <div key={item.id} className="relative group">
                                        {/* Timeline Node */}
                                        <div className="absolute -left-[31px] top-6 w-2 h-2 rounded-full bg-emerald-500 border-4 border-[#0F2922] z-10"></div>

                                        <div
                                            className="glass-card rounded-2xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer border border-white/[0.02]"
                                            onClick={() => handleEditItem(item)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                                                        <iconify-icon
                                                            icon={
                                                                item.category === 'flight' ? 'solar:plain-linear' :
                                                                    item.category === 'stay' ? 'solar:home-linear' :
                                                                        item.category === 'food' ? 'solar:cup-hot-linear' :
                                                                            item.category === 'transport' ? 'solar:bus-linear' :
                                                                                item.category === 'activity' ? 'solar:star-linear' :
                                                                                    item.activity.toLowerCase().includes('flight') ? 'solar:plain-linear' :
                                                                                        item.activity.toLowerCase().includes('hotel') || item.activity.toLowerCase().includes('stay') ? 'solar:home-linear' :
                                                                                            item.activity.toLowerCase().includes('dinner') || item.activity.toLowerCase().includes('food') || item.activity.toLowerCase().includes('eat') ? 'solar:cup-hot-linear' :
                                                                                                'solar:star-linear'
                                                            }
                                                            width="20"
                                                        ></iconify-icon>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            {item.time && <span className="text-[10px] font-bold text-emerald-400 uppercase">{item.time}</span>}
                                                            <h4 className="text-sm font-medium text-white/90">{item.activity}</h4>
                                                        </div>
                                                        {item.location && (
                                                            <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                                                                <iconify-icon icon="solar:map-point-linear" width="10"></iconify-icon>
                                                                {item.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {item.cost && <p className="text-sm font-semibold text-white/90">${item.cost.toLocaleString()}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add activity button for this specific day */}
                                <button
                                    onClick={() => handleAddItem(date)}
                                    className="flex items-center gap-2 text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors ml-2 py-2"
                                >
                                    <iconify-icon icon="solar:add-circle-linear" width="16"></iconify-icon>
                                    Add activity for this day
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Itinerary Item Modal */}
            <ItineraryItemModal
                isOpen={isItineraryModalOpen}
                onClose={() => setIsItineraryModalOpen(false)}
                item={editingItem}
                onSave={(data: any) => {
                    if (editingItem?.id) {
                        updateItineraryItem(trip.id, editingItem.id, data);
                        addToast('Activity updated', 'success');
                    } else {
                        addItineraryItem(trip.id, data);
                        addToast('Activity added', 'success');
                    }
                    setIsItineraryModalOpen(false);
                }}
                onDelete={() => {
                    if (editingItem?.id) {
                        deleteItineraryItem(trip.id, editingItem.id);
                        addToast('Activity removed', 'info');
                        setIsItineraryModalOpen(false);
                    }
                }}
            />
        </div>
    );
}

// Inline Itinerary Modal Component for simplicity
function ItineraryItemModal({ isOpen, onClose, item, onSave, onDelete }: any) {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        activity: '',
        category: 'activity' as any,
        location: '',
        cost: '',
    });

    useEffect(() => {
        if (item) {
            setFormData({
                date: item.date || '',
                time: item.time || '',
                activity: item.activity || '',
                category: item.category || 'activity',
                location: item.location || '',
                cost: item.cost?.toString() || '',
            });
        }
    }, [item, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            cost: parseFloat(formData.cost) || 0,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item?.id ? 'Edit Activity' : 'Add Activity'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all color-scheme-dark"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Time (Optional)</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all color-scheme-dark"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        >
                            <option value="activity">Activity</option>
                            <option value="stay">Stay / Hotel</option>
                            <option value="food">Food / Dining</option>
                            <option value="flight">Flight</option>
                            <option value="transport">Transport</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Activity Name</label>
                        <input
                            type="text"
                            value={formData.activity}
                            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            placeholder="e.g., Dinner at Sushiro"
                            required
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Location</label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Address or name of place"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Expected Cost ($)</label>
                    <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="Estimated cost"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    {item?.id && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors"
                        >
                            <iconify-icon icon="solar:trash-bin-linear" width="20"></iconify-icon>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {item?.id ? 'Update' : 'Add'} Activity
                    </button>
                </div>
            </form>
        </Modal>
    );
}
