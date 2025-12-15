import express from 'express';
import {
  getSalesSummary,
  getInventoryStatus,
  getTopProducts,
  getDebtSummary,
  getCashRegisterReport,
  getDashboardOverview,
} from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard overview
router.get('/dashboard/overview', getDashboardOverview);

// Cash register report (gün sonu kasa raporu)
router.get('/cash-register', getCashRegisterReport);

// Sales summary
router.get('/sales-summary', getSalesSummary);

// Inventory status
router.get('/inventory-status', getInventoryStatus);

// Top products
router.get('/top-products', getTopProducts);

// Debt summary
router.get('/debt-summary', getDebtSummary);

export default router;

