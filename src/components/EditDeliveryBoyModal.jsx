// src/components/EditDeliveryBoyModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Car, Truck, Lock } from 'lucide-react';

const EditDeliveryBoyModal = ({ isOpen, onClose, onEditDeliveryBoy, deliveryBoy, wards = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    wardIds: [],  // ✅ CHANGED: array instead of single wardId
    vehicleType: 'bike',
    vehicleNumber: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Reset form when modal opens with delivery boy data
  useEffect(() => {
    if (deliveryBoy && isOpen) {
      setFormData({
        name: deliveryBoy.name || '',
        email: deliveryBoy.email || '',
        phone: deliveryBoy.phone || '',
        password: '',
        wardIds: deliveryBoy.wardIds || [],  // ✅ Array of ward IDs
        vehicleType: deliveryBoy.vehicleType || 'bike',
        vehicleNumber: deliveryBoy.vehicleNumber || '',
        status: deliveryBoy.status || 'active'
      });
      setShowPasswordField(false);
      setError('');
    }
  }, [deliveryBoy, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ NEW: Handle multi-select for wards
  const handleWardToggle = (wardId) => {
    setFormData(prev => {
      if (prev.wardIds.includes(wardId)) {
        return { ...prev, wardIds: prev.wardIds.filter(id => id !== wardId) };
      } else {
        return { ...prev, wardIds: [...prev.wardIds, wardId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }
    
    if (formData.wardIds.length === 0) {
      setError('Please select at least one ward');
      setLoading(false);
      return;
    }
    
    // Password validation only if user wants to change it
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        wardIds: formData.wardIds,  // ✅ Send array of ward IDs
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber.trim(),
        status: formData.status
      };
      
      // Only include password if user entered one
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await onEditDeliveryBoy(deliveryBoy._id, updateData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Failed to update delivery boy');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-3 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-md shadow-xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-5 py-3 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Truck size={18} className="sm:w-[20px] sm:h-[20px] text-[#ff0000]" />
            Edit Delivery Boy
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-[#ff0000] transition-colors p-1"
          >
            <X size={18} className="sm:w-[20px] sm:h-[20px]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="sm:w-[18px] sm:h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-xs sm:text-sm"
                placeholder="Enter full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="sm:w-[18px] sm:h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-xs sm:text-sm"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="sm:w-[18px] sm:h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-xs sm:text-sm"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Password - Optional Change */}
          <div>
            <div className="flex justify-between items-center mb-1 gap-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPasswordField(!showPasswordField)}
                className="text-[11px] sm:text-xs text-[#ff0000] hover:text-[#cc0000] whitespace-nowrap"
              >
                {showPasswordField ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showPasswordField && (
              <div className="relative">
                <Lock size={16} className="sm:w-[18px] sm:h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-xs sm:text-sm"
                  placeholder="Min 6 characters (leave blank to keep same)"
                />
              </div>
            )}
            {!showPasswordField && (
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">•••••••• (click "Change Password" to update)</p>
            )}
          </div>

          {/* ✅ CHANGED: Multi-select Wards */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Assign Wards <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-2.5 sm:p-3 max-h-40 sm:max-h-48 overflow-y-auto">
              {wards.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500 text-center">Loading wards...</p>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {wards.map((ward) => (
                    <label key={ward.wardId} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.wardIds.includes(ward.wardId)}
                        onChange={() => handleWardToggle(ward.wardId)}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff0000] rounded focus:ring-[#ff0000] flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">
                        Ward {ward.wardId} - {ward.wardName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
              Selected: {formData.wardIds.length} ward(s)
            </p>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            <div className="relative">
              <Car size={16} className="sm:w-[18px] sm:h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-xs sm:text-sm appearance-none bg-white"
              >
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
              </select>
            </div>
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Vehicle Number (Optional)
            </label>
            <div className="relative">
              <Truck size={16} className="sm:w-[18px] sm:h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-xs sm:text-sm"
                placeholder="e.g., TN-01-AB-1234"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-xs sm:text-sm appearance-none bg-white"
              >
                <option value="active">Active - Can receive orders</option>
                <option value="inactive">Inactive - Cannot receive orders</option>
              </select>
            </div>
          </div>

          {/* Buttons — Mobile: stacked full-width | Desktop: side-by-side */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-white bg-[#ff0000] rounded-lg hover:bg-[#cc0000] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation flex items-center justify-center gap-2"
            >
              {loading ? 'Updating...' : 'Update Delivery Boy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeliveryBoyModal;