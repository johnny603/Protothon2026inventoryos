import { useMemo, useState } from 'react';
import { Camera, Download, Plus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Item, ItemCondition, ItemKind } from './types';

interface AddItemFlowProps {
  onClose: () => void;
  onAdd: (item: Pick<Item, 'name' | 'category' | 'condition' | 'kind' | 'photoUrl' | 'totalQuantity'>) => void;
}

export function AddItemFlow({ onClose, onAdd }: AddItemFlowProps) {
  const [step, setStep] = useState<'form' | 'barcode'>('form');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    condition: 'excellent' as ItemCondition,
    kind: 'single' as ItemKind,
    totalQuantity: 1,
    photoUrl: '',
  });
  const [generatedBarcode, setGeneratedBarcode] = useState('');

  const categories = [
    'Electronics',
    'Sports Equipment',
    'Fitness',
    'Weights',
    'Audio',
    'Photography',
    'Office',
    'Training',
    'IT Accessories',
  ];

  const previewPhoto = useMemo(() => formData.photoUrl || '', [formData.photoUrl]);

  const handlePhotoUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(current => ({ ...current, photoUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.photoUrl) {
      toast.error('Name, category, and item photo are required');
      return;
    }

    if (formData.totalQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    const barcode = `EQ${String(Date.now()).slice(-6)}`;
    setGeneratedBarcode(barcode);
    setStep('barcode');
  };

  const handleFinish = () => {
    onAdd(formData);
    onClose();
  };

  const handleDownloadBarcode = () => {
    toast.success('Barcode prepared for print in demo mode');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-semibold">Add InventoryOS Item</h2>
            <p className="text-sm text-gray-600">Photo-first records keep field teams from guessing.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-[260px_1fr] gap-6">
                <label className="min-h-72 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden">
                  {previewPhoto ? (
                    <img src={previewPhoto} alt="Item preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-6">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="font-semibold text-gray-900">Upload item photo</p>
                      <p className="text-sm text-gray-500 mt-1">Required for all records</p>
                      <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold">
                        <Upload className="w-4 h-4" />
                        Choose Image
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handlePhotoUpload(event.target.files?.[0])}
                  />
                </label>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., MacBook Pro 14&quot; M3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.totalQuantity}
                        onChange={(e) => {
                          const quantity = Math.max(1, Number(e.target.value));
                          setFormData({ ...formData, totalQuantity: quantity, kind: quantity > 1 ? 'bulk' : 'single' });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Inventory Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['single', 'bulk'] as ItemKind[]).map(kind => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => setFormData({ ...formData, kind, totalQuantity: kind === 'single' ? 1 : Math.max(2, formData.totalQuantity) })}
                          className={`px-4 py-3 rounded-xl border-2 transition-all capitalize font-semibold ${
                            formData.kind === kind ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {kind}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Initial Condition</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['excellent', 'good', 'fair'] as ItemCondition[]).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({ ...formData, condition: c })}
                          className={`px-4 py-3 rounded-xl border-2 transition-all capitalize ${
                            formData.condition === c
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
              >
                Continue to Barcode
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Item Ready for InventoryOS</h3>
                <p className="text-gray-600 mb-6">Attach this unique barcode before first checkout.</p>
              </div>

              <div className="grid md:grid-cols-[220px_1fr] gap-6 items-center bg-gray-50 rounded-xl p-6 border border-gray-200">
                <img src={formData.photoUrl} alt={formData.name} className="w-full aspect-square object-cover rounded-xl" />
                <div className="text-center md:text-left">
                  <div className="bg-white p-6 rounded-lg inline-block mb-4 shadow-sm">
                    <div className="space-y-1 mb-4">
                      <div className="flex gap-1 justify-center">
                        {generatedBarcode.split('').map((char, i) => (
                          <div key={`${char}-${i}`} className="w-2 h-16 bg-black" style={{ opacity: (i % 2) ? 0.3 : 1 }} />
                        ))}
                      </div>
                      <div className="text-xl font-mono font-semibold tracking-wider">{generatedBarcode}</div>
                    </div>
                    <div className="text-sm text-gray-600">{formData.name}</div>
                  </div>

                  <button
                    onClick={handleDownloadBarcode}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download & Print Barcode
                  </button>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
              >
                Finish & Add Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
