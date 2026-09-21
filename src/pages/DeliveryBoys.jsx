// src/pages/DeliveryBoys.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import AddDeliveryBoyModal from '../components/AddDeliveryBoyModal';
import EditDeliveryBoyModal from '../components/EditDeliveryBoyModal';
import { deliveryBoyAPI } from '../api/deliveryBoy';
import { FaEdit, FaTrash, FaPlus, FaSignOutAlt, FaSyncAlt, FaSearch, FaTruck, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaHashtag, FaChartLine } from 'react-icons/fa';

const DeliveryBoys = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDeliveryBoy, setEditingDeliveryBoy] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [filteredDeliveryBoys, setFilteredDeliveryBoys] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDeliveryBoys = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await deliveryBoyAPI.getAllDeliveryBoys();

      let boysArray = [];
      const data = response.data;

      if (data.deliveryBoys && Array.isArray(data.deliveryBoys)) {
        boysArray = data.deliveryBoys;
      } else if (Array.isArray(data)) {
        boysArray = data;
      } else {
        throw new Error('Unexpected response format');
      }

      setDeliveryBoys(boysArray);
      setFilteredDeliveryBoys(boysArray);
      setError('');
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
      setError(error.message || 'Failed to load delivery boys');
      setDeliveryBoys([]);
      setFilteredDeliveryBoys([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWards = async () => {
    try {
      const response = await deliveryBoyAPI.getWardsList();
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
    fetchWards();
  }, []);

  useEffect(() => {
    let results = [...deliveryBoys];

    if (searchTerm) {
      results = results.filter(boy =>
        boy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boy.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boy.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      results = results.filter(boy => boy.status === statusFilter);
    }

    setFilteredDeliveryBoys(results);
  }, [searchTerm, statusFilter, deliveryBoys]);

  const handleRefresh = () => {
    // ✅ reset filters so refreshed list shows everything
    setSearchTerm('');
    setStatusFilter('all');
    fetchDeliveryBoys(true);
  };

  const handleAddDeliveryBoy = async (deliveryBoyData) => {
    try {
      const response = await deliveryBoyAPI.addDeliveryBoy(deliveryBoyData);
      const newDeliveryBoy = response.data.deliveryBoy;
      const newDeliveryBoys = [...deliveryBoys, newDeliveryBoy];
      setDeliveryBoys(newDeliveryBoys);
      setFilteredDeliveryBoys(newDeliveryBoys);
      setIsModalOpen(false);

      // ✅ Reset filters so the new active boy is immediately visible
      setSearchTerm('');
      setStatusFilter('all');

      setError('✅ Delivery boy added successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error adding delivery boy:', error);
      setError(error.response?.data?.message || 'Failed to add delivery boy');
    }
  };

  const handleEditDeliveryBoy = async (deliveryBoyId, deliveryBoyData) => {
    try {
      const response = await deliveryBoyAPI.updateDeliveryBoy(deliveryBoyId, deliveryBoyData);
      const updatedDeliveryBoy = response.data.deliveryBoy;
      const updatedDeliveryBoys = deliveryBoys.map(boy =>
        boy._id === deliveryBoyId ? updatedDeliveryBoy : boy
      );
      setDeliveryBoys(updatedDeliveryBoys);
      setFilteredDeliveryBoys(updatedDeliveryBoys);
      setIsEditModalOpen(false);
      setEditingDeliveryBoy(null);
      setError('✅ Delivery boy updated successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error updating delivery boy:', error);
      setError(error.response?.data?.message || 'Failed to update delivery boy');
    }
  };

  const handleDeleteDeliveryBoy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery boy?')) return;

    try {
      await deliveryBoyAPI.deleteDeliveryBoy(id);
      const remainingBoys = deliveryBoys.filter(boy => boy._id !== id);
      setDeliveryBoys(remainingBoys);
      setFilteredDeliveryBoys(remainingBoys);
      setError('✅ Delivery boy deleted successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error deleting delivery boy:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete delivery boy';
      setError(errorMsg);
    }
  };

  const openEditModal = (deliveryBoy) => {
    setEditingDeliveryBoy(deliveryBoy);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingDeliveryBoy(null);
    setIsEditModalOpen(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-1" size={10} />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimesCircle className="mr-1" size={10} />
        Inactive
      </span>
    );
  };

  const getWardDisplay = (boy) => {
    if (boy.wardIds && boy.wardIds.length > 0) {
      return {
        ids: boy.wardIds,
        numbers: boy.wardIds.sort((a, b) => a - b),
        names: boy.wardNames || boy.wardIds.map(id => `Ward ${id}`)
      };
    }
    if (boy.wardId) {
      return {
        ids: [boy.wardId],
        numbers: [boy.wardId],
        names: [boy.wardName || `Ward ${boy.wardId}`]
      };
    }
    return { ids: [], numbers: [], names: [] };
  };

  const deliveryBoysToRender = Array.isArray(filteredDeliveryBoys) ? filteredDeliveryBoys : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 w-full">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <FaTruck className="text-[#ff0000] mr-2" size={24} />
              <h1 className="text-xl font-bold text-gray-800">Delivery Boys Management</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
              >
                <span className="hidden sm:inline mr-2">Logout</span>
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              All Delivery Boys ({deliveryBoysToRender.length})
            </h2>
            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition duration-200 text-sm min-h-[42px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSyncAlt className={`sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-[#ff0000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] text-white px-4 py-2 rounded-lg flex items-center justify-center transition duration-200 text-sm min-h-[42px]"
                >
                  <FaPlus className="sm:mr-2" />
                  <span className="hidden sm:inline">Add Delivery Boy</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className={`px-4 py-3 rounded mb-4 text-sm ${
              error.includes('✅')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, phone or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm"
                />
              </div>

              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent text-sm bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff0000] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading delivery boys...</p>
              </div>
            ) : deliveryBoysToRender.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <FaTruck className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No delivery boys found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search' : 'Click "Add Delivery Boy" to get started'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-[1100px] md:min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward Numbers</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward Names</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Areas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliveries</th>
                        {isAdmin && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deliveryBoysToRender.map((boy, index) => {
                        const wardDisplay = getWardDisplay(boy);
                        return (
                          <tr key={boy._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{boy.name}</div>
                              <div className="text-xs text-gray-500">{boy.phone} | {boy.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {wardDisplay.numbers.map((wardNum, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    <FaHashtag className="mr-0.5" size={8} />
                                    {wardNum}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-700">
                                {wardDisplay.names.map((name, idx) => (
                                  <div key={idx} className="flex items-center gap-1 py-0.5">
                                    <FaMapMarkerAlt className="text-gray-400" size={10} />
                                    <span className="text-xs">{name}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {(boy.areas || []).length > 0 ? (
                                  boy.areas.map((area, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                      {area}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-700 capitalize">
                                {boy.vehicleType}
                                {boy.vehicleNumber && <div className="text-xs text-gray-400">{boy.vehicleNumber}</div>}
                              </div>
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(boy.status)}</td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-semibold text-gray-900">{boy.totalDeliveries || 0}</div>
                            </td>
                            {isAdmin && (
                              <td className="px-4 py-3">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => navigate(`/delivery-boys/${boy._id}/stats`)}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                                  >
                                    <FaChartLine size={12} /> Stats
                                  </button>
                                  <button
                                    onClick={() => openEditModal(boy)}
                                    className="bg-[#ff0000] hover:bg-[#cc0000] text-white px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                                  >
                                    <FaEdit size={12} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDeliveryBoy(boy._id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                                  >
                                    <FaTrash size={12} /> Delete
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                  <div className="divide-y divide-gray-200">
                    {deliveryBoysToRender.map((boy, index) => {
                      const wardDisplay = getWardDisplay(boy);
                      return (
                        <div key={boy._id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            {getStatusBadge(boy.status)}
                          </div>
                          <h3 className="text-base font-semibold text-gray-900">{boy.name}</h3>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>{boy.phone}</div>
                            <div className="text-xs text-gray-400">{boy.email}</div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center text-xs text-gray-600">
                              <FaHashtag className="text-gray-400 mr-1" size={10} />
                              <span className="font-semibold">Wards:</span>
                              <span className="ml-1">{wardDisplay.numbers.join(', ') || '—'}</span>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center text-xs text-gray-600">
                            <FaMapMarkerAlt className="text-gray-400 mr-1" size={10} />
                            <span className="font-semibold">Areas:</span>
                            <span className="ml-1">
                              {(boy.areas || []).length > 0 ? boy.areas.join(', ') : '—'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 capitalize mt-1">
                            Vehicle: {boy.vehicleType}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Deliveries: <span className="font-semibold">{boy.totalDeliveries || 0}</span>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => navigate(`/delivery-boys/${boy._id}/stats`)}
                                className="bg-purple-500 text-white px-3 py-1.5 rounded text-xs font-medium flex-1 flex items-center justify-center gap-1"
                              >
                                <FaChartLine size={12} /> Stats
                              </button>
                              <button
                                onClick={() => openEditModal(boy)}
                                className="bg-[#ff0000] text-white px-3 py-1.5 rounded text-xs font-medium flex-1 flex items-center justify-center gap-1"
                              >
                                <FaEdit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDeliveryBoy(boy._id)}
                                className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium flex-1 flex items-center justify-center gap-1"
                              >
                                <FaTrash size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        <AddDeliveryBoyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddDeliveryBoy={handleAddDeliveryBoy}
          wards={wards}
        />

        <EditDeliveryBoyModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onEditDeliveryBoy={handleEditDeliveryBoy}
          deliveryBoy={editingDeliveryBoy}
          wards={wards}
        />
      </div>
    </div>
  );
};

export default DeliveryBoys;