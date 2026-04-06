-- ──────────────────────────────────────────────────────────────────────
-- Free Email Signature Generator - Database Schema
-- ──────────────────────────────────────────────────────────────────────
-- Security: InnoDB tablespace encryption (at-rest), TLS for transit.
-- Requires MySQL 8.0+ with keyring plugin enabled for encryption.
--
-- To enable the keyring plugin, add to my.cnf:
--   [mysqld]
--   early-plugin-load=keyring_file.so
--   keyring_file_data=/var/lib/mysql-keyring/keyring
--
-- Then enable default table encryption:
--   SET GLOBAL default_table_encryption=ON;
--
-- For TLS connections, configure MySQL with ssl-ca, ssl-cert, ssl-key
-- and set REQUIRE SSL on the application user.
-- ──────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS db_emailgen
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci
  DEFAULT ENCRYPTION='Y';

USE db_emailgen;

-- ── Images table (encrypted at rest) ────────────────────────────────

CREATE TABLE IF NOT EXISTS images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    random_hash VARCHAR(12) NOT NULL,
    asset_hash VARCHAR(64) NOT NULL,
    content_type VARCHAR(50) NOT NULL DEFAULT 'image/png',
    file_size INT UNSIGNED NOT NULL DEFAULT 0,
    original_name VARCHAR(255) DEFAULT NULL,
    uploader_ip VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_cos (random_hash, asset_hash),
    INDEX idx_created (created_at)
) ENGINE=InnoDB ENCRYPTION='Y' DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
