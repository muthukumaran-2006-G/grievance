-- =====================================================================
-- Roever Engineering College - Grievance Management System
-- MySQL Schema
-- Note: In normal operation, Flask-SQLAlchemy (db.create_all()) will
-- create these tables automatically from the models. This file is
-- provided for manual setup, review, and documentation purposes, and
-- matches the SQLAlchemy models exactly.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS grievance_management
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE grievance_management;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(150) NOT NULL,
    email             VARCHAR(150) NOT NULL UNIQUE,
    phone             VARCHAR(20),
    password_hash     VARCHAR(255) NOT NULL,
    role              VARCHAR(30) NOT NULL,
    department        VARCHAR(150),
    register_number   VARCHAR(50),
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    CONSTRAINT chk_users_role CHECK (
        role IN ('student', 'faculty', 'worker', 'parent', 'principal', 'grievance_team')
    )
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- complaints
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id                       INT AUTO_INCREMENT PRIMARY KEY,
    complaint_number         VARCHAR(30) NOT NULL UNIQUE,
    user_id                  INT NOT NULL,
    title                    VARCHAR(255) NOT NULL,
    description              TEXT NOT NULL,
    category                 VARCHAR(50) NOT NULL,
    priority                 VARCHAR(20) NOT NULL DEFAULT 'Medium',
    assigned_to              VARCHAR(30) NOT NULL,
    status                   VARCHAR(30) NOT NULL DEFAULT 'Pending',
    attachment_path          VARCHAR(500),
    attachment_original_name VARCHAR(255),
    created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at              DATETIME NULL,
    INDEX idx_complaints_user_id (user_id),
    INDEX idx_complaints_assigned_to (assigned_to),
    INDEX idx_complaints_status (status),
    INDEX idx_complaints_created_at (created_at),
    CONSTRAINT fk_complaints_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_complaints_priority CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    CONSTRAINT chk_complaints_status CHECK (
        status IN ('Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected')
    ),
    CONSTRAINT chk_complaints_assigned_to CHECK (assigned_to IN ('principal', 'grievance_team'))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- complaint_responses
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_responses (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id  INT NOT NULL,
    admin_id      INT NOT NULL,
    response      TEXT NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_responses_complaint_id (complaint_id),
    CONSTRAINT fk_responses_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_responses_admin
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- complaint_status_history
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id  INT NOT NULL,
    changed_by    INT NOT NULL,
    old_status    VARCHAR(30),
    new_status    VARCHAR(30) NOT NULL,
    changed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks       TEXT,
    INDEX idx_history_complaint_id (complaint_id),
    CONSTRAINT fk_history_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_changed_by
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    complaint_id  INT NULL,
    message       VARCHAR(500) NOT NULL,
    is_read       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL
) ENGINE=InnoDB;
