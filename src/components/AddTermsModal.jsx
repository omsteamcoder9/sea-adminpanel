// src/components/AddTermsModal.jsx
import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';

const AddTermsModal = ({ isOpen, onClose, onAddTerms }) => {
  const [formData, setFormData] = useState({
    termsOfServiceTitle: 'Terms of Service',
    termsImportantNotice: 'These Terms of Service govern your use of our website and services. By using our website, you acknowledge that you have read, understood, and agree to be bound by these terms.',
    termsUserRequirements: [
      'You must be at least 18 years old to place an order',
      'Payment processing is handled by secure third-party providers',
      'All product images are for illustrative purposes only',
      'Shipping times are estimates and not guarantees',
      'We reserve the right to refuse service to anyone'
    ],
    termsSections: [
      { number: 1, title: 'Agreement to Terms', content: 'By accessing and using our website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Website.' },
      { number: 2, title: 'User Accounts', content: 'When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account.' },
      { number: 3, title: 'Product Information', content: 'We make every effort to display as accurately as possible the colors, features, specifications, and details of products available on the Website.' },
      { number: 4, title: 'Orders and Payment', content: 'By placing an order through our Website, you warrant that you are legally capable of entering into binding contracts and are at least 18 years old.' },
      { number: 5, title: 'Shipping and Delivery', content: 'Shipping times and costs will vary depending on your location and the shipping method selected.' },
      { number: 6, title: 'Returns and Refunds', content: 'Please review our Returns Policy for detailed information about returning products.' },
      { number: 7, title: 'Intellectual Property', content: 'All content on this Website, including text, graphics, logos, images, and software, is the property of our company.' },
      { number: 8, title: 'Limitation of Liability', content: 'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.' },
      { number: 9, title: 'Changes to Terms', content: 'We reserve the right to modify these terms at any time.' },
      { number: 10, title: 'Contact Information', content: 'Questions about the Terms of Service should be sent to us at the contact information provided in our website footer.' }
    ],
    termsIntellectualProperty: 'All content on this Website, including text, graphics, logos, images, and software, is the property of our company or its content suppliers and is protected by copyright and other intellectual property laws.',
    termsLimitationLiability: 'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Website.',
    termsChangesNotice: 'We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the "Last updated" date.',
    termsContactInfo: 'Questions about the Terms of Service should be sent to us at the contact information provided in our website footer.'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequirementChange = (index, value) => {
    const updatedRequirements = [...formData.termsUserRequirements];
    updatedRequirements[index] = value;
    setFormData(prev => ({ ...prev, termsUserRequirements: updatedRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      termsUserRequirements: [...prev.termsUserRequirements, '']
    }));
  };

  const removeRequirement = (index) => {
    const updatedRequirements = formData.termsUserRequirements.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, termsUserRequirements: updatedRequirements }));
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.termsSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData(prev => ({ ...prev, termsSections: updatedSections }));
  };

  const addSection = () => {
    const newNumber = formData.termsSections.length + 1;
    setFormData(prev => ({
      ...prev,
      termsSections: [
        ...prev.termsSections,
        { number: newNumber, title: 'New Section', content: 'Section content goes here...' }
      ]
    }));
  };

  const removeSection = (index) => {
    const updatedSections = formData.termsSections.filter((_, i) => i !== index);
    const renumberedSections = updatedSections.map((section, idx) => ({
      ...section,
      number: idx + 1
    }));
    setFormData(prev => ({ ...prev, termsSections: renumberedSections }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.termsOfServiceTitle) {
      setError('Terms of Service Title is required');
      setLoading(false);
      return;
    }

    for (const section of formData.termsSections) {
      if (!section.title || !section.content) {
        setError('All sections must have a title and content');
        setLoading(false);
        return;
      }
    }

    try {
      await onAddTerms(formData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Failed to add terms of service');
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add Terms of Service</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-[#ff0000] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'text-[#ff0000] border-b-2 border-[#ff0000]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('requirements')}
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === 'requirements'
                  ? 'text-[#ff0000] border-b-2 border-[#ff0000]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              User Requirements
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sections')}
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === 'sections'
                  ? 'text-[#ff0000] border-b-2 border-[#ff0000]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Terms Sections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('legal')}
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === 'legal'
                  ? 'text-[#ff0000] border-b-2 border-[#ff0000]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Legal Info
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms of Service Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="termsOfServiceTitle"
                  value={formData.termsOfServiceTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Important Notice
                </label>
                <textarea
                  name="termsImportantNotice"
                  value={formData.termsImportantNotice}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                  placeholder="Enter important notice"
                />
              </div>
            </div>
          )}

          {/* User Requirements Tab */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  User Requirements
                </label>
                <button
                  type="button"
                  onClick={addRequirement}
                  className="text-sm text-[#ff0000] hover:text-[#cc0000] flex items-center gap-1"
                >
                  <Plus size={16} /> Add Requirement
                </button>
              </div>
              
              {formData.termsUserRequirements.map((requirement, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                      placeholder={`Requirement ${index + 1}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Terms Sections Tab */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Terms Sections
                </label>
                <button
                  type="button"
                  onClick={addSection}
                  className="text-sm text-[#ff0000] hover:text-[#cc0000] flex items-center gap-1"
                >
                  <Plus size={16} /> Add Section
                </button>
              </div>
              
              {formData.termsSections.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Section {section.number}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                      placeholder="Section title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section Content
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                      placeholder="Section content"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legal Info Tab */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intellectual Property
                </label>
                <textarea
                  name="termsIntellectualProperty"
                  value={formData.termsIntellectualProperty}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                  placeholder="Intellectual property content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limitation of Liability
                </label>
                <textarea
                  name="termsLimitationLiability"
                  value={formData.termsLimitationLiability}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                  placeholder="Limitation of liability content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Changes Notice
                </label>
                <textarea
                  name="termsChangesNotice"
                  value={formData.termsChangesNotice}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                  placeholder="Changes notice content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Information
                </label>
                <textarea
                  name="termsContactInfo"
                  value={formData.termsContactInfo}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                  placeholder="Contact information"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-lg hover:from-[#cc0000] hover:to-[#aa0000] disabled:opacity-50 transition-all duration-200 shadow-md"
            >
              {loading ? 'Adding...' : 'Add Terms of Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTermsModal;