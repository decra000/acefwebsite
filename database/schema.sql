-- ACEF Website Database Schema
-- Step 1: Create the database (only once)
CREATE DATABASE IF NOT EXISTS acef_website;

-- Step 2: Select (use) that database
USE acef_website;
-- Users table for admin authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'Content Manager') DEFAULT 'Content Manager',
  passwordResetToken VARCHAR(255),  -- 🔐 For password reset
  passwordResetExpires DATETIME,    -- ⏳ Expiration timestamp for reset token
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  image_url VARCHAR(500),
  email VARCHAR(255),
  linkedin_url VARCHAR(500),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
country VARCHAR(255),
country_code VARCHAR(10) UNIQUE NOT NULL;

);

CREATE TABLE IF NOT EXISTS `logos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `logo_url` varchar(500) NOT NULL,
  `logo_name` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT 'ACEF Logo',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  level VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  lastDate DATE,
  salary VARCHAR(100),
  createdBy VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(255),
  type ENUM('partner', 'accreditator', 'both') DEFAULT 'partner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create volunteer_forms table

CREATE TABLE IF NOT EXISTS volunteer_forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    form_url TEXT NOT NULL,
    form_title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    
    -- Unique constraint - one form per country
    UNIQUE KEY unique_country_form (country_id),
    
    -- Index for better performance
    INDEX idx_country_id (country_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

CREATE TABLE whatsapp_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(20) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



-- Blog posts table
CREATE TABLE blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content LONGTEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  author_id INT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at)
  is_featured BOOLEAN DEFAULT FALSE,
  is_news BOOLEAN DEFAULT FALSE;
  approved BOOLEAN DEFAULT FALSE;

);



CREATE TABLE country_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  service_id VARCHAR(100) NOT NULL,
  template_id VARCHAR(100) NOT NULL,
  public_key VARCHAR(100),
  physical_address TEXT,      -- optional
  mailing_address TEXT,       -- optional
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);






-- Projects table
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  categoryId INT,
  countryId INT,
  slug VARCHAR(500) UNIQUE NOT NULL,
  description LONGTEXT NOT NULL,
  short_description TEXT,
  featured_image VARCHAR(2083),
  gallery JSON, -- Array of image URLs
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  status ENUM('planning', 'ongoing', 'completed', 'on_hold') DEFAULT 'planning',
  sdg_goals JSON, -- Array of SDG numbers
  testimonial_text TEXT,
  testimonial_author VARCHAR(255),
  testimonial_position VARCHAR(255),
  impact_metrics JSON, -- Key-value pairs of metrics
  order_index INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_featured (is_featured),
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (countryId) REFERENCES countries(id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS logos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('main', 'secondary', 'partner', 'sponsor', 'footer') NOT NULL DEFAULT 'main',
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type (type),
  INDEX idx_active (is_active),
  INDEX idx_display_order (display_order),
  INDEX idx_created_at (created_at)
);



-- Contact messages table
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  phone VARCHAR(50),
  organization VARCHAR(255),
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);



CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT,
  name VARCHAR(255),
  role VARCHAR(255),
  message TEXT,
  image VARCHAR(2083),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123 - change this!)
INSERT INTO users (email, password, name, role) VALUES 
('admin@acef.org', '$2b$10$rHzXXZpWNcD.hxNXhG1uDOl/9HgGGOLUJ5TvJqkr9qHvN2jL8dQdK', 'ACEF Admin', 'admin');

-- Create impacts table for ACEF website
-- This table stores impact statistics that will be displayed to users


-- Impact Statistics Database Schema for acef_database

-- Create the impacts table to store global impact metrics
CREATE TABLE IF NOT EXISTS impacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  current_value BIGINT DEFAULT 0,
  unit VARCHAR(100),
  icon VARCHAR(100),
  color VARCHAR(50) DEFAULT '#1976d2',
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create project_impacts table to link projects with their impact contributions
CREATE TABLE IF NOT EXISTS project_impacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  impact_id INT NOT NULL,
  contribution_value BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (impact_id) REFERENCES impacts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_project_impact (project_id, impact_id)
);

-- Insert some default impact metrics
INSERT INTO impacts (name, description, current_value, unit, icon, color, order_index) VALUES
('People Served', 'Total number of people directly served by our projects', 0, 'people', 'people', '#2196F3', 1),
('Communities Reached', 'Number of communities we have impacted', 0, 'communities', 'location_city', '#4CAF50', 2),
('Projects Completed', 'Total number of successful project implementations', 0, 'projects', 'check_circle', '#FF9800', 3),
('Partnerships Formed', 'Strategic partnerships and collaborations established', 0, 'partnerships', 'handshake', '#9C27B0', 4),
('Funding Raised', 'Total funding mobilized for development projects', 0, 'USD', 'attach_money', '#F44336', 5),
('Volunteers Engaged', 'Number of volunteers actively participating', 0, 'volunteers', 'volunteer_activism', '#00BCD4', 6);

-- Create trigger to automatically update impact totals when project_impacts change
DELIMITER //

CREATE TRIGGER update_impact_totals_after_insert
AFTER INSERT ON project_impacts
FOR EACH ROW
BEGIN
    UPDATE impacts 
    SET current_value = (
        SELECT COALESCE(SUM(contribution_value), 0) 
        FROM project_impacts 
        WHERE impact_id = NEW.impact_id
    )
    WHERE id = NEW.impact_id;
END//

CREATE TRIGGER update_impact_totals_after_update
AFTER UPDATE ON project_impacts
FOR EACH ROW
BEGIN
    UPDATE impacts 
    SET current_value = (
        SELECT COALESCE(SUM(contribution_value), 0) 
        FROM project_impacts 
        WHERE impact_id = NEW.impact_id
    )
    WHERE id = NEW.impact_id;
    
    -- If impact_id changed, also update the old impact
    IF OLD.impact_id != NEW.impact_id THEN
        UPDATE impacts 
        SET current_value = (
            SELECT COALESCE(SUM(contribution_value), 0) 
            FROM project_impacts 
            WHERE impact_id = OLD.impact_id
        )
        WHERE id = OLD.impact_id;
    END IF;
END//

CREATE TRIGGER update_impact_totals_after_delete
AFTER DELETE ON project_impacts
FOR EACH ROW
BEGIN
    UPDATE impacts 
    SET current_value = (
        SELECT COALESCE(SUM(contribution_value), 0) 
        FROM project_impacts 
        WHERE impact_id = OLD.impact_id
    )
    WHERE id = OLD.impact_id;
END//

DELIMITER ;

-- Add indexes for better performance
CREATE INDEX idx_impacts_active ON impacts(is_active);
CREATE INDEX idx_impacts_order ON impacts(order_index);
CREATE INDEX idx_project_impacts_project ON project_impacts(project_id);
CREATE INDEX idx_project_impacts_impact ON project_impacts(impact_id);



-- Updated Impact Statistics Database Schema with Starting Values
USE acef_website;
-- Update the impacts table to include starting_value field
ALTER TABLE impacts 
ADD COLUMN starting_value BIGINT DEFAULT 0 AFTER current_value;

-- Update the description to clarify the fields:
-- starting_value: The baseline/initial value before any project contributions
-- current_value: The total value (starting_value + sum of all project contributions)

-- Update existing records to set starting_value equal to current_value
-- (assuming current values are the baseline you want to preserve)
UPDATE impacts SET starting_value = current_value WHERE starting_value IS NULL OR starting_value = 0;

-- Updated trigger to calculate current_value as starting_value + project contributions
DELIMITER //

DROP TRIGGER IF EXISTS update_impact_totals_after_insert//
CREATE TRIGGER update_impact_totals_after_insert
AFTER INSERT ON project_impacts
FOR EACH ROW
BEGIN
    UPDATE impacts 
    SET current_value = starting_value + (
        SELECT COALESCE(SUM(contribution_value), 0) 
        FROM project_impacts 
        WHERE impact_id = NEW.impact_id
    )
    WHERE id = NEW.impact_id;
END//

DROP TRIGGER IF EXISTS update_impact_totals_after_update//
CREATE TRIGGER update_impact_totals_after_update
AFTER UPDATE ON project_impacts
FOR EACH ROW
BEGIN
    UPDATE impacts 
    SET current_value = starting_value + (
        SELECT COALESCE(SUM(contribution_value), 0) 
        FROM project_impacts 
        WHERE impact_id = NEW.impact_id
    )
    WHERE id = NEW.impact_id;
    
    -- If impact_id changed, also update the old impact
    IF OLD.impact_id != NEW.impact_id THEN
        UPDATE impacts 
        SET current_value = starting_value + (
            SELECT COALESCE(SUM(contribution_value), 0) 
            FROM project_impacts 
            WHERE impact_id = OLD.impact_id
        )
        WHERE id = OLD.impact_id;
    END IF;
END//

DROP TRIGGER IF EXISTS update_impact_totals_after_delete//
CREATE TRIGGER update_impact_totals_after_delete
AFTER DELETE ON project_impacts
FOR EACH ROW
BEGIN
    UPDATE impacts 
    SET current_value = starting_value + (
        SELECT COALESCE(SUM(contribution_value), 0) 
        FROM project_impacts 
        WHERE impact_id = OLD.impact_id
    )
    WHERE id = OLD.impact_id;
END//

-- New trigger to update current_value when starting_value is changed
CREATE TRIGGER update_current_value_on_starting_value_change
AFTER UPDATE ON impacts
FOR EACH ROW
BEGIN
    -- Only recalculate if starting_value changed
    IF OLD.starting_value != NEW.starting_value THEN
        UPDATE impacts 
        SET current_value = NEW.starting_value + (
            SELECT COALESCE(SUM(contribution_value), 0) 
            FROM project_impacts 
            WHERE impact_id = NEW.id
        )
        WHERE id = NEW.id;
    END IF;
END//

DELIMITER ;

-- Update the default impact metrics with realistic starting values
UPDATE impacts SET 
    starting_value = CASE 
        WHEN name = 'People Served' THEN 5000
        WHEN name = 'Communities Reached' THEN 50
        WHEN name = 'Projects Completed' THEN 15
        WHEN name = 'Partnerships Formed' THEN 25
        WHEN name = 'Funding Raised' THEN 500000
        WHEN name = 'Volunteers Engaged' THEN 200
        ELSE 0
    END,
    current_value = starting_value + (
        SELECT COALESCE(SUM(pi.contribution_value), 0) 
        FROM project_impacts pi 
        WHERE pi.impact_id = impacts.id
    )
WHERE name IN ('People Served', 'Communities Reached', 'Projects Completed', 'Partnerships Formed', 'Funding Raised', 'Volunteers Engaged');





-- Database Schema Fix for ACEF Website
-- Add missing columns to the projects table

USE acef_website;

-- Add the missing is_hidden column to projects table
ALTER TABLE projects 
ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE AFTER is_featured;

-- Also add testimonials column to support multiple testimonials (JSON format)
-- This will replace the individual testimonial fields
ALTER TABLE projects 
ADD COLUMN testimonials JSON AFTER sdg_goals;

-- Optional: If you want to migrate existing testimonial data to the new format
-- Uncomment and run this after adding the testimonials column:

/*
UPDATE projects 
SET testimonials = JSON_ARRAY(
    JSON_OBJECT(
        'text', COALESCE(testimonial_text, ''),
        'author', COALESCE(testimonial_author, ''),
        'position', COALESCE(testimonial_position, '')
    )
) 
WHERE testimonial_text IS NOT NULL 
   OR testimonial_author IS NOT NULL 
   OR testimonial_position IS NOT NULL;
*/

-- Add indexes for the new columns
ALTER TABLE projects ADD INDEX idx_hidden (is_hidden);

-- Verify the changes
DESCRIBE projects;


-- Add testimonials JSON column to projects table
-- Run this SQL command in your database

USE acef_website;
-- =====================================================
-- ACEF Donation Management System - Database Schema
-- =====================================================



-- 1. Create donations table (main donation records)
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(100) PRIMARY KEY,
    donation_type ENUM('general', 'country', 'project') NOT NULL DEFAULT 'general',
    target_country_id INT NULL,
    target_project_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Donor information
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(50) NULL,
    donor_country VARCHAR(100) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Payment details
    payment_method ENUM('card', 'bank', 'crowdfund') NOT NULL DEFAULT 'card',
    payment_status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_reference VARCHAR(255) NULL,
    
    -- Status and tracking
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    receipt_sent BOOLEAN DEFAULT FALSE,
    thank_you_sent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Admin notes
    admin_notes TEXT NULL,
    processed_by INT NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (target_country_id) REFERENCES countries(id) ON DELETE SET NULL,
    FOREIGN KEY (target_project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for better performance
    INDEX idx_donation_status (status),
    INDEX idx_donation_email (donor_email),
    INDEX idx_donation_date (created_at),
    INDEX idx_payment_status (payment_status),
    INDEX idx_donor_anonymous (is_anonymous),
    INDEX idx_receipt_sent (receipt_sent),
    INDEX idx_thank_you_sent (thank_you_sent)
);

-- 2. Create donor_wall table (for displaying donors)
CREATE TABLE IF NOT EXISTS donor_wall (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_name VARCHAR(255) NOT NULL,
    donation_amount DECIMAL(10,2) NOT NULL,
    donation_date TIMESTAMP NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    
    -- Reference to original donation
    donation_id VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    
    INDEX idx_donor_wall_order (display_order),
    INDEX idx_donor_wall_featured (is_featured),
    INDEX idx_donor_wall_date (donation_date)
);

-- 3. Create anonymous_donations_counter table
CREATE TABLE IF NOT EXISTS anonymous_donations_counter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_count INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial counter record
INSERT INTO anonymous_donations_counter (total_count, total_amount) 
VALUES (0, 0.00) 
ON DUPLICATE KEY UPDATE id=id;

-- 4. Create donation_reminders table (for tracking reminders sent)
CREATE TABLE IF NOT EXISTS donation_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id VARCHAR(100) NOT NULL,
    reminder_type ENUM('payment_pending', 'completion_reminder', 'thank_you_follow') NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_by INT NULL,
    reminder_method ENUM('email', 'sms', 'whatsapp') DEFAULT 'email',
    status ENUM('sent', 'delivered', 'failed') DEFAULT 'sent',
    
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_reminder_donation (donation_id),
    INDEX idx_reminder_type (reminder_type),
    INDEX idx_reminder_date (sent_at)
);

-- 5. Create donation_badges table (for donor badges)
CREATE TABLE IF NOT EXISTS donation_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id VARCHAR(100) NOT NULL,
    badge_code VARCHAR(50) UNIQUE NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    badge_tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    
    -- Badge benefits
    event_access BOOLEAN DEFAULT TRUE,
    newsletter_priority BOOLEAN DEFAULT FALSE,
    exclusive_updates BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    
    UNIQUE INDEX idx_badge_code (badge_code),
    INDEX idx_badge_email (donor_email),
    INDEX idx_badge_active (is_active),
    INDEX idx_badge_tier (badge_tier)
);

-- 6. Create trigger to update anonymous counter
DELIMITER $$

CREATE TRIGGER after_donation_insert 
AFTER INSERT ON donations
FOR EACH ROW
BEGIN
    IF NEW.is_anonymous = TRUE AND NEW.status = 'completed' THEN
        UPDATE anonymous_donations_counter 
        SET total_count = total_count + 1,
            total_amount = total_amount + NEW.amount;
    END IF;
    
    -- Add to donor wall if not anonymous and completed
    IF NEW.is_anonymous = FALSE AND NEW.status = 'completed' THEN
        INSERT INTO donor_wall (donor_name, donation_amount, donation_date, donation_id, is_anonymous)
        VALUES (NEW.donor_name, NEW.amount, NEW.completed_at, NEW.id, FALSE);
    END IF;
END$$

CREATE TRIGGER after_donation_update
AFTER UPDATE ON donations
FOR EACH ROW
BEGIN
    -- Handle status change to completed
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Update completed_at timestamp
        UPDATE donations SET completed_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        
        -- Handle anonymous donations
        IF NEW.is_anonymous = TRUE THEN
            UPDATE anonymous_donations_counter 
            SET total_count = total_count + 1,
                total_amount = total_amount + NEW.amount;
        ELSE
            -- Add to donor wall for non-anonymous donations
            INSERT INTO donor_wall (donor_name, donation_amount, donation_date, donation_id, is_anonymous)
            VALUES (NEW.donor_name, NEW.amount, CURRENT_TIMESTAMP, NEW.id, FALSE)
            ON DUPLICATE KEY UPDATE 
                donor_name = VALUES(donor_name),
                donation_amount = VALUES(donation_amount);
        END IF;
    END IF;
    
    -- Handle status change from completed to other status
    IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        -- Remove from anonymous counter if applicable
        IF NEW.is_anonymous = TRUE THEN
            UPDATE anonymous_donations_counter 
            SET total_count = GREATEST(0, total_count - 1),
                total_amount = GREATEST(0, total_amount - NEW.amount);
        ELSE
            -- Remove from donor wall
            DELETE FROM donor_wall WHERE donation_id = NEW.id;
        END IF;
    END IF;
END$$

DELIMITER ;

-- 7. Create views for easier data access
CREATE VIEW donation_summary AS
SELECT 
    d.id,
    d.donor_name,
    d.donor_email,
    d.amount,
    d.currency,
    d.donation_type,
    d.status,
    d.payment_status,
    d.is_anonymous,
    d.receipt_sent,
    d.thank_you_sent,
    d.created_at,
    d.completed_at,
    c.name as target_country_name,
    p.title as target_project_title,
    u.name as processed_by_name
FROM donations d
LEFT JOIN countries c ON d.target_country_id = c.id
LEFT JOIN projects p ON d.target_project_id = p.id
LEFT JOIN users u ON d.processed_by = u.id;

CREATE VIEW pending_donations AS
SELECT * FROM donation_summary 
WHERE status = 'pending' OR payment_status = 'pending'
ORDER BY created_at DESC;

CREATE VIEW completed_donations AS
SELECT * FROM donation_summary 
WHERE status = 'completed' AND payment_status = 'completed'
ORDER BY completed_at DESC;

-- 8. Add some sample data for testing
INSERT INTO donations (
    id, donation_type, amount, donor_name, donor_email, donor_country, 
    payment_method, status, payment_status, is_anonymous
) VALUES 
(
    'donation_test_001', 'general', 100.00, 'John Doe', 'john@example.com', 
    'United States', 'card', 'completed', 'completed', FALSE
),
(
    'donation_test_002', 'general', 50.00, 'Anonymous Donor', 'anon@example.com', 
    'Canada', 'bank', 'completed', 'completed', TRUE
);

-- 9. Create indexes for performance optimization
CREATE INDEX idx_donations_composite ON donations(status, payment_status, created_at);
CREATE INDEX idx_donations_donor_search ON donations(donor_name, donor_email);
CREATE INDEX idx_donations_amount_range ON donations(amount, created_at);

-- 10. Add table comments for documentation
ALTER TABLE donations COMMENT = 'Main donation records with donor information and payment details';
ALTER TABLE donor_wall COMMENT = 'Public display of non-anonymous donors';
ALTER TABLE anonymous_donations_counter COMMENT = 'Counter for anonymous donations';
ALTER TABLE donation_reminders COMMENT = 'Tracking of reminder communications sent to donors';
ALTER TABLE donation_badges COMMENT = 'Digital badges issued to donors for event access';

-- Print completion message
SELECT 'Donation management database schema created successfully!' as message;


-- Add testimonials JSON column to projects table
-- Run this SQL command in your database

USE acef_website;

-- Add the testimonials column as JSON
ALTER TABLE projects 
ADD COLUMN testimonials JSON AFTER impact_metrics;

-- Optional: Migrate existing testimonial data to the new format
UPDATE projects 
SET testimonials = JSON_ARRAY(
  JSON_OBJECT(
    'text', COALESCE(testimonial_text, ''),
    'author', COALESCE(testimonial_author, ''),
    'position', COALESCE(testimonial_position, '')
  )
)
WHERE testimonial_text IS NOT NULL 
   OR testimonial_author IS NOT NULL 
   OR testimonial_position IS NOT NULL;

-- Optional: After confirming the migration worked, you can drop the old columns
-- (Uncomment these lines only after testing)
-- ALTER TABLE projects DROP COLUMN testimonial_text;
-- ALTER TABLE projects DROP COLUMN testimonial_author;
-- ALTER TABLE projects DROP COLUMN testimonial_position;


USE acef_website;

-- Drop the existing table if it has issues
DROP TABLE IF EXISTS `logos`;

-- Create the table with correct structure
CREATE TABLE IF NOT EXISTS `logos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `logo_url` varchar(500) NOT NULL,
  `logo_name` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT 'ACEF Logo',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert a test logo entry
INSERT INTO logos (logo_url, logo_name, alt_text, is_active) 
VALUES ('/uploads/logos/default-logo.png', 'default-logo.png', 'ACEF Logo', 1);

USE acef_website;
-- Add featured column to partners table
ALTER TABLE partners 
ADD COLUMN featured TINYINT(1) DEFAULT 0 AFTER type;

-- Update existing records to set featured = 0 for safety
UPDATE partners SET featured = 0 WHERE featured IS NULL;

-- Optional: Create indexes for better performance
CREATE INDEX idx_partners_featured ON partners(featured);
CREATE INDEX idx_partners_featured_created ON partners(featured DESC, created_at DESC);




-- =====================================================
-- ACEF Donation Management System - FIXED Database Schema
-- This fixes the "bad field error" by using consistent column names
-- =====================================================

USE acef_website;

-- 1. Drop existing donations table if it exists (BE CAREFUL!)
-- Uncomment the next line only if you want to start fresh
-- DROP TABLE IF EXISTS donations;

-- 2. Create donations table with CORRECTED column names
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(100) PRIMARY KEY,
    donation_type ENUM('general', 'country', 'project') NOT NULL DEFAULT 'general',
    
    -- FIXED: Use target_country_id and target_project_id to match schema
    target_country_id INT NULL,
    target_project_id INT NULL,
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Donor information
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(50) NULL,
    donor_country VARCHAR(100) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Payment details
    payment_method ENUM('card', 'bank', 'crowdfund') NOT NULL DEFAULT 'card',
    payment_status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_reference VARCHAR(255) NULL,
    
    -- Status and tracking
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    receipt_sent BOOLEAN DEFAULT FALSE,
    thank_you_sent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Admin notes
    admin_notes TEXT NULL,
    processed_by INT NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (target_country_id) REFERENCES countries(id) ON DELETE SET NULL,
    FOREIGN KEY (target_project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for better performance
    INDEX idx_donation_status (status),
    INDEX idx_donation_email (donor_email),
    INDEX idx_donation_date (created_at),
    INDEX idx_payment_status (payment_status),
    INDEX idx_donor_anonymous (is_anonymous),
    INDEX idx_receipt_sent (receipt_sent),
    INDEX idx_thank_you_sent (thank_you_sent),
    INDEX idx_target_country (target_country_id),
    INDEX idx_target_project (target_project_id)
);

-- 3. Create donor_wall table (for displaying donors)
CREATE TABLE IF NOT EXISTS donor_wall (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_name VARCHAR(255) NOT NULL,
    donation_amount DECIMAL(10,2) NOT NULL,
    donation_date TIMESTAMP NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    
    -- Reference to original donation
    donation_id VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    
    INDEX idx_donor_wall_order (display_order),
    INDEX idx_donor_wall_featured (is_featured),
    INDEX idx_donor_wall_date (donation_date)
);

-- 4. Create anonymous_donations_counter table
CREATE TABLE IF NOT EXISTS anonymous_donations_counter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_count INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial counter record
INSERT IGNORE INTO anonymous_donations_counter (total_count, total_amount) 
VALUES (0, 0.00);

-- 5. Create donation_reminders table (for tracking reminders sent)
CREATE TABLE IF NOT EXISTS donation_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id VARCHAR(100) NOT NULL,
    reminder_type ENUM('payment_pending', 'completion_reminder', 'thank_you_follow') NOT NULL,
    message TEXT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_by INT NULL,
    reminder_method ENUM('email', 'sms', 'whatsapp') DEFAULT 'email',
    status ENUM('sent', 'delivered', 'failed') DEFAULT 'sent',
    
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_reminder_donation (donation_id),
    INDEX idx_reminder_type (reminder_type),
    INDEX idx_reminder_date (sent_at)
);

-- 6. Create donation_badges table (for donor badges)
CREATE TABLE IF NOT EXISTS donation_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id VARCHAR(100) NOT NULL,
    badge_code VARCHAR(50) UNIQUE NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    badge_tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    
    -- Badge benefits
    event_access BOOLEAN DEFAULT TRUE,
    newsletter_priority BOOLEAN DEFAULT FALSE,
    exclusive_updates BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    
    UNIQUE INDEX idx_badge_code (badge_code),
    INDEX idx_badge_email (donor_email),
    INDEX idx_badge_active (is_active),
    INDEX idx_badge_tier (badge_tier)
);

-- 7. FIXED Triggers to update anonymous counter
DELIMITER $$

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS after_donation_insert$$
DROP TRIGGER IF EXISTS after_donation_update$$

CREATE TRIGGER after_donation_insert 
AFTER INSERT ON donations
FOR EACH ROW
BEGIN
    IF NEW.is_anonymous = TRUE AND NEW.status = 'completed' THEN
        UPDATE anonymous_donations_counter 
        SET total_count = total_count + 1,
            total_amount = total_amount + NEW.amount;
    END IF;
    
    -- Add to donor wall if not anonymous and completed
    IF NEW.is_anonymous = FALSE AND NEW.status = 'completed' THEN
        INSERT INTO donor_wall (donor_name, donation_amount, donation_date, donation_id, is_anonymous)
        VALUES (NEW.donor_name, NEW.amount, COALESCE(NEW.completed_at, NEW.created_at), NEW.id, FALSE);
    END IF;
END$$

CREATE TRIGGER after_donation_update
AFTER UPDATE ON donations
FOR EACH ROW
BEGIN
    -- Handle status change to completed
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Handle anonymous donations
        IF NEW.is_anonymous = TRUE THEN
            UPDATE anonymous_donations_counter 
            SET total_count = total_count + 1,
                total_amount = total_amount + NEW.amount;
        ELSE
            -- Add to donor wall for non-anonymous donations
            INSERT INTO donor_wall (donor_name, donation_amount, donation_date, donation_id, is_anonymous)
            VALUES (NEW.donor_name, NEW.amount, COALESCE(NEW.completed_at, NOW()), NEW.id, FALSE)
            ON DUPLICATE KEY UPDATE 
                donor_name = VALUES(donor_name),
                donation_amount = VALUES(donation_amount);
        END IF;
    END IF;
    
    -- Handle status change from completed to other status
    IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        -- Remove from anonymous counter if applicable
        IF NEW.is_anonymous = TRUE THEN
            UPDATE anonymous_donations_counter 
            SET total_count = GREATEST(0, total_count - 1),
                total_amount = GREATEST(0, total_amount - NEW.amount);
        ELSE
            -- Remove from donor wall
            DELETE FROM donor_wall WHERE donation_id = NEW.id;
        END IF;
    END IF;
END$$

DELIMITER ;

-- 8. Create views for easier data access (FIXED column names)
CREATE OR REPLACE VIEW donation_summary AS
SELECT 
    d.id,
    d.donor_name,
    d.donor_email,
    d.amount,
    d.currency,
    d.donation_type,
    d.status,
    d.payment_status,
    d.is_anonymous,
    d.receipt_sent,
    d.thank_you_sent,
    d.created_at,
    d.completed_at,
    c.name as target_country_name,
    p.title as target_project_title,
    u.name as processed_by_name
FROM donations d
LEFT JOIN countries c ON d.target_country_id = c.id
LEFT JOIN projects p ON d.target_project_id = p.id
LEFT JOIN users u ON d.processed_by = u.id;

CREATE OR REPLACE VIEW pending_donations AS
SELECT * FROM donation_summary 
WHERE status = 'pending' OR payment_status = 'pending'
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW completed_donations AS
SELECT * FROM donation_summary 
WHERE status = 'completed' AND payment_status = 'completed'
ORDER BY completed_at DESC;

-- 9. Add some sample data for testing
INSERT IGNORE INTO donations (
    id, donation_type, amount, donor_name, donor_email, donor_country, 
    payment_method, status, payment_status, is_anonymous
) VALUES 
(
    'DON-TEST-001', 'general', 100.00, 'John Doe', 'john@example.com', 
    'United States', 'card', 'completed', 'completed', FALSE
),
(
    'DON-TEST-002', 'general', 50.00, 'Anonymous Donor', 'anon@example.com', 
    'Canada', 'bank', 'completed', 'completed', TRUE
),
(
    'DON-TEST-003', 'country', 25.00, 'Jane Smith', 'jane@example.com', 
    'United Kingdom', 'card', 'pending', 'pending', FALSE
);

-- 10. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_donations_composite ON donations(status, payment_status, created_at);
CREATE INDEX IF NOT EXISTS idx_donations_donor_search ON donations(donor_name, donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_amount_range ON donations(amount, created_at);

-- 11. Add table comments for documentation
ALTER TABLE donations COMMENT = 'Main donation records with donor information and payment details - FIXED SCHEMA';
ALTER TABLE donor_wall COMMENT = 'Public display of non-anonymous donors';
ALTER TABLE anonymous_donations_counter COMMENT = 'Counter for anonymous donations';
ALTER TABLE donation_reminders COMMENT = 'Tracking of reminder communications sent to donors';
ALTER TABLE donation_badges COMMENT = 'Digital badges issued to donors for event access';

-- 12. Verify the schema is correct
DESCRIBE donations;

-- Print completion message
SELECT 'FIXED donation management database schema created successfully!' as message;