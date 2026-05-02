import { Item, User, HistoryEntry } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Johnson', email: 'sarah.j@school.edu', role: 'equipment-manager', restricted: false, repeatOffender: false },
  { id: 'u2', name: 'Mike Chen', email: 'mike.c@school.edu', role: 'coach', restricted: false, repeatOffender: false },
  { id: 'u3', name: 'Emma Davis', email: 'emma.d@school.edu', role: 'student', restricted: false, repeatOffender: false },
  { id: 'u4', name: 'James Wilson', email: 'james.w@school.edu', role: 'student', restricted: false, repeatOffender: false },
  { id: 'u5', name: 'Lisa Brown', email: 'lisa.b@school.edu', role: 'student', restricted: true, repeatOffender: true },
  { id: 'u6', name: 'Tom Martinez', email: 'tom.m@school.edu', role: 'student', restricted: false, repeatOffender: false },
];

export const mockItems: Item[] = [
  { id: 'i1', barcode: 'EQ001234', name: 'MacBook Pro 14" M3', category: 'Electronics', status: 'available', condition: 'excellent' },
  { id: 'i2', barcode: 'EQ001235', name: 'Canon EOS R6 Camera', category: 'Electronics', status: 'available', condition: 'good' },
  { id: 'i3', barcode: 'EQ001236', name: 'Badminton Racquet #23', category: 'Sports Equipment', status: 'checked-out', condition: 'good', currentHolder: 'u3', checkoutDate: new Date(2026, 4, 1), dueDate: new Date(2026, 4, 3) },
  { id: 'i4', barcode: 'EQ001237', name: 'Projector - Epson 2250U', category: 'Electronics', status: 'overdue', condition: 'fair', currentHolder: 'u4', checkoutDate: new Date(2026, 3, 28), dueDate: new Date(2026, 4, 1), lastSeenWith: 'u4' },
  { id: 'i5', barcode: 'EQ001238', name: 'Yoga Mat - Purple', category: 'Fitness', status: 'available', condition: 'excellent' },
  { id: 'i6', barcode: 'EQ001239', name: 'iPad Pro 12.9" 2024', category: 'Electronics', status: 'checked-out', condition: 'excellent', currentHolder: 'u6', checkoutDate: new Date(2026, 4, 2), dueDate: new Date(2026, 4, 5) },
  { id: 'i7', barcode: 'EQ001240', name: 'DSLR Tripod - Manfrotto', category: 'Photography', status: 'damaged', condition: 'damaged', lastSeenWith: 'u5' },
  { id: 'i8', barcode: 'EQ001241', name: 'Wireless Microphone Set', category: 'Audio', status: 'available', condition: 'good' },
  { id: 'i9', barcode: 'EQ001242', name: 'Kettlebell 15lb', category: 'Weights', status: 'overdue', condition: 'excellent', currentHolder: 'u4', checkoutDate: new Date(2026, 3, 25), dueDate: new Date(2026, 3, 30), lastSeenWith: 'u4' },
  { id: 'i10', barcode: 'EQ001243', name: 'Medicine Ball 10kg', category: 'Weights', status: 'available', condition: 'fair' },
  { id: 'i11', barcode: 'EQ001244', name: 'Sony Headphones WH-1000XM5', category: 'Audio', status: 'checked-out', condition: 'good', currentHolder: 'u3', checkoutDate: new Date(2026, 4, 2), dueDate: new Date(2026, 4, 6) },
  { id: 'i12', barcode: 'EQ001245', name: 'Agility Cones Set (12pc)', category: 'Training', status: 'available', condition: 'excellent' },
  { id: 'i13', barcode: 'EQ001246', name: 'Basketball - Wilson Evolution', category: 'Sports Equipment', status: 'available', condition: 'good' },
  { id: 'i14', barcode: 'EQ001247', name: 'Whiteboard - Mobile 6x4', category: 'Office', status: 'checked-out', condition: 'excellent', currentHolder: 'u2', checkoutDate: new Date(2026, 4, 1), dueDate: new Date(2026, 4, 8) },
  { id: 'i15', barcode: 'EQ001248', name: 'Tennis Racket - Babolat Pure', category: 'Sports Equipment', status: 'available', condition: 'excellent' },
];

export const mockHistory: HistoryEntry[] = [
  { id: 'h1', itemId: 'i3', userId: 'u3', action: 'checkout', timestamp: new Date(2026, 4, 1, 10, 30), condition: 'good' },
  { id: 'h2', itemId: 'i4', userId: 'u4', action: 'checkout', timestamp: new Date(2026, 3, 28, 14, 15), condition: 'fair' },
  { id: 'h3', itemId: 'i7', userId: 'u5', action: 'damage-report', timestamp: new Date(2026, 3, 30, 16, 45), condition: 'damaged', notes: 'Broken strings on racket' },
  { id: 'h4', itemId: 'i6', userId: 'u6', action: 'checkout', timestamp: new Date(2026, 4, 2, 9, 0), condition: 'excellent' },
  { id: 'h5', itemId: 'i9', userId: 'u4', action: 'checkout', timestamp: new Date(2026, 3, 25, 11, 20), condition: 'excellent' },
  { id: 'h6', itemId: 'i11', userId: 'u3', action: 'checkout', timestamp: new Date(2026, 4, 2, 13, 10), condition: 'good' },
];
