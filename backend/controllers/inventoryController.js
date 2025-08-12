import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Inventory from '../models/inventoryModel.js';

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    dosage,
    formulation,
    quantity,
    threshold,
    supplier,
    expiryDate,
    batchNumber,
    location,
    price,
  } = req.body;

  if (!name || quantity === undefined || price === undefined) {
    res.status(400);
    throw new Error('Name, quantity, and price are required');
  }

  const inventoryItem = await Inventory.create({
    name,
    category,
    dosage,
    formulation,
    quantity,
    threshold,
    supplier,
    expiryDate,
    batchNumber,
    location,
    price,
    updatedBy: req.user._id,
    lastUpdated: new Date(),
  });

  res.status(201).json(inventoryItem);
});

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
export const getInventoryItems = asyncHandler(async (req, res) => {
  const inventoryItems = await Inventory.find({}).populate('updatedBy', 'name');
  res.json(inventoryItems);
});

// @desc    Get inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryItemById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid inventory ID');
  }

  const inventoryItem = await Inventory.findById(req.params.id).populate(
    'updatedBy',
    'name'
  );

  if (inventoryItem) {
    res.json(inventoryItem);
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid inventory ID');
  }

  const inventoryItem = await Inventory.findById(req.params.id);

  if (inventoryItem) {
    inventoryItem.name = req.body.name || inventoryItem.name;
    inventoryItem.category = req.body.category || inventoryItem.category;
    inventoryItem.dosage = req.body.dosage || inventoryItem.dosage;
    inventoryItem.formulation = req.body.formulation || inventoryItem.formulation;
    inventoryItem.quantity = req.body.quantity !== undefined ? req.body.quantity : inventoryItem.quantity;
    inventoryItem.threshold = req.body.threshold !== undefined ? req.body.threshold : inventoryItem.threshold;
    inventoryItem.supplier = req.body.supplier || inventoryItem.supplier;
    inventoryItem.expiryDate = req.body.expiryDate || inventoryItem.expiryDate;
    inventoryItem.batchNumber = req.body.batchNumber || inventoryItem.batchNumber;
    inventoryItem.location = req.body.location || inventoryItem.location;
    inventoryItem.price = req.body.price !== undefined ? req.body.price : inventoryItem.price;
    inventoryItem.updatedBy = req.user._id;
    inventoryItem.lastUpdated = new Date();

    const updatedInventoryItem = await inventoryItem.save();
    res.json(updatedInventoryItem);
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
export const deleteInventoryItem = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid inventory ID');
  }

  const inventoryItem = await Inventory.findById(req.params.id);

  if (inventoryItem) {
    await inventoryItem.deleteOne();
    res.json({ message: 'Inventory item removed' });
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

// @desc    Get low stock inventory items
// @route   GET /api/inventory/low-stock
// @access  Private
export const getLowStockItems = asyncHandler(async (req, res) => {
  const inventoryItems = await Inventory.find({
    $expr: { $lte: ['$quantity', '$threshold'] },
  })
    .populate('updatedBy', 'name')
    .sort({ quantity: 1 });

  res.json(inventoryItems);
});

// @desc    Get expiring inventory items
// @route   GET /api/inventory/expiring
// @access  Private
export const getExpiringItems = asyncHandler(async (req, res) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const inventoryItems = await Inventory.find({
    expiryDate: { $lte: thirtyDaysFromNow, $gte: today },
  })
    .populate('updatedBy', 'name')
    .sort({ expiryDate: 1 });

  res.json(inventoryItems);
});

// @desc    Get inventory by category
// @route   GET /api/inventory/category/:category
// @access  Private
export const getInventoryByCategory = asyncHandler(async (req, res) => {
  const inventoryItems = await Inventory.find({
    category: req.params.category,
  }).populate('updatedBy', 'name');

  res.json(inventoryItems);
});

// @desc    Get all unique inventory categories
// @route   GET /api/inventory/categories
// @access  Private
export const getInventoryCategories = asyncHandler(async (req, res) => {
  // Get unique categories from the database
  const dbCategories = await Inventory.distinct('category');
  
  // Predefined categories that should always be available
  const predefinedCategories = [
    'Pain Relief', 'Analgesics', 'Antibiotics', 'Antivirals', 'Cardiovascular', 
    'Respiratory', 'Gastrointestinal', 'Dermatological', 'Supplements', 'Hormones', 
    'Vaccines', 'Antifungals', 'Antiparasitics', 'Ophthalmics', 'Anesthetics', 
    'Antidepressants', 'Antipsychotics', 'Antihistamines'
  ];
  
  // Combine and deduplicate categories
  const allCategories = [...new Set([...dbCategories, ...predefinedCategories])];
  
  res.json(allCategories);
});
