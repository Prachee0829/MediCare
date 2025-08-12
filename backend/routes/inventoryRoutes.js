import express from 'express';
import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  getExpiringItems,
  getInventoryByCategory,
  getInventoryCategories,
} from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📦 Create new inventory item / Get all items
router.route('/')
  .post(protect, admin, createInventoryItem)   // Admin: Add item
  .get(protect, getInventoryItems);            // All roles: View items

// 📉 Low stock items
router.get('/low-stock', protect, getLowStockItems);

// 🧪 Expiring soon (next 30 days)
router.get('/expiring', protect, getExpiringItems);

// 🗂 Filter by category
router.get('/category/:category', protect, getInventoryByCategory);

// 📋 Get all unique categories
router.get('/categories', protect, getInventoryCategories);

// 🔍 View / Update / Delete inventory item by ID
router.route('/:id')
  .get(protect, getInventoryItemById)          // All roles
  .put(protect, admin, updateInventoryItem)    // Admin only
  .delete(protect, admin, deleteInventoryItem);// Admin only

export default router;
