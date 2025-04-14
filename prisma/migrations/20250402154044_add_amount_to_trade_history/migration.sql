-- Add amount column to TradeHistory table
ALTER TABLE `TradeHistory` ADD COLUMN `amount` INTEGER NOT NULL DEFAULT 1; 