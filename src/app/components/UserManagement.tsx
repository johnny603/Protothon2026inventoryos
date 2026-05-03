import { useState } from 'react';
import { Plus, QrCode, Trash2, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { User, UserRole } from './types';
import { QRCodeDisplay } from './QRCodeDisplay';

interface UserManagementProps {
  users: User[];
  onAddUser: (data: { name: string; email: string; phone?: string; role?: UserRole }) => void;
  onRemoveUser: (userId: string) => void;
}

const ROLES: UserRole[] = ['student', 'coach', 'equipment-manager'];

/**
 * User management panel:
 * – Add a user manually (name, email, optional phone, role)
 * – Remove a user (blocked if they have active loans)
 * – Display each user's QR code (encodes the unique user ID)
 * – QR scanner input: type / paste a user ID to look up / import a user
 */
export function UserManagement({ users, onAddUser, onRemoveUser }: UserManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserQR, setSelectedUserQR] = useState<User | null>(null);
  const [scannedId, setScannedId] = useState('');

  // Add-user form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }
    onAddUser({ name: formName.trim(), email: formEmail.trim(), phone: formPhone.trim() || undefined, role: formRole });
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('student');
    setShowAddForm(false);
  };

  /** QR scan flow: resolve a user by scanned ID or report not found. */
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = scannedId.trim();
    if (!id) return;
    const found = users.find(u => u.id === id);
    if (found) {
      setSelectedUserQR(found);
      toast.success(`User found: ${found.name}`);
    } else {
      toast.error(`No user found for ID: ${id}`);
    }
    setScannedId('');
  };

  return (
    <div className="space-y-6">
      {/* QR scanner lookup */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <QrCode className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg">QR User Lookup / Import</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Scan (or type) a user's QR code ID to look up their profile or import them into this session.
        </p>
        <form onSubmit={handleScanSubmit} className="flex gap-3">
          <input
            type="text"
            value={scannedId}
            onChange={e => setScannedId(e.target.value)}
            placeholder="Scan QR or paste user ID here..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Look Up
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">All Users ({users.length})</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Add user form modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Add New User</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g., Alex Kim"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="alex.k@school.edu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="+1 555 000 1234"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormRole(role)}
                      className={`px-3 py-2.5 rounded-xl border-2 capitalize font-medium text-sm transition-all ${
                        formRole === role ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {role.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                <UserCheck className="w-4 h-4 inline-block mr-2" />
                Add User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR display modal */}
      {selectedUserQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">{selectedUserQR.name}'s QR</h3>
              <button onClick={() => setSelectedUserQR(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <QRCodeDisplay value={selectedUserQR.id} size={220} label={`QR code for ${selectedUserQR.name}`} />
              <div className="text-center">
                <p className="font-semibold text-gray-900">{selectedUserQR.name}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedUserQR.email}</p>
                <p className="text-xs text-gray-400 font-mono mt-2 break-all">{selectedUserQR.id}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Scan this code at checkout to instantly select this user.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                {user.phone && <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>}
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                user.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {user.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {user.roles.map(role => (
                <span key={role} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">
                  {role.replace('-', ' ')}
                </span>
              ))}
              {user.restricted && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Restricted</span>
              )}
            </div>

            <p className="text-xs text-gray-400 font-mono truncate" title={user.id}>ID: {user.id}</p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setSelectedUserQR(user)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <QrCode className="w-4 h-4" />
                Show QR
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Remove ${user.name}? This cannot be undone.`)) {
                    onRemoveUser(user.id);
                  }
                }}
                className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Remove user"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
