import { useState } from 'react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';
import TripModal from '../components/travel/TripModal';
import { format, parseISO } from 'date-fns';

export default function Travel() {
    const { trips, addTrip, updateTrip, deleteTrip, transactions, addToast } = useStore();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [editingTrip, setEditingTrip] = useState<any>(null);

    const activeTrips = trips.filter(t => !t.isArchived);

    const handleCreate = () => {
        setEditingTrip(null);
        setIsModalOpen(true);
    };

    const handleEdit = (trip: any) => {
        setEditingTrip(trip);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this trip? All itinerary data will be lost.')) {
            deleteTrip(id);
            addToast('Trip deleted', 'error');
        }
    };

    const getTripTransactions = (tripId: string) => {
        return transactions.filter(t => t.tripId === tripId);
    };

    const getTripSpent = (tripId: string) => {
        const tripTransactions = getTripTransactions(tripId);
        return tripTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    };

    return (
        <div className="px-5 lg:px-0 py-8 space-y-6 lg:space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-semibold text-white/95">Travel Planner</h1>
                    <p className="text-sm text-white/50 mt-1">Plan your next adventure and manage costs</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <iconify-icon icon="solar:add-circle-linear" width="20"></iconify-icon>
                    <span>New Trip</span>
                </button>
            </div>

            {activeTrips.length === 0 ? (
                <div className="glass-card rounded-[32px] p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                        <iconify-icon icon="solar:suitcase-tag-bold-duotone" width="40"></iconify-icon>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white/90">No trips planned yet</h3>
                        <p className="text-sm text-white/50 max-w-xs mx-auto mt-2">
                            Start by creating your first trip to organize your itinerary and budget.
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-medium transition-colors border border-white/5"
                    >
                        Create your first trip
                    </button>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {activeTrips.map((trip) => {
                        const spent = getTripSpent(trip.id);
                        const progress = Math.min(100, (spent / trip.budget) * 100);

                        return (
                            <div
                                key={trip.id}
                                className="glass-card rounded-[28px] p-6 hover:bg-white/[0.04] transition-all cursor-pointer group border border-white/[0.02]"
                                onClick={() => navigate(`/travel/${trip.id}`)}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                            <iconify-icon icon="solar:suitcase-tag-linear" width="24"></iconify-icon>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">
                                                {trip.name}
                                            </h3>
                                            <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                                                <iconify-icon icon="solar:map-point-linear" width="12"></iconify-icon>
                                                {trip.destination}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(trip);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
                                        >
                                            <iconify-icon icon="solar:pen-linear" width="18"></iconify-icon>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(trip.id);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400/70 hover:text-red-400"
                                        >
                                            <iconify-icon icon="solar:trash-bin-linear" width="18"></iconify-icon>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="px-4 py-3 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                                        <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Dates</p>
                                        <p className="text-sm text-white/90">
                                            {format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <div className="px-4 py-3 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                                        <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Items</p>
                                        <p className="text-sm text-white/90">{trip.itinerary.length} planned activities</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs text-white/50">Budget Progress</p>
                                        <p className="text-xs font-semibold text-white/90">
                                            ${spent.toLocaleString()} / ${trip.budget.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-rose-500' : progress > 70 ? 'bg-orange-400' : 'bg-emerald-400'
                                                }`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL */}
            <TripModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                trip={editingTrip}
                onSave={(data: any) => {
                    if (editingTrip) {
                        updateTrip(editingTrip.id, data);
                        addToast('Trip updated', 'success');
                    } else {
                        addTrip(data);
                        addToast('New trip planned!', 'success');
                    }
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
