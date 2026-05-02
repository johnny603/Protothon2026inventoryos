import { useState } from 'react';
import { Item, User } from './types';
import { StatusBadge } from './StatusBadge';
import { Search, AlertTriangle, Package } from 'lucide-react';

interface UserLookupProps {
  items: Item[];
  users: User[];
}

export function UserLookup({ items, users }: UserLookupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userItems = selectedUser
    ? items.filter(item => item.currentHolder === selectedUser.id)
    : [];

  const overdueCount = userItems.filter(item => item.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-lg mb-4">Users ({filteredUsers.length})</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredUsers.map(user => {
              const userItemCount = items.filter(item => item.currentHolder === user.id).length;
              const userOverdueCount = items.filter(item => item.currentHolder === user.id && item.status === 'overdue').length;

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{user.role.replace('-', ' ')}</span>
                        {userItemCount > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {userItemCount} {userItemCount === 1 ? 'item' : 'items'}
                          </span>
                        )}
                        {userOverdueCount > 0 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            {userOverdueCount} overdue
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {user.restricted && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Restricted
                        </span>
                      )}
                      {user.repeatOffender && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selectedUser ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">User Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className="font-medium capitalize">{selectedUser.role.replace('-', ' ')}</span>
                  </div>
                  {selectedUser.restricted && (
                    <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 mt-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-red-700">User is restricted from equipment checkout</span>
                    </div>
                  )}
                  {selectedUser.repeatOffender && (
                    <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-center gap-3 mt-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-orange-700">Repeat offender flagged</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold text-lg">Checked Out Items</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                      {userItems.length} total
                    </span>
                    {overdueCount > 0 && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
                        {overdueCount} overdue
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {userItems.length > 0 ? userItems.map(item => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {item.barcode} • {item.category}
                      </div>
                      <div className="flex gap-2 text-xs">
                        {item.checkoutDate && (
                          <span className="px-2 py-1 bg-white rounded text-gray-600">
                            Out: {item.checkoutDate.toLocaleDateString()}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className={`px-2 py-1 rounded font-medium ${
                            item.status === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-white text-gray-600'
                          }`}>
                            Due: {item.dueDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
                      No items currently checked out
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
