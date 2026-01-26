import { useState, useEffect } from 'react';
import Modal from '../Modal';

interface TripModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip: any | null;
    onSave: (data: any) => void;
}

export default function TripModal({ isOpen, onClose, trip, onSave }: TripModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        startDate: '',
        endDate: '',
        budget: '',
        notes: '',
    });

    useEffect(() => {
        if (trip) {
            setFormData({
                name: trip.name,
                destination: trip.destination,
                startDate: trip.startDate,
                endDate: trip.endDate,
                budget: trip.budget.toString(),
                notes: trip.notes || '',
            });
        } else {
            setFormData({
                name: '',
                destination: '',
                startDate: '',
                endDate: '',
                budget: '',
                notes: '',
            });
        }
    }, [trip, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            budget: parseFloat(formData.budget) || 0,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={trip ? 'Edit Trip' : 'Plan New Trip'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Trip Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Summer in Japan"
                        required
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Destination</label>
                    <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        placeholder="City, Country"
                        required
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Start Date</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all color-scheme-dark"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">End Date</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all color-scheme-dark"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Budget ($)</label>
                    <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="Total trip budget"
                        required
                        min="0"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Travel documents, confirmation numbers, etc."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                    />
                </div>

                <div className="flex gap-3 pt-4">
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
                        {trip ? 'Update Trip' : 'Start Planning'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
