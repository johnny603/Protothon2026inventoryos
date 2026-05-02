import { useState } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { Item, ItemCondition } from './types';
import { StatusBadge } from './StatusBadge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface FastReturnProps {
  items: Item[];
  onReturn: (itemId: string, condition: ItemCondition, notes?: string) => void;
}

export function FastReturn({ items, onReturn }: FastReturnProps) {
  const [scannedItem, setScannedItem] = useState<Item | null>(null);
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [notes, setNotes] = useState('');

  const handleScan = (barcode: string) => {
    const item = items.find(i => i.barcode === barcode);

    if (!item) {
      toast.error(`Item not found: ${barcode}`);
      return;
    }

    if (item.status === 'available') {
      toast.warning('This item is not checked out');
      return;
    }

    setScannedItem(item);
    setCondition(item.condition);
    setNotes('');
  };

  const handleReturn = () => {
    if (!scannedItem) return;

    onReturn(scannedItem.id, condition, notes);
    toast.success(`${scannedItem.name} returned successfully`);
    setScannedItem(null);
    setCondition('good');
    setNotes('');
  };

  const handleCancel = () => {
    setScannedItem(null);
    setCondition('good');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-lg mb-4">Scan Item to Return</h3>
        <BarcodeScanner onScan={handleScan} />
      </div>

      {scannedItem && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="pb-6 border-b border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-xl text-gray-900">{scannedItem.name}</h3>
                <p className="text-sm text-gray-600 mt-1 font-mono">{scannedItem.barcode}</p>
              </div>
              <StatusBadge status={scannedItem.status} />
            </div>
            <div className="flex gap-4 text-sm text-gray-600 mt-3">
              <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                <span className="font-medium">Category:</span> {scannedItem.category}
              </div>
              {scannedItem.checkoutDate && (
                <div className="px-3 py-1.5 bg-blue-50 rounded-lg text-blue-700">
                  <span className="font-medium">Out since:</span> {scannedItem.checkoutDate.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">Item Condition</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {(['excellent', 'good', 'fair', 'poor', 'damaged'] as ItemCondition[]).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`px-4 py-3.5 rounded-xl border-2 transition-all capitalize font-medium ${
                    condition === c
                      ? 'border-blue-500 bg-blue-50 shadow-sm scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {(condition === 'poor' || condition === 'damaged') && (
            <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <strong>Damage Report Required:</strong> Please provide details about the damage or condition issues below.
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">
              Notes {(condition === 'poor' || condition === 'damaged') && (
                <span className="text-red-600">*</span>
              )}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the return (required for damaged items)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none transition-all"
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-4 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all hover:shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleReturn}
              disabled={(condition === 'poor' || condition === 'damaged') && !notes.trim()}
              className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
