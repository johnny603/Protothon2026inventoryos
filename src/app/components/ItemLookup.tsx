import { useEffect, useState } from 'react';
import { GitMerge, GitPullRequest, History, Search, ShieldAlert } from 'lucide-react';
import { HistoryEntry, Item, User } from './types';
import { StatusBadge } from './StatusBadge';
import { formatDueLabel } from '../useInventoryStore';

interface ItemLookupProps {
  items: Item[];
  users: User[];
  history: HistoryEntry[];
  onSplit: (itemId: string, quantity: number) => void;
  onMerge: (sourceItemId: string, targetItemId: string) => void;
  /** Pre-select this item ID when navigating from the dashboard overdue table. */
  initialItemId?: string;
  onClearHighlight?: () => void;
}

export function ItemLookup({ items, users, history, onSplit, onMerge, initialItemId, onClearHighlight }: ItemLookupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [splitQuantity, setSplitQuantity] = useState(1);

  // Auto-select item when navigating from the dashboard
  useEffect(() => {
    if (initialItemId) {
      const found = items.find(i => i.id === initialItemId);
      if (found) setSelectedItem(found);
    }
  }, [initialItemId, items]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemHistory = selectedItem
    ? history.filter(h => h.itemId === selectedItem.id).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    : [];

  const compatibleMergeTarget = selectedItem
    ? items.find(item => item.id !== selectedItem.id && item.name.replace(' split pack', '') === selectedItem.name.replace(' split pack', '') && item.category === selectedItem.category)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, barcode, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 text-base transition-all"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-lg mb-4">Inventory Records ({filteredItems.length})</h3>
          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-2">
            {filteredItems.map(item => {
              const holder = item.currentHolder ? users.find(u => u.id === item.currentHolder) : null;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    onClearHighlight?.();
                  }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedItem?.id === item.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex gap-3">
                    <img src={item.photoUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-semibold text-gray-900 truncate">{item.name}</div>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <div className="text-sm text-gray-600">{item.barcode} • {item.category}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.availableQuantity}/{item.totalQuantity} available • {item.kind}
                      </div>
                      {holder && (
                        <div className="text-sm text-blue-600 mt-1 font-medium">
                          Last/current holder: {holder.name}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selectedItem ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-[220px_1fr] gap-6">
                <img src={selectedItem.photoUrl} alt={selectedItem.name} className="w-full aspect-square rounded-xl object-cover bg-gray-100" />
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900">{selectedItem.name}</h3>
                      <p className="text-sm text-gray-600 font-mono mt-1">{selectedItem.barcode}</p>
                    </div>
                    <StatusBadge status={selectedItem.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Metric label="Available" value={selectedItem.availableQuantity} />
                    <Metric label="Checked Out" value={selectedItem.checkedOutQuantity} />
                    <Metric label="Damaged" value={selectedItem.damagedQuantity} />
                    <Metric label="Lost" value={selectedItem.lostQuantity} />
                  </div>

                  {(selectedItem.damageLevel !== 'none' || selectedItem.restockFlag) && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-orange-900">Risk flag active</p>
                        <p className="text-sm text-orange-700">
                          Damage: {selectedItem.damageLevel}. {selectedItem.restockFlag ? 'Restock/admin review recommended.' : 'Monitor future returns.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <h4 className="font-semibold mb-3">Record Details</h4>
                  <Detail label="Category" value={selectedItem.category} />
                  <Detail label="Type" value={selectedItem.kind} />
                  <Detail label="Condition" value={selectedItem.condition} />
                  <Detail label="Created" value={selectedItem.createdAt.toLocaleDateString()} />
                  {selectedItem.dueDate && <Detail label="Due Status" value={formatDueLabel(selectedItem.dueDate)} />}
                  {selectedItem.currentHolder && <Detail label="Current Holder" value={users.find(user => user.id === selectedItem.currentHolder)?.name || 'Unknown'} />}
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <h4 className="font-semibold mb-3">Quantity Tools</h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, selectedItem.availableQuantity - 1)}
                      value={splitQuantity}
                      onChange={(event) => setSplitQuantity(Number(event.target.value))}
                      className="w-24 px-3 py-2 rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => onSplit(selectedItem.id, splitQuantity)}
                      disabled={selectedItem.kind !== 'bulk' || selectedItem.availableQuantity <= 1}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:bg-gray-300"
                    >
                      <GitPullRequest className="w-4 h-4" />
                      Split
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => compatibleMergeTarget && onMerge(selectedItem.id, compatibleMergeTarget.id)}
                    disabled={!compatibleMergeTarget}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold disabled:bg-gray-300"
                  >
                    <GitMerge className="w-4 h-4" />
                    Merge Compatible Pack
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-lg">Traceable History</h3>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {itemHistory.length > 0 ? itemHistory.map(entry => {
                    const user = users.find(u => u.id === entry.userId);
                    return (
                      <div key={entry.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold capitalize text-gray-900">{entry.action.replace('-', ' ')}</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">
                            {entry.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          {user?.name || 'System'}
                          {entry.quantity && <span className="ml-2 px-2 py-0.5 bg-white rounded text-xs">Qty {entry.quantity}</span>}
                          {entry.damageLevel && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs capitalize">{entry.damageLevel}</span>}
                        </div>
                        {entry.notes && <div className="text-sm text-gray-600 mt-2 bg-white p-2 rounded">{entry.notes}</div>}
                      </div>
                    );
                  }) : (
                    <div className="text-sm text-gray-500 text-center py-8">No history available</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">Select an item to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-semibold">{label}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900 capitalize">{value}</span>
    </div>
  );
}
