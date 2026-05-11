// src/components/AddPrivacyModal.jsx
import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';

const AddPrivacyModal = ({ isOpen, onClose, onAddPrivacy }) => {
  const [formData, setFormData] = useState({
    privacyPolicyTitle: 'Privacy Policy',
    privacyIntroduction: 'This Privacy Policy describes how we collect, use, and handle your personal information when you use our website and services.',
    privacyDataCollection: [
      'Name and contact information (email, phone number, address)',
      'Account credentials (username, password)',
      'Payment information (processed securely by third-party providers)',
      'Order history and preferences',
      'Device information (IP address, browser type, operating system)',
      'Usage data (pages visited, time spent, interactions)'
    ],
    privacyDataUsage: [
      'Process and fulfill your orders',
      'Communicate with you about your account or orders',
      'Send you marketing communications (with your consent)',
      'Improve and optimize our website and services',
      'Detect and prevent fraud or security issues',
      'Comply with legal obligations'
    ],
    privacyDataSharing: [
      'Service providers (payment processors, shipping carriers, email services)',
      'Legal authorities (when required by law or to protect our rights)',
      'Business transfers (in case of merger, acquisition, or sale)',
      'Third-party analytics providers (Google Analytics, etc.)'
    ],
    privacyDataSecurity: 'We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, access controls, and regular security assessments. However, no method of transmission over the Internet is 100% secure.',
    privacyUserRights: [
      'Access your personal data',
      'Correct inaccurate or incomplete data',
      'Request deletion of your data',
      'Object to or restrict data processing',
      'Data portability',
      'Withdraw consent at any time'
    ],
    privacyCookies: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.',
    privacyThirdPartyLinks: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to read their privacy policies.',
    privacyPolicyChanges: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
    privacyContactInfo: 'If you have any questions about this Privacy Policy or our data practices, please contact us through the information provided in our website footer.',
    privacySections: [
      { number: 1, title: 'Information We Collect', content: 'We collect personal information that you provide directly to us, such as when you create an account, place an order, or contact us for support.' },
      { number: 2, title: 'How We Use Your Information', content: 'We use your information to process orders, communicate with you, improve our services, and protect against fraud.' },
      { number: 3, title: 'Information Sharing', content: 'We do not sell your personal information. We may share your information with service providers who assist in our operations.' },
      { number: 4, title: 'Data Security', content: 'We implement reasonable security measures to protect your personal information from unauthorized access or disclosure.' },
      { number: 5, title: 'Your Rights', content: 'Depending on your location, you may have rights to access, correct, or delete your personal information.' },
      { number: 6, title: 'Cookies and Tracking', content: 'We use cookies to improve your browsing experience and analyze site traffic.' },
      { number: 7, title: "Children's Privacy", content: 'Our services are not directed to children under 13, and we do not knowingly collect information from children.' },
      { number: 8, title: 'Changes to This Policy', content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.' },
      { number: 9, title: 'Contact Us', content: 'If you have questions about this Privacy Policy, please contact us using the information in our website footer.' }
    ]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayItemChange = (arrayName, index, value) => {
    const updatedArray = [...formData[arrayName]];
    updatedArray[index] = value;
    setFormData(prev => ({ ...prev, [arrayName]: updatedArray }));
  };

  const addArrayItem = (arrayName, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultValue]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    const updatedArray = formData[arrayName].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [arrayName]: updatedArray }));
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.privacySections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData(prev => ({ ...prev, privacySections: updatedSections }));
  };

  const addSection = () => {
    const newNumber = formData.privacySections.length + 1;
    setFormData(prev => ({
      ...prev,
      privacySections: [
        ...prev.privacySections,
        { number: newNumber, title: 'New Section', content: 'Section content goes here...' }
      ]
    }));
  };

  const removeSection = (index) => {
    const updatedSections = formData.privacySections.filter((_, i) => i !== index);
    const renumberedSections = updatedSections.map((section, idx) => ({
      ...section,
      number: idx + 1
    }));
    setFormData(prev => ({ ...prev, privacySections: renumberedSections }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.privacyPolicyTitle) {
      setError('Privacy Policy Title is required');
      setLoading(false);
      return;
    }

    for (const section of formData.privacySections) {
      if (!section.title || !section.content) {
        setError('All sections must have a title and content');
        setLoading(false);
        return;
      }
    }

    try {
      await onAddPrivacy(formData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Failed to add privacy policy');
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
          <h2 className="text-xl font-semibold text-gray-800">Add Privacy Policy</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-[#D97A22] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6 overflow-x-auto">
          <div className="flex gap-4 whitespace-nowrap">
            <button type="button" onClick={() => setActiveTab('basic')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'basic' ? 'text-[#D97A22] border-b-2 border-[#D97A22]' : 'text-gray-500 hover:text-gray-700'}`}>Basic Info</button>
            <button type="button" onClick={() => setActiveTab('collection')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'collection' ? 'text-[#D97A22] border-b-2 border-[#D97A22]' : 'text-gray-500 hover:text-gray-700'}`}>Data Collection</button>
            <button type="button" onClick={() => setActiveTab('usage')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'usage' ? 'text-[#D97A22] border-b-2 border-[#D97A22]' : 'text-gray-500 hover:text-gray-700'}`}>Data Usage</button>
            <button type="button" onClick={() => setActiveTab('sharing')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'sharing' ? 'text-[#D97A22] border-b-2 border-[#D97A22]' : 'text-gray-500 hover:text-gray-700'}`}>Data Sharing</button>
            <button type="button" onClick={() => setActiveTab('rights')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'rights' ? 'text-[#D97A22] border-b-2 border-[#D97A22]' : 'text-gray-500 hover:text-gray-700'}`}>User Rights</button>
            <button type="button" onClick={() => setActiveTab('sections')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'sections' ? 'text-[#D97A22] border-b-2 border-[#D97A22]' : 'text-gray-500 hover:text-gray-700'}`}>Sections</button>
            <button type="button" onClick={() => setActiveTab('legal')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'legal' ? 'text-[#D97A22] border-b-2 border-[#D97A22]' : 'text-gray-500 hover:text-gray-700'}`}>Legal Info</button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy Title <span className="text-red-500">*</span></label>
                <input type="text" name="privacyPolicyTitle" value={formData.privacyPolicyTitle} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Introduction</label>
                <textarea name="privacyIntroduction" value={formData.privacyIntroduction} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22] focus:border-transparent" />
              </div>
            </div>
          )}

          {/* Data Collection Tab */}
          {activeTab === 'collection' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Data Collection Items</label>
                <button type="button" onClick={() => addArrayItem('privacyDataCollection', '')} className="text-sm text-[#D97A22] hover:text-[#c56a1e] flex items-center gap-1"><Plus size={16} /> Add Item</button>
              </div>
              {formData.privacyDataCollection.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1"><input type="text" value={item} onChange={(e) => handleArrayItemChange('privacyDataCollection', index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" placeholder={`Item ${index + 1}`} /></div>
                  <button type="button" onClick={() => removeArrayItem('privacyDataCollection', index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Data Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Data Usage Items</label>
                <button type="button" onClick={() => addArrayItem('privacyDataUsage', '')} className="text-sm text-[#D97A22] hover:text-[#c56a1e] flex items-center gap-1"><Plus size={16} /> Add Item</button>
              </div>
              {formData.privacyDataUsage.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1"><input type="text" value={item} onChange={(e) => handleArrayItemChange('privacyDataUsage', index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" placeholder={`Item ${index + 1}`} /></div>
                  <button type="button" onClick={() => removeArrayItem('privacyDataUsage', index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Data Sharing Tab */}
          {activeTab === 'sharing' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Data Sharing Items</label>
                <button type="button" onClick={() => addArrayItem('privacyDataSharing', '')} className="text-sm text-[#D97A22] hover:text-[#c56a1e] flex items-center gap-1"><Plus size={16} /> Add Item</button>
              </div>
              {formData.privacyDataSharing.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1"><input type="text" value={item} onChange={(e) => handleArrayItemChange('privacyDataSharing', index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" placeholder={`Item ${index + 1}`} /></div>
                  <button type="button" onClick={() => removeArrayItem('privacyDataSharing', index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          )}

          {/* User Rights Tab */}
          {activeTab === 'rights' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">User Rights</label>
                <button type="button" onClick={() => addArrayItem('privacyUserRights', '')} className="text-sm text-[#D97A22] hover:text-[#c56a1e] flex items-center gap-1"><Plus size={16} /> Add Right</button>
              </div>
              {formData.privacyUserRights.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1"><input type="text" value={item} onChange={(e) => handleArrayItemChange('privacyUserRights', index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" placeholder={`Right ${index + 1}`} /></div>
                  <button type="button" onClick={() => removeArrayItem('privacyUserRights', index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Privacy Policy Sections</label>
                <button type="button" onClick={addSection} className="text-sm text-[#D97A22] hover:text-[#c56a1e] flex items-center gap-1"><Plus size={16} /> Add Section</button>
              </div>
              {formData.privacySections.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><GripVertical size={16} className="text-gray-400" /><span className="text-sm font-medium text-gray-500">Section {section.number}</span></div>
                    <button type="button" onClick={() => removeSection(index)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label><input type="text" value={section.title} onChange={(e) => handleSectionChange(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Section Content</label><textarea value={section.content} onChange={(e) => handleSectionChange(index, 'content', e.target.value)} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" /></div>
                </div>
              ))}
            </div>
          )}

          {/* Legal Info Tab */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Data Security</label><textarea name="privacyDataSecurity" value={formData.privacyDataSecurity} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Cookies Policy</label><textarea name="privacyCookies" value={formData.privacyCookies} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Third Party Links</label><textarea name="privacyThirdPartyLinks" value={formData.privacyThirdPartyLinks} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Policy Changes</label><textarea name="privacyPolicyChanges" value={formData.privacyPolicyChanges} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label><textarea name="privacyContactInfo" value={formData.privacyContactInfo} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97A22]" /></div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#D97A22] to-[#c56a1e] rounded-lg hover:from-[#c56a1e] hover:to-[#b85e1a] disabled:opacity-50 transition-all duration-200 shadow-md">
              {loading ? 'Adding...' : 'Add Privacy Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPrivacyModal;