-- =========================================================
-- CCUMS-MISUNGWI
-- Court Case Update Management System
-- Database Schema - Initial Version
-- =========================================================

CREATE TABLE courts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    court_type VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    court_id INTEGER NOT NULL REFERENCES courts(id),
    name VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(100) NOT NULL,
    court_id INTEGER REFERENCES courts(id),
    station_id INTEGER REFERENCES stations(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(100) NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    court_id INTEGER NOT NULL REFERENCES courts(id),
    station_id INTEGER REFERENCES stations(id),
    parties TEXT,
    case_status VARCHAR(100) DEFAULT 'PENDING',
    filing_date DATE,
    next_date DATE,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE case_updates (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    update_date DATE NOT NULL,
    update_type VARCHAR(100),
    description TEXT NOT NULL,
    next_date DATE,
    status VARCHAR(100),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
