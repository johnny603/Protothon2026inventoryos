import { useState } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { Item, User } from './types';
import { StatusBadge } from './StatusBadge';
import { CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FastCheckoutProps {
  items: Item[];
  users: User[];
  onCheckout: (itemIds: string[], userId: string) => void;
}

export function FastCheckout({ items, users, onCheckout }: FastCheckoutProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [scannedItems, setScannedItems] = useState<Item[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleScan = (barcode: string) => {
    const item = items.find(i => i.barcode === barcode);

    if (!item) {
      toast.error(`Item not found: ${barcode}`);
      return;
    }

    if (scannedItems.find(i => i.id === item.id)) {
      toast.warning('Item already scanned');
      return;
    }

    if (item.status !== 'available') {
      toast.error(`Cannot checkout: Item is ${item.status}`);
      return;
    }

    setScannedItems([...scannedItems, item]);
    toast.success(`Added: ${item.name}`);
  };

  const handleRemoveItem = (itemId: string) => {
    setScannedItems(scannedItems.filter(i => i.id !== itemId));
  };

  const handleCheckout = () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    const user = users.find(u => u.id === selectedUser);

    if (user?.restricted) {
      toast.error(`${user.name} is restricted from checking out items`);
      return;
    }

    if (scannedItems.length === 0) {
      toast.error('No items to checkout');
      return;
    }

    onCheckout(scannedItems.map(i => i.id), selectedUser);
    toast.success(`${scannedItems.length} ${scannedItems.length === 1 ? 'item' : 'items'} checked out successfully`);
    setScannedItems([]);
    setSelectedUser('');
    setUserSearch('');
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-lg mb-4">Select User</h3>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />

        <div className="max-h-48 overflow-y-auto space-y-2">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedUser === user.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              } ${user.restricted ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                {user.restricted && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    Restricted
                  </span>
                )}
                {user.repeatOffender && (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {selectedUserData && selectedUserData.restricted && (
          <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">
              This user is restricted from checking out equipment. Please contact the equipment manager.
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-lg mb-4">Scan Items</h3>
        <BarcodeScanner onScan={handleScan} />
      </div>

      {scannedItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Scanned Items</h3>
              <p className="text-sm text-gray-600">{scannedItems.length} {scannedItems.length === 1 ? 'item' : 'items'} ready</p>
            </div>
            <button
              onClick={() => setScannedItems([])}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {scannedItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-50/50 rounded-xl border border-green-200">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{item.barcode} • {item.category}</div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={!selectedUser || selectedUserData?.restricted}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <CheckCircle className="w-5 h-5 inline-block mr-2" />
            Checkout {scannedItems.length} {scannedItems.length === 1 ? 'Item' : 'Items'}
          </button>
        </div>
      )}
    </div>
  );
}
