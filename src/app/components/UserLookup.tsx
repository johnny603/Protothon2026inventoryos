import { useState } from 'react';
import { AlertTriangle, Package, Search, ShieldCheck, UserX } from 'lucide-react';
import { Checkout, Item, User } from './types';
import { StatusBadge } from './StatusBadge';
import { formatDueLabel, getDaysOverdue } from '../useInventoryStore';

interface UserLookupProps {
  items: Item[];
  users: User[];
  checkouts: Checkout[];
  clock: Date;
}

export function UserLookup({ items, users, checkouts, clock }: UserLookupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.groups.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userCheckouts = selectedUser
    ? checkouts.filter(checkout => checkout.userId === selectedUser.id && checkout.status !== 'returned')
    : [];

  const overdueCount = userCheckouts.filter(checkout => checkout.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, group, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-lg mb-4">Users ({filteredUsers.length})</h3>
          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-2">
            {filteredUsers.map(user => {
              const activeLoans = checkouts.filter(checkout => checkout.userId === user.id && checkout.status !== 'returned');
              const userOverdueCount = activeLoans.filter(checkout => checkout.status === 'overdue').length;
              const blocked = !user.active || user.restricted || !user.permissions.includes('checkout');

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
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {user.roles.map(role => (
                          <span key={role} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">{role.replace('-', ' ')}</span>
                        ))}
                        {activeLoans.length > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{activeLoans.length} loans</span>}
                        {userOverdueCount > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{userOverdueCount} overdue</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {blocked ? <UserX className="w-5 h-5 text-red-600" /> : <ShieldCheck className="w-5 h-5 text-green-600" />}
                      {user.repeatOffender && <AlertTriangle className="w-4 h-4 text-orange-500" />}
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
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-2xl text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedUser.groups.join(', ')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedUser.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                    {selectedUser.active ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Metric label="Active Loans" value={userCheckouts.length} />
                  <Metric label="Overdue" value={overdueCount} danger={overdueCount > 0} />
                  <Metric label="Roles" value={selectedUser.roles.length} />
                  <Metric label="Groups" value={selectedUser.groups.length} />
                </div>

                {(selectedUser.restricted || selectedUser.repeatOffender || !selectedUser.active) && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-orange-900">Risk controls enabled</p>
                      <p className="text-sm text-orange-700">
                        {selectedUser.restricted ? 'Restricted user. ' : ''}
                        {!selectedUser.active ? 'Deactivated users cannot receive new checkouts. ' : ''}
                        {selectedUser.repeatOffender ? 'Repeated overdue behavior flagged.' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold text-lg">Current Ownership</h3>
                  </div>
                  {overdueCount > 0 && <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg">{overdueCount} overdue</span>}
                </div>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {userCheckouts.length > 0 ? userCheckouts.map(checkout => {
                    const item = items.find(candidate => candidate.id === checkout.itemId);
                    const daysOverdue = getDaysOverdue(checkout.dueDate, clock);
                    return item ? (
                      <div key={checkout.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex gap-3">
                          <img src={item.photoUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <div className="font-semibold text-gray-900 truncate">{item.name}</div>
                              <StatusBadge status={checkout.status === 'overdue' ? 'overdue' : 'checked-out'} size="sm" />
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{item.barcode} • Qty {checkout.quantity}</div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-1 bg-white rounded text-gray-600">Out: {checkout.checkoutDate.toLocaleDateString()}</span>
                              <span className={`px-2 py-1 rounded font-medium ${checkout.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600'}`}>
                                {checkout.status === 'overdue' ? `${daysOverdue} days overdue` : formatDueLabel(checkout.dueDate, clock)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  }) : (
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
              <p className="font-medium">Select a user to view ownership and risk status</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border ${danger ? 'bg-red-50 border-red-200 text-red-900' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold opacity-70">{label}</div>
    </div>
  );
}
