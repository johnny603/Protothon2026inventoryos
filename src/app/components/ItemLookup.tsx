import { useState } from 'react';
import { Item, User, HistoryEntry } from './types';
import { StatusBadge } from './StatusBadge';
import { Search, History } from 'lucide-react';

interface ItemLookupProps {
  items: Item[];
  users: User[];
  history: HistoryEntry[];
}

export function ItemLookup({ items, users, history }: ItemLookupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemHistory = selectedItem
    ? history.filter(h => h.itemId === selectedItem.id).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    : [];

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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-lg mb-4">Search Results ({filteredItems.length})</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredItems.map(item => {
              const holder = item.currentHolder ? users.find(u => u.id === item.currentHolder) : null;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedItem?.id === item.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.barcode} • {item.category}
                  </div>
                  {holder && (
                    <div className="text-sm text-blue-600 mt-1.5 font-medium">
                      With: {holder.name}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selectedItem ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Item Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{selectedItem.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Barcode:</span>
                    <span className="font-mono text-sm font-medium">{selectedItem.barcode}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="font-medium">{selectedItem.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Status:</span>
                    <StatusBadge status={selectedItem.status} size="sm" />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Condition:</span>
                    <span className="font-medium capitalize">{selectedItem.condition}</span>
                  </div>
                  {selectedItem.currentHolder && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-blue-50 -mx-4 px-4 rounded-lg">
                        <span className="text-sm text-blue-700 font-medium">Current Holder:</span>
                        <span className="font-semibold text-blue-900">
                          {users.find(u => u.id === selectedItem.currentHolder)?.name}
                        </span>
                      </div>
                      {selectedItem.checkoutDate && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Checkout Date:</span>
                          <span className="font-medium">
                            {selectedItem.checkoutDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {selectedItem.dueDate && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Due Date:</span>
                          <span className="font-medium">
                            {selectedItem.dueDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedItem.lastSeenWith && (
                    <div className="flex justify-between items-center py-2 bg-orange-50 -mx-4 px-4 rounded-lg">
                      <span className="text-sm text-orange-700 font-medium">Last Seen With:</span>
                      <span className="font-semibold text-orange-900">
                        {users.find(u => u.id === selectedItem.lastSeenWith)?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-lg">History</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {itemHistory.length > 0 ? itemHistory.map(entry => {
                    const user = users.find(u => u.id === entry.userId);
                    return (
                      <div key={entry.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold capitalize text-gray-900">{entry.action.replace('-', ' ')}</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">
                            {entry.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          {user?.name}
                          {entry.condition && (
                            <span className="ml-2 px-2 py-0.5 bg-white rounded text-xs capitalize">
                              {entry.condition}
                            </span>
                          )}
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-gray-600 mt-2 italic bg-white p-2 rounded">
                            "{entry.notes}"
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-sm text-gray-500 text-center py-8">
                      No history available
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Select an item to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
