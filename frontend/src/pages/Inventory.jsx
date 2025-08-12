import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, ChevronDown, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../services/notificationService.js';
import inventoryService from '../services/inventoryService.js';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { notifySuccess, notifyInfo, notifyError } = useNotification();

  // Mock inventory data since backend is not available
  const mockInventoryData = [
    {
      _id: '1',
      name: 'Paracetamol',
      category: 'Pain Relief',
      dosage: '500mg',
      formulation: 'Tablet',
      quantity: 200,
      threshold: 50,
      supplier: 'Pharma Inc.',
      expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
      batchNumber: 'BATCH123',
      location: 'Shelf A-12',
      price: 5.99,
      lastUpdated: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Ibuprofen',
      category: 'Analgesics',
      dosage: '400mg',
      formulation: 'Tablet',
      quantity: 150,
      threshold: 40,
      supplier: 'MediSupply Co.',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      batchNumber: 'IBP-2023-124',
      location: 'Shelf A-03',
      price: 7.50,
      lastUpdated: new Date().toISOString()
    },
    {
      _id: '3',
      name: 'Amoxicillin',
      category: 'Antibiotics',
      dosage: '250mg',
      formulation: 'Capsule',
      quantity: 120,
      threshold: 30,
      supplier: 'BioPharm Ltd.',
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      batchNumber: 'AMX-2023-112',
      location: 'Shelf B-11',
      price: 12.99,
      lastUpdated: new Date().toISOString()
    }
  ];

  // State for inventory items
  const [inventory, setInventory] = useState(mockInventoryData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Use mock data instead of API fetch
  useEffect(() => {
    // Simulate API fetch with mock data
    setInventory(mockInventoryData);
    setLoading(false);
    setError(null);
        
    // Check for low stock items
    const lowStockItems = mockInventoryData.filter(item => item.quantity <= item.threshold);
    if (lowStockItems.length > 0) {
      notifyInfo(
        'Low Stock Alert', 
        `${lowStockItems.length} items are below the minimum threshold`
      );
    }
    
    // Check for items expiring in the next 30 days
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expiringItems = mockInventoryData.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate > today && expiryDate <= thirtyDaysFromNow;
    });
    
    if (expiringItems.length > 0) {
      notifyInfo(
        'Expiring Items', 
        `${expiringItems.length} items will expire in the next 30 days`
      );
    }
  }, [notifyInfo, notifyError]);
  

  // Filter inventory based on search term and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const [categories, setCategories] = useState(['all']);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Fetch categories from backend
  useEffect(() => {
    // Only fetch if we haven't already loaded categories (beyond the default 'all')
    if (categories.length === 1 && !categoriesLoading) {
      const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
          const categoriesData = await inventoryService.getCategories();
          setCategories(['all', ...categoriesData]);
        } catch (error) {
          console.warn('Using inventory categories as fallback');
          // Fallback to categories from inventory if API fails
          const inventoryCategories = [...new Set(inventory.map(item => item.category))];
          setCategories(['all', ...inventoryCategories]);
        } finally {
          setCategoriesLoading(false);
        }
      };
      
      fetchCategories();
    }
  }, [inventory, categories, categoriesLoading]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Check if item is low in stock
  const isLowStock = (item) => item.quantity <= item.threshold;

  // Check if item is about to expire (within 30 days)
  const isNearExpiry = (item) => {
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  // Check if item is expired
  const isExpired = (item) => {
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    return expiryDate < today;
  };

  // Handle adding new item with mock data
  const handleAddItem = (newItem) => {
    try {
      // Create a mock ID and add timestamps
      const addedItem = {
        ...newItem,
        _id: Date.now().toString(),
        lastUpdated: new Date().toISOString()
      };
      setInventory([...inventory, addedItem]);
      setShowAddModal(false);
      toast.success('Item added successfully');
      notifySuccess('Inventory Updated', `${newItem.name} has been added to inventory`);
      
      // Check if quantity is below threshold
      if (newItem.quantity <= newItem.threshold) {
        notifyInfo(
          'Low Stock Warning', 
          `${newItem.name} is below the minimum threshold (${newItem.quantity}/${newItem.threshold})`
        );
      }
    } catch (error) {
      toast.error('Failed to add item');
      notifyError('Error', error.toString());
    }
  };

  // Handle editing item with mock data
  const handleEditItem = (updatedItem) => {
    try {
      // Update the item in the local state
      const updatedItemWithTimestamp = {
        ...updatedItem,
        lastUpdated: new Date().toISOString()
      };
      setInventory(inventory.map(item => 
        item._id === updatedItem._id ? updatedItemWithTimestamp : item
      ));
      setSelectedItem(null);
      toast.success('Item updated successfully');
      notifySuccess('Inventory Updated', `${updatedItem.name} has been updated`);
      
      // Check if quantity is below threshold after update
      if (updatedItem.quantity <= updatedItem.threshold) {
        notifyInfo(
          'Low Stock Warning', 
          `${updatedItem.name} is below the minimum threshold (${updatedItem.quantity}/${updatedItem.threshold})`
        );
      }
    } catch (error) {
      toast.error('Failed to update item');
      notifyError('Error', error.toString());
    }
  };

  // Handle deleting item with mock data
  const handleDeleteItem = () => {
    try {
      const itemName = selectedItem.name;
      // Remove the item from local state
      setInventory(inventory.filter(item => item._id !== selectedItem._id));
      setSelectedItem(null);
      setShowDeleteConfirm(false);
      toast.success('Item deleted successfully');
      notifyInfo('Inventory Updated', `${itemName} has been removed from inventory`);
    } catch (error) {
      toast.error('Failed to delete item');
      notifyError('Error', error.toString());
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button 
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            Filter
            <ChevronDown className={`h-4 w-4 ml-1 text-gray-500 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue="all"
              >
                <option value="all">All</option>
                <option value="low">Low Stock</option>
                <option value="normal">Normal Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Status</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue="all"
              >
                <option value="all">All</option>
                <option value="expired">Expired</option>
                <option value="nearExpiry">Near Expiry</option>
                <option value="valid">Valid</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading inventory</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item, index) => (
                <motion.tr 
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.dosage} • {item.formulation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isLowStock(item) ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      <span className={`text-sm ${isLowStock(item) ? 'text-amber-500 font-medium' : 'text-gray-900'}`}>
                        {item.quantity} units
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Threshold: {item.threshold}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isExpired(item) ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                      ) : isNearExpiry(item) ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      <span 
                        className={`text-sm ${isExpired(item) ? 'text-red-500 font-medium' : isNearExpiry(item) ? 'text-amber-500 font-medium' : 'text-gray-900'}`}
                      >
                        {formatDate(item.expiryDate)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Batch: {item.batchNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {(showAddModal || selectedItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input 
                      type="number" 
                      name="price"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.price || ''}
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input 
                      type="text" 
                      name="name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.name || ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      name="category"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.category || ''}
                      required
                    >
                      {categories.filter(c => c !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input 
                      type="text" 
                      name="dosage"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.dosage || ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formulation</label>
                    <select 
                      name="formulation"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.formulation || ''}
                      required
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Cream">Cream</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      name="quantity"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.quantity || ''}
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
                    <input 
                      type="number" 
                      name="threshold"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.threshold || ''}
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input 
                      type="text" 
                      name="supplier"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.supplier || ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input 
                      type="date" 
                      name="expiryDate"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.expiryDate ? new Date(selectedItem.expiryDate).toISOString().split('T')[0] : ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input 
                      type="text" 
                      name="batchNumber"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.batchNumber || ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      name="location"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedItem?.location || ''}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedItem(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={(event) => {
                      if (selectedItem) {
                        // Collect form data from inputs
                        const form = event.target.closest('form');
                        const updatedItem = {
                          ...selectedItem,
                          name: form.querySelector('[name="name"]').value,
                          category: form.querySelector('[name="category"]').value,
                          dosage: form.querySelector('[name="dosage"]').value,
                          formulation: form.querySelector('[name="formulation"]').value,
                          quantity: parseInt(form.querySelector('[name="quantity"]').value),
                          threshold: parseInt(form.querySelector('[name="threshold"]').value),
                          supplier: form.querySelector('[name="supplier"]').value,
                          expiryDate: form.querySelector('[name="expiryDate"]').value,
                          batchNumber: form.querySelector('[name="batchNumber"]').value,
                          location: form.querySelector('[name="location"]').value,
                          price: parseFloat(form.querySelector('[name="price"]').value || 0)
                        };
                        handleEditItem(updatedItem);
                      } else {
                        // Collect form data from inputs for new item
                        const form = event.target.closest('form');
                        const newItem = {
                          name: form.querySelector('[name="name"]').value,
                          category: form.querySelector('[name="category"]').value,
                          dosage: form.querySelector('[name="dosage"]').value,
                          formulation: form.querySelector('[name="formulation"]').value,
                          quantity: parseInt(form.querySelector('[name="quantity"]').value),
                          threshold: parseInt(form.querySelector('[name="threshold"]').value),
                          supplier: form.querySelector('[name="supplier"]').value,
                          expiryDate: form.querySelector('[name="expiryDate"]').value,
                          batchNumber: form.querySelector('[name="batchNumber"]').value,
                          location: form.querySelector('[name="location"]').value,
                          price: parseFloat(form.querySelector('[name="price"]').value || 0)
                        };
                        
                        handleAddItem(newItem);
                      }
                    }}
                  >
                    {selectedItem ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">{selectedItem.name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedItem(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={handleDeleteItem}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;