-- ==========================================================
-- Razorpay Integration Migration
-- Run this on your existing database ONCE
-- ==========================================================

USE fuel_fashion_hub;

-- Add razorpay_order_id column (Razorpay's order reference)
ALTER TABLE orders
  ADD COLUMN razorpay_order_id VARCHAR(255) NULL
  AFTER transaction_id;

-- Add razorpay_payment_id column (Razorpay's payment reference after capture)
ALTER TABLE orders
  ADD COLUMN razorpay_payment_id VARCHAR(255) NULL
  AFTER razorpay_order_id;
