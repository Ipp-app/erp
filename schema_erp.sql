-- ========================================================================
-- COMPLETE ERP DATABASE SCHEMA FOR PLASTIC INJECTION COMPANY - FINAL UPDATE
-- ========================================================================
-- Database: PostgreSQL 14+
-- Company: Plastic Injection Manufacturing
-- Features: Machine Management, Production Control, Quality Control,
--           Inventory Management, Cost Tracking, Customer Management
-- Enhancements: Real-time OEE, IoT Sensor Integration, Image Storage, Partitioning
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enable pg_cron for scheduled jobs if available/needed for data retention/cleanup
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ========================================================================
-- 1. CORE SYSTEM TABLES
-- ========================================================================

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_picture_url TEXT -- New: URL to user's profile picture
);

-- User roles and permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- ========================================================================
-- 2. MACHINE MANAGEMENT (CRITICAL MODULE)
-- ========================================================================

-- Main machines table
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    machine_type VARCHAR(100) NOT NULL, -- injection, blow, auxiliary
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    year_manufactured INTEGER,
    tonnage INTEGER, -- clamping force in tons
    shot_size_capacity DECIMAL(8,2), -- max shot size in grams
    injection_pressure_max INTEGER, -- bar
    platen_size_length DECIMAL(8,2), -- mm
    platen_size_width DECIMAL(8,2), -- mm
    tie_bar_spacing DECIMAL(8,2), -- mm
    status VARCHAR(50) DEFAULT 'active', -- active, maintenance, breakdown, inactive
    location VARCHAR(100),
    installation_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_interval_days INTEGER DEFAULT 30,
    current_mold_id UUID,
    total_operating_hours INTEGER DEFAULT 0,
    total_shots INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2), -- cost per hour
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machine technical specifications
CREATE TABLE machine_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    specification_category VARCHAR(100), -- electrical, hydraulic, mechanical, software
    parameter_name VARCHAR(100),
    parameter_value TEXT,
    unit_of_measure VARCHAR(50),
    min_value DECIMAL(10,2),
    max_value DECIMAL(10,2),
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machine maintenance schedule
CREATE TABLE machine_maintenance_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100), -- daily, weekly, monthly, quarterly, yearly
    maintenance_item VARCHAR(255),
    description TEXT,
    frequency_days INTEGER,
    estimated_duration_hours DECIMAL(6,2),
    last_performed DATE,
    next_due_date DATE,
    responsible_person UUID REFERENCES users(id),
    priority_level VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machine maintenance history
CREATE TABLE machine_maintenance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    maintenance_schedule_id UUID REFERENCES machine_maintenance_schedule(id),
    maintenance_type VARCHAR(100),
    description TEXT,
    performed_by UUID REFERENCES users(id),
    maintenance_date DATE, -- <<< TAMBAHAN BARU: Tanggal pemeliharaan
    start_datetime TIMESTAMP WITH TIME ZONE,
    end_datetime TIMESTAMP WITH TIME ZONE,
    downtime_minutes INTEGER,
    parts_replaced JSONB,
    total_cost DECIMAL(12,2),
    labor_hours DECIMAL(6,2),
    status VARCHAR(50) DEFAULT 'completed',
    preventive_maintenance BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machine operating parameters (real-time monitoring), partitioned by recorded_at
CREATE TABLE machine_operating_parameters (
    id UUID, -- id tidak lagi menjadi PRIMARY KEY tunggal
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    production_order_id UUID,
    parameter_name VARCHAR(100),
    set_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    unit_of_measure VARCHAR(50),
    tolerance_plus DECIMAL(10,2),
    tolerance_minus DECIMAL(10,2),
    is_within_tolerance BOOLEAN,
    alarm_level VARCHAR(50), -- normal, warning, alarm, critical
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id),
    PRIMARY KEY (id, recorded_at) -- PRIMARY KEY sekarang mencakup recorded_at
) PARTITION BY RANGE (recorded_at);

-- Example partition for machine_operating_parameters (adjust as needed for your data retention policy)
CREATE TABLE machine_operating_parameters_y2024 PARTITION OF machine_operating_parameters
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
-- Add more partitions as needed, e.g., for '2025-01-01' to '2026-01-01' etc.

-- Machine downtime tracking
CREATE TABLE machine_downtime (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    production_order_id UUID,
    downtime_category VARCHAR(100) NOT NULL, -- mechanical, electrical, hydraulic, mold, material, planned, changeover
    downtime_reason VARCHAR(255),
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    reported_by UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    resolution_description TEXT,
    cost_impact DECIMAL(10,2),
    is_planned BOOLEAN DEFAULT false,
    priority_level VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- New: Machine sensor data table for higher frequency IoT data
CREATE TABLE machine_sensor_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id),
    sensor_type VARCHAR(50), -- e.g., 'product_counter', 'temperature', 'vibration'
    sensor_value DECIMAL(10,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 3. MOLD MANAGEMENT
-- ========================================================================

-- Molds table
CREATE TABLE molds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mold_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_id UUID,
    mold_type VARCHAR(100), -- single_cavity, multi_cavity, family, stack
    number_of_cavities INTEGER NOT NULL,
    material VARCHAR(100),
    weight DECIMAL(8,2),
    dimensions_length DECIMAL(8,2),
    dimensions_width DECIMAL(8,2),
    dimensions_height DECIMAL(8,2),
    compatible_machines JSONB, -- array of machine IDs
    cycle_time_standard DECIMAL(6,2), -- seconds
    max_shots_per_day INTEGER,
    current_shot_count INTEGER DEFAULT 0,
    maintenance_shot_interval INTEGER,
    last_maintenance_shot INTEGER DEFAULT 0,
    condition_rating VARCHAR(50) DEFAULT 'excellent', -- excellent, good, fair, poor
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available', -- available, in_use, maintenance, damaged, retired
    purchase_date DATE,
    purchase_cost DECIMAL(12,2),
    supplier VARCHAR(255),
    warranty_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_url TEXT -- New: URL to mold image
);

-- Mold cavity tracking
CREATE TABLE mold_cavities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
    cavity_number INTEGER NOT NULL,
    cavity_status VARCHAR(50) DEFAULT 'active', -- active, blocked, maintenance, damaged
    total_shots INTEGER DEFAULT 0,
    defect_count INTEGER DEFAULT 0,
    last_maintenance_shot INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mold_id, cavity_number)
);

-- Mold maintenance history
CREATE TABLE mold_maintenance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100), -- cleaning, repair, modification, inspection
    description TEXT,
    performed_by UUID REFERENCES users(id),
    maintenance_date DATE,
    shot_count_at_maintenance INTEGER,
    parts_replaced JSONB,
    cost DECIMAL(10,2),
    downtime_hours DECIMAL(6,2),
    condition_before VARCHAR(50),
    condition_after VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 4. PRODUCT MANAGEMENT
-- ========================================================================

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    material_type VARCHAR(100),
    color VARCHAR(100),
    weight_per_piece DECIMAL(8,3), -- grams
    dimensions_length DECIMAL(8,2),
    dimensions_width DECIMAL(8,2),
    dimensions_height DECIMAL(8,2),
    cycle_time_standard DECIMAL(6,2), -- seconds
    cavity_count INTEGER,
    packaging_type VARCHAR(100),
    pieces_per_package INTEGER,
    customer_part_number VARCHAR(100),
    drawing_revision VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_url TEXT -- New: URL to product image
);

-- Product specifications
CREATE TABLE product_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    specification_type VARCHAR(100), -- dimensional, visual, functional, material
    parameter_name VARCHAR(100),
    target_value DECIMAL(10,3),
    tolerance_plus DECIMAL(10,3),
    tolerance_minus DECIMAL(10,3),
    unit_of_measure VARCHAR(50),
    measurement_method VARCHAR(255),
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product BOM (Bill of Materials)
CREATE TABLE product_bom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    material_id UUID,
    quantity_per_piece DECIMAL(10,3),
    unit_of_measure VARCHAR(50),
    material_type VARCHAR(100), -- raw_material, colorant, additive, packaging
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 5. RAW MATERIALS & INVENTORY
-- ========================================================================

-- Raw materials
CREATE TABLE raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- resin, colorant, additive, packaging
    material_type VARCHAR(100),
    supplier VARCHAR(255),
    unit_of_measure VARCHAR(50),
    current_stock DECIMAL(10,2) DEFAULT 0,
    minimum_stock DECIMAL(10,2),
    maximum_stock DECIMAL(10,2),
    reorder_point DECIMAL(10,2),
    reorder_quantity DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    storage_location VARCHAR(100),
    shelf_life_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_url TEXT -- New: URL to material image
);

-- Material batches/lots
CREATE TABLE material_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    supplier_batch_number VARCHAR(100),
    received_date DATE,
    expiry_date DATE,
    quantity_received DECIMAL(10,2),
    quantity_remaining DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    quality_status VARCHAR(50) DEFAULT 'approved', -- quarantine, approved, rejected, expired
    storage_location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(material_id, batch_number)
);

-- Material transactions
CREATE TABLE material_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES material_batches(id),
    transaction_type VARCHAR(50), -- receipt, issue, return, adjustment, transfer
    transaction_number VARCHAR(100),
    quantity DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    reference_type VARCHAR(50), -- production_order, adjustment, transfer
    reference_id UUID,
    transaction_date DATE,
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warehouse locations
CREATE TABLE warehouse_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_code VARCHAR(50) UNIQUE NOT NULL,
    location_name VARCHAR(255),
    location_type VARCHAR(100), -- raw_material, finished_goods, work_in_progress, packaging
    capacity_limit DECIMAL(10,2),
    current_utilization DECIMAL(10,2) DEFAULT 0,
    temperature_controlled BOOLEAN DEFAULT false,
    humidity_controlled BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 6. PRODUCTION MANAGEMENT
-- ========================================================================

-- Production shifts
CREATE TABLE production_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_name VARCHAR(50) NOT NULL,
    shift_code VARCHAR(10) UNIQUE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_leader UUID REFERENCES users(id),
    break_duration_minutes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production orders
CREATE TABLE production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    mold_id UUID REFERENCES molds(id),
    machine_id UUID REFERENCES machines(id),
    sales_order_id UUID,
    target_quantity INTEGER NOT NULL,
    actual_quantity INTEGER DEFAULT 0,
    ng_quantity INTEGER DEFAULT 0,
    scheduled_start_date DATE,
    scheduled_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    setup_time_minutes INTEGER DEFAULT 0,
    breakdown_time_minutes INTEGER DEFAULT 0,
    cycle_time_standard DECIMAL(6,2),
    cycle_time_actual DECIMAL(6,2),
    priority_level VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'planned', -- planned, released, in_progress, completed, cancelled, on_hold
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily production schedule
CREATE TABLE daily_production_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_date DATE NOT NULL,
    machine_id UUID REFERENCES machines(id) NOT NULL,
    shift_id UUID REFERENCES production_shifts(id) NOT NULL,
    production_order_id UUID REFERENCES production_orders(id),
    sequence_number INTEGER,
    planned_start_time TIMESTAMP WITH TIME ZONE,
    planned_end_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    assigned_operator UUID REFERENCES users(id),
    assigned_setter UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, delayed
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(production_date, machine_id, shift_id, sequence_number)
);

-- Production hourly reports, partitioned by report_datetime
CREATE TABLE production_hourly_reports (
    id UUID, -- id tidak lagi menjadi PRIMARY KEY tunggal
    production_order_id UUID REFERENCES production_orders(id) NOT NULL,
    machine_id UUID REFERENCES machines(id) NOT NULL,
    shift_id UUID REFERENCES production_shifts(id),
    report_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    hour_number INTEGER, -- 1-24
    planned_output INTEGER,
    actual_output INTEGER,
    ng_quantity INTEGER,
    downtime_minutes INTEGER DEFAULT 0,
    setup_time_minutes INTEGER DEFAULT 0,
    cycle_time_average DECIMAL(6,2),
    machine_parameters JSONB,
    quality_issues JSONB,
    oee_availability DECIMAL(5,2),
    oee_performance DECIMAL(5,2),
    oee_quality DECIMAL(5,2),
    oee_overall DECIMAL(5,2),
    operator_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, report_datetime) -- PRIMARY KEY sekarang mencakup report_datetime
) PARTITION BY RANGE (report_datetime);

-- Example partition for production_hourly_reports (adjust as needed for your data retention policy)
CREATE TABLE production_hourly_reports_y2024 PARTITION OF production_hourly_reports
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
-- Add more partitions as needed, e.g., for '2025-01-01' to '2026-01-01' etc.

-- Production material consumption
CREATE TABLE production_material_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID REFERENCES production_orders(id) NOT NULL,
    material_id UUID REFERENCES raw_materials(id) NOT NULL,
    batch_id UUID REFERENCES material_batches(id),
    planned_consumption DECIMAL(10,2),
    actual_consumption DECIMAL(10,2),
    waste_quantity DECIMAL(10,2),
    consumption_date DATE,
    recorded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 7. QUALITY CONTROL
-- ========================================================================

-- Quality standards
CREATE TABLE quality_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    parameter_name VARCHAR(100),
    specification_type VARCHAR(50), -- dimensional, visual, functional, material
    target_value DECIMAL(10,3),
    tolerance_plus DECIMAL(10,3),
    tolerance_minus DECIMAL(10,3),
    unit_of_measure VARCHAR(50),
    measurement_method VARCHAR(255),
    inspection_frequency VARCHAR(100), -- every_hour, every_batch, random, first_piece
    sample_size INTEGER,
    is_critical BOOLEAN DEFAULT false,
    control_chart_type VARCHAR(50), -- xbar_r, xbar_s, p_chart, c_chart
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality inspection reports
CREATE TABLE quality_inspection_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID REFERENCES production_orders(id) NOT NULL,
    inspection_type VARCHAR(100), -- first_piece, hourly, final, customer_complaint
    inspection_datetime TIMESTAMP WITH TIME ZONE,
    inspector_id UUID REFERENCES users(id),
    sample_size INTEGER,
    pass_quantity INTEGER,
    fail_quantity INTEGER,
    overall_result VARCHAR(50), -- pass, fail, conditional_pass
    action_taken TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality measurements
CREATE TABLE quality_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quality_inspection_id UUID REFERENCES quality_inspection_reports(id) ON DELETE CASCADE,
    quality_standard_id UUID REFERENCES quality_standards(id),
    measured_value DECIMAL(10,3),
    is_within_tolerance BOOLEAN,
    deviation DECIMAL(10,3),
    cavity_number INTEGER,
    sample_number INTEGER,
    measurement_datetime TIMESTAMP WITH TIME ZONE,
    measured_by UUID REFERENCES users(id),
    measurement_equipment VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer complaints
CREATE TABLE customer_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID,
    customer_name VARCHAR(255),
    product_id UUID REFERENCES products(id),
    production_order_id UUID REFERENCES production_orders(id),
    batch_number VARCHAR(100),
    complaint_date DATE,
    complaint_category VARCHAR(100), -- dimensional, appearance, functional, delivery, packaging
    complaint_description TEXT,
    quantity_affected INTEGER,
    severity_level VARCHAR(50), -- low, medium, high, critical
    assigned_to UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved, closed
    root_cause TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    cost_impact DECIMAL(10,2),
    resolution_date DATE,
    customer_satisfaction VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 8. FINISHED GOODS INVENTORY
-- ========================================================================

-- Finished goods inventory
CREATE TABLE finished_goods_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    production_order_id UUID REFERENCES production_orders(id),
    batch_number VARCHAR(100),
    quantity INTEGER NOT NULL,
    production_date DATE,
    expiry_date DATE,
    quality_status VARCHAR(50) DEFAULT 'approved', -- quarantine, approved, rejected, hold
    location_id UUID REFERENCES warehouse_locations(id),
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'available', -- available, reserved, shipped, damaged
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finished goods transactions
CREATE TABLE finished_goods_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    inventory_id UUID REFERENCES finished_goods_inventory(id),
    transaction_type VARCHAR(50), -- production, shipment, return, adjustment
    transaction_number VARCHAR(100),
    quantity INTEGER,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    reference_type VARCHAR(50), -- production_order, sales_order, adjustment
    reference_id UUID,
    transaction_date DATE,
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 9. CUSTOMER & SALES MANAGEMENT
-- ========================================================================

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12,2),
    tax_id VARCHAR(100),
    customer_type VARCHAR(50) DEFAULT 'regular', -- regular, premium, vip
    status VARCHAR(50) DEFAULT 'active',
    sales_representative UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales orders
CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    order_date DATE NOT NULL,
    required_date DATE,
    promised_date DATE,
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, in_production, ready_to_ship, shipped, completed, cancelled
    total_amount DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'IDR',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_terms VARCHAR(100),
    sales_person UUID REFERENCES users(id),
    priority_level VARCHAR(50) DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales order items
CREATE TABLE sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(12,2),
    required_date DATE,
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 10. COST MANAGEMENT
-- ========================================================================

-- Cost centers
CREATE TABLE cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_center_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    parent_cost_center_id UUID REFERENCES cost_centers(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production costs
CREATE TABLE production_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID REFERENCES production_orders(id) NOT NULL,
    cost_center_id UUID REFERENCES cost_centers(id),
    cost_category VARCHAR(100), -- material, labor, overhead, energy, tooling
    cost_subcategory VARCHAR(100),
    cost_item VARCHAR(255),
    quantity DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    cost_date DATE,
    actual_cost BOOLEAN DEFAULT true, -- true for actual, false for standard
    recorded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machine operating costs
CREATE TABLE machine_operating_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) NOT NULL,
    cost_date DATE NOT NULL,
    electricity_cost DECIMAL(10,2),
    maintenance_cost DECIMAL(10,2),
    operator_cost DECIMAL(10,2),
    depreciation_cost DECIMAL(10,2),
    overhead_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    operating_hours DECIMAL(8,2),
    cost_per_hour DECIMAL(10,2),
    pieces_produced INTEGER,
    cost_per_piece DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(machine_id, cost_date)
);

-- Energy consumption tracking
CREATE TABLE energy_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) NOT NULL,
    consumption_date DATE NOT NULL,
    shift_id UUID REFERENCES production_shifts(id),
    energy_type VARCHAR(50), -- electricity, compressed_air, cooling_water, heating
    consumption_amount DECIMAL(10,2),
    unit_of_measure VARCHAR(50),
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    meter_reading_start DECIMAL(10,2),
    meter_reading_end DECIMAL(10,2),
    operating_hours DECIMAL(8,2),
    recorded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 11. REPORTING & ANALYTICS
-- ========================================================================

-- Daily production summary
CREATE TABLE daily_production_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_date DATE NOT NULL,
    machine_id UUID REFERENCES machines(id) NOT NULL,
    shift_id UUID REFERENCES production_shifts(id),
    total_planned_hours DECIMAL(8,2),
    total_actual_hours DECIMAL(8,2),
    total_downtime_minutes INTEGER,
    total_setup_time_minutes INTEGER,
    total_planned_output INTEGER,
    total_actual_output INTEGER,
    total_ng_quantity INTEGER,
    average_oee DECIMAL(5,2),
    average_quality_rate DECIMAL(5,2),
    energy_consumption DECIMAL(10,2),
    production_cost DECIMAL(12,2),
    efficiency_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(production_date, machine_id, shift_id)
);

-- Monthly KPI summary
CREATE TABLE monthly_kpi_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_year DATE NOT NULL, -- first day of month
    total_production_hours DECIMAL(10,2),
    total_downtime_hours DECIMAL(10,2),
    total_maintenance_hours DECIMAL(10,2),
    average_oee DECIMAL(5,2),
    average_quality_rate DECIMAL(5,2),
    total_production_quantity INTEGER,
    total_ng_quantity INTEGER,
    total_production_cost DECIMAL(12,2),
    total_maintenance_cost DECIMAL(12,2),
    total_energy_cost DECIMAL(12,2),
    customer_complaints_count INTEGER,
    on_time_delivery_rate DECIMAL(5,2),
    machine_utilization_rate DECIMAL(5,2),
    overall_productivity DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month_year)
);

-- Machine efficiency tracking
CREATE TABLE machine_efficiency_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) NOT NULL,
    tracking_date DATE NOT NULL,
    planned_production_time DECIMAL(8,2),
    actual_production_time DECIMAL(8,2),
    downtime_hours DECIMAL(8,2),
    setup_time_hours DECIMAL(8,2),
    maintenance_time_hours DECIMAL(8,2),
    availability_rate DECIMAL(5,2),
    performance_rate DECIMAL(5,2),
    quality_rate DECIMAL(5,2),
    oee_rate DECIMAL(5,2),
    total_output INTEGER,
    total_ng_quantity INTEGER,
    defect_rate DECIMAL(5,2),
    energy_consumption DECIMAL(10,2),
    cost_per_hour DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(machine_id, tracking_date)
);

-- ========================================================================
-- 12. SYSTEM CONFIGURATION & SETTINGS
-- ========================================================================

-- System configurations
CREATE TABLE system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    data_type VARCHAR(50), -- string, number, boolean, json
    category VARCHAR(100),
    is_system_config BOOLEAN DEFAULT false,
    is_encrypted BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification settings
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100), -- machine_breakdown, quality_alert, stock_low, maintenance_due
    is_enabled BOOLEAN DEFAULT true,
    delivery_method VARCHAR(50), -- email, sms, in_app, push
    threshold_value DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- Audit trail
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100)
);

-- System logs
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_level VARCHAR(20) NOT NULL, -- DEBUG, INFO, WARN, ERROR, FATAL
    module VARCHAR(100),
    message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 13. INVENTORY MANAGEMENT ENHANCEMENTS
-- ========================================================================

-- Inventory adjustments
CREATE TABLE inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_number VARCHAR(100) UNIQUE NOT NULL,
    material_id UUID REFERENCES raw_materials(id),
    batch_id UUID REFERENCES material_batches(id),
    adjustment_type VARCHAR(50), -- physical_count, damage, expired, found, lost, transfer
    quantity_before DECIMAL(10,2),
    quantity_after DECIMAL(10,2),
    adjustment_quantity DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    total_cost_impact DECIMAL(12,2),
    reason TEXT,
    approved_by UUID REFERENCES users(id),
    performed_by UUID REFERENCES users(id),
    adjustment_date DATE,
    reference_document VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cycle counting
CREATE TABLE cycle_counting_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES raw_materials(id) NOT NULL,
    frequency_days INTEGER NOT NULL,
    last_count_date DATE,
    next_count_date DATE,
    assigned_to UUID REFERENCES users(id),
    priority_level VARCHAR(50) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cycle_counting_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES cycle_counting_schedule(id) NOT NULL,
    count_date DATE NOT NULL,
    system_quantity DECIMAL(10,2),
    physical_quantity DECIMAL(10,2),
    variance_quantity DECIMAL(10,2),
    variance_percentage DECIMAL(5,2),
    counted_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    adjustment_created BOOLEAN DEFAULT false,
    adjustment_id UUID REFERENCES inventory_adjustments(id),
    count_method VARCHAR(50), -- manual, barcode, rfid
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material expiry tracking
CREATE TABLE material_expiry_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES raw_materials(id) NOT NULL,
    batch_id UUID REFERENCES material_batches(id) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity_remaining DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active', -- active, expiring_soon, expired, disposed
    alert_sent BOOLEAN DEFAULT false,
    disposal_date DATE,
    disposal_method VARCHAR(100),
    disposal_cost DECIMAL(10,2),
    disposed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_contact TEXT,
    order_date DATE NOT NULL,
    required_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, acknowledged, delivered, completed, cancelled
    total_amount DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'IDR',
    payment_terms VARCHAR(100),
    delivery_terms VARCHAR(100),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase order items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    material_id UUID REFERENCES raw_materials(id) NOT NULL,
    quantity_ordered DECIMAL(10,2),
    quantity_received DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(12,2),
    required_date DATE,
    received_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 14. PERFORMANCE INDEXES FOR OPTIMIZATION
-- ========================================================================

-- Critical indexes for performance
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_current_mold ON machines(current_mold_id);
CREATE INDEX idx_machines_type_status ON machines(machine_type, status);

CREATE INDEX idx_production_orders_status ON production_orders(status);
CREATE INDEX idx_production_orders_machine_date ON production_orders(machine_id, scheduled_start_date);
CREATE INDEX idx_production_orders_product ON production_orders(product_id);

CREATE INDEX idx_daily_production_schedule_date_machine ON daily_production_schedule(production_date, machine_id);
CREATE INDEX idx_daily_production_schedule_status ON daily_production_schedule(status);

CREATE INDEX idx_machine_downtime_machine_date ON machine_downtime(machine_id, start_datetime);
CREATE INDEX idx_machine_downtime_category ON machine_downtime(downtime_category);

CREATE INDEX idx_quality_measurements_inspection ON quality_measurements(quality_inspection_id);
CREATE INDEX idx_quality_measurements_standard ON quality_measurements(quality_standard_id);

CREATE INDEX idx_production_costs_order_category ON production_costs(production_order_id, cost_category);
CREATE INDEX idx_production_costs_date ON production_costs(cost_date);

CREATE INDEX idx_sales_orders_customer_date ON sales_orders(customer_id, order_date);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);

CREATE INDEX idx_raw_materials_code ON raw_materials(material_code);
CREATE INDEX idx_raw_materials_category ON raw_materials(category);

CREATE INDEX idx_material_batches_material_batch ON material_batches(material_id, batch_number);
CREATE INDEX idx_material_batches_expiry ON material_batches(expiry_date);

CREATE INDEX idx_finished_goods_inventory_product ON finished_goods_inventory(product_id);
CREATE INDEX idx_finished_goods_inventory_status ON finished_goods_inventory(status);

CREATE INDEX idx_audit_trail_table_record ON audit_trail(table_name, record_id);
CREATE INDEX idx_audit_trail_user_date ON audit_trail(changed_by, changed_at);

CREATE INDEX idx_production_hourly_reports_order_datetime ON production_hourly_reports(production_order_id, report_datetime);
CREATE INDEX idx_production_hourly_reports_machine_date ON production_hourly_reports(machine_id, report_datetime);

-- Additional indexes for specific queries
CREATE INDEX idx_production_hourly_reports_datetime_machine ON production_hourly_reports(report_datetime, machine_id);
CREATE INDEX idx_machine_operating_parameters_datetime ON machine_operating_parameters(recorded_at);

-- ========================================================================
-- 15. ESSENTIAL VIEWS FOR REPORTING
-- ========================================================================

-- Machine utilization overview
CREATE VIEW machine_utilization_view AS
SELECT
    m.id,
    m.machine_code,
    m.name,
    m.machine_type,
    m.status,
    m.current_mold_id,
    mold.mold_code,
    COALESCE(SUM(EXTRACT(EPOCH FROM (dps.actual_end_time - dps.actual_start_time))/3600), 0) as actual_hours_today,
    COALESCE(SUM(EXTRACT(EPOCH FROM (dps.planned_end_time - dps.planned_start_time))/3600), 0) as planned_hours_today,
    COALESCE(SUM(md.duration_minutes), 0) as downtime_minutes_today,
    CASE
        WHEN SUM(EXTRACT(EPOCH FROM (dps.planned_end_time - dps.planned_start_time))/3600) > 0
        THEN ROUND((SUM(EXTRACT(EPOCH FROM (dps.actual_end_time - dps.actual_start_time))/3600) / SUM(EXTRACT(EPOCH FROM (dps.planned_end_time - dps.planned_start_time))/3600) * 100), 2)
        ELSE 0
    END as utilization_percentage
FROM machines m
LEFT JOIN molds mold ON m.current_mold_id = mold.id
LEFT JOIN daily_production_schedule dps ON m.id = dps.machine_id AND dps.production_date = CURRENT_DATE
LEFT JOIN machine_downtime md ON m.id = md.machine_id AND DATE(md.start_datetime) = CURRENT_DATE
GROUP BY m.id, m.machine_code, m.name, m.machine_type, m.status, m.current_mold_id, mold.mold_code;

-- Production efficiency overview
CREATE VIEW production_efficiency_view AS
SELECT
    po.id,
    po.order_number,
    p.product_code,
    p.name as product_name,
    m.machine_code,
    po.target_quantity,
    po.actual_quantity,
    po.ng_quantity,
    CASE
        WHEN po.target_quantity > 0
        THEN ROUND((po.actual_quantity::DECIMAL / po.target_quantity * 100), 2)
        ELSE 0
    END as completion_percentage,
    CASE
        WHEN po.actual_quantity > 0
        THEN ROUND((po.ng_quantity::DECIMAL / po.actual_quantity * 100), 2)
        ELSE 0
    END as defect_rate,
    COALESCE(AVG(phr.oee_overall), 0) as average_oee,
    po.status,
    po.scheduled_start_date,
    po.scheduled_end_date,
    po.actual_start_date,
    po.actual_end_date
FROM production_orders po
JOIN products p ON po.product_id = p.id
LEFT JOIN machines m ON po.machine_id = m.id
LEFT JOIN production_hourly_reports phr ON po.id = phr.production_order_id
GROUP BY po.id, po.order_number, p.product_code, p.name, m.machine_code, po.target_quantity,
         po.actual_quantity, po.ng_quantity, po.status, po.scheduled_start_date,
         po.scheduled_end_date, po.actual_start_date, po.actual_end_date;

-- Inventory status overview
CREATE VIEW inventory_status_view AS
SELECT
    rm.id,
    rm.material_code,
    rm.name,
    rm.category,
    rm.current_stock,
    rm.minimum_stock,
    rm.maximum_stock,
    rm.unit_of_measure,
    CASE
        WHEN rm.current_stock <= rm.minimum_stock * 0.5 THEN 'Critical'
        WHEN rm.current_stock <= rm.minimum_stock THEN 'Low'
        WHEN rm.current_stock >= rm.maximum_stock THEN 'Overstock'
        ELSE 'Normal'
    END as stock_status,
    CASE
        WHEN rm.current_stock <= rm.minimum_stock
        THEN rm.reorder_quantity
        ELSE 0
    END as suggested_reorder_quantity,
    rm.unit_cost,
    rm.current_stock * rm.unit_cost as total_value
FROM raw_materials rm
WHERE rm.is_active = true;

-- Quality performance overview
CREATE VIEW quality_performance_view AS
SELECT
    p.id as product_id,
    p.product_code,
    p.name as product_name,
    COUNT(qir.id) as total_inspections,
    COUNT(CASE WHEN qir.overall_result = 'pass' THEN 1 END) as passed_inspections,
    COUNT(CASE WHEN qir.overall_result = 'fail' THEN 1 END) as failed_inspections,
    CASE
        WHEN COUNT(qir.id) > 0
        THEN ROUND((COUNT(CASE WHEN qir.overall_result = 'pass' THEN 1 END)::DECIMAL / COUNT(qir.id) * 100), 2)
        ELSE 0
    END as pass_rate,
    COUNT(cc.id) as customer_complaints,
    AVG(qm.measured_value) as avg_measured_value
FROM products p
LEFT JOIN production_orders po ON p.id = po.product_id
LEFT JOIN quality_inspection_reports qir ON po.id = qir.production_order_id
LEFT JOIN quality_measurements qm ON qir.id = qm.quality_inspection_id
LEFT JOIN customer_complaints cc ON p.id = cc.product_id
WHERE qir.inspection_datetime >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.product_code, p.name;

-- Machine maintenance status
CREATE VIEW machine_maintenance_status_view AS
SELECT
    m.id,
    m.machine_code,
    m.name,
    m.last_maintenance_date,
    m.next_maintenance_date,
    CASE
        WHEN m.next_maintenance_date < CURRENT_DATE THEN 'Overdue'
        WHEN m.next_maintenance_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'Due Soon'
        ELSE 'Scheduled'
    END as maintenance_status,
    COUNT(mms.id) as scheduled_maintenance_items,
    COUNT(CASE WHEN mms.next_due_date <= CURRENT_DATE THEN 1 END) as overdue_items,
    SUM(CASE WHEN mmh.maintenance_date >= CURRENT_DATE - INTERVAL '30 days' THEN mmh.total_cost ELSE 0 END) as maintenance_cost_30days
FROM machines m
LEFT JOIN machine_maintenance_schedule mms ON m.id = mms.machine_id AND mms.is_active = true
LEFT JOIN machine_maintenance_history mmh ON m.id = mmh.machine_id
GROUP BY m.id, m.machine_code, m.name, m.last_maintenance_date, m.next_maintenance_date;

-- Daily production dashboard
CREATE VIEW daily_production_dashboard_view AS
SELECT
    CURRENT_DATE as production_date,
    COUNT(DISTINCT m.id) as total_machines,
    COUNT(DISTINCT CASE WHEN dps.status = 'in_progress' THEN m.id END) as machines_running,
    COUNT(DISTINCT CASE WHEN m.status = 'breakdown' THEN m.id END) as machines_breakdown,
    COUNT(DISTINCT CASE WHEN m.status = 'maintenance' THEN m.id END) as machines_maintenance,
    COUNT(DISTINCT po.id) as active_production_orders,
    SUM(CASE WHEN dps.production_date = CURRENT_DATE AND dps.actual_start_time IS NOT NULL AND dps.actual_end_time IS NULL THEN 1 ELSE 0 END) as orders_in_progress,
    SUM(phr.actual_output) as total_output_today,
    SUM(phr.ng_quantity) as total_ng_today,
    CASE
        WHEN SUM(phr.actual_output) > 0
        THEN ROUND((SUM(phr.ng_quantity)::DECIMAL / SUM(phr.actual_output) * 100), 2)
        ELSE 0
    END as overall_defect_rate_today,
    ROUND(AVG(phr.oee_overall), 2) as average_oee_today
FROM machines m
LEFT JOIN daily_production_schedule dps ON m.id = dps.machine_id
LEFT JOIN production_orders po ON dps.production_order_id = po.id
LEFT JOIN production_hourly_reports phr ON po.id = phr.production_order_id
    AND DATE(phr.report_datetime) = CURRENT_DATE;

-- API views for external systems
CREATE VIEW api_production_status AS
SELECT
    machine_code,
    status,
    -- Note: 'current_order', 'output_rate', 'oee_current' need further definition
    -- if they are to be derived from machine_utilization_view or other sources.
    actual_hours_today,
    utilization_percentage
FROM machine_utilization_view;

-- ========================================================================
-- 16. STORED PROCEDURES FOR COMMON OPERATIONS
-- ========================================================================

-- Function to calculate OEE
CREATE OR REPLACE FUNCTION calculate_oee(
    p_planned_time DECIMAL,    -- Planned operating time in hours
    p_actual_time DECIMAL,     -- Actual operating time in hours (Planned - Downtime)
    p_downtime_minutes INTEGER, -- Total downtime in minutes
    p_planned_output INTEGER,  -- Planned output quantity for the period
    p_actual_output INTEGER,   -- Actual good output quantity for the period (Good parts)
    p_ng_quantity INTEGER      -- Non-good (rejected) quantity for the period
) RETURNS TABLE (
    availability DECIMAL,
    performance DECIMAL,
    quality DECIMAL,
    oee DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Availability: (Actual Operating Time / Planned Operating Time) * 100
        CASE
            WHEN p_planned_time > 0
            THEN ROUND(((p_planned_time - (p_downtime_minutes / 60.0)) / p_planned_time * 100), 2)
            ELSE 0
        END as availability,
        -- Performance: (Actual Output / Ideal Output Rate) * 100, where Ideal Output Rate = Planned Output for Actual Operating Time
        -- Assuming p_planned_output is based on ideal cycle time for planned time, and p_actual_output is actual total parts
        -- A more precise performance needs ideal cycle time * actual run time
        -- (Total Parts Produced * Ideal Cycle Time) / Run Time
        -- For simplicity, using (Actual Total Output / Planned Total Output)
        CASE
            WHEN p_planned_output > 0 -- Using planned_output as a proxy for 'ideal rate * actual operating time'
            THEN ROUND(((p_actual_output + p_ng_quantity)::DECIMAL / p_planned_output * 100), 2)
            ELSE 0
        END as performance,
        -- Quality: (Good Parts / Total Parts Produced) * 100
        CASE
            WHEN (p_actual_output + p_ng_quantity) > 0
            THEN ROUND((p_actual_output::DECIMAL / (p_actual_output + p_ng_quantity) * 100), 2)
            ELSE 0
        END as quality,
        -- OEE: Availability * Performance * Quality (as a percentage of 100)
        CASE
            WHEN p_planned_time > 0 AND (p_actual_output + p_ng_quantity) > 0
            THEN ROUND((
                ((p_planned_time - (p_downtime_minutes / 60.0)) / p_planned_time) *
                (((p_actual_output + p_ng_quantity)::DECIMAL / p_planned_output)) * -- Adjusted performance logic
                (p_actual_output::DECIMAL / (p_actual_output + p_ng_quantity)) * 100
            ), 2)
            ELSE 0
        END as oee;
END;
$$ LANGUAGE plpgsql;

-- Function to update material stock
CREATE OR REPLACE FUNCTION update_material_stock(
    p_material_id UUID,
    p_quantity_change DECIMAL,
    p_transaction_type VARCHAR,
    p_reference_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_stock DECIMAL;
    v_new_stock DECIMAL;
BEGIN
    -- Get current stock
    SELECT current_stock INTO v_current_stock
    FROM raw_materials
    WHERE id = p_material_id;

    -- Calculate new stock
    v_new_stock := v_current_stock + p_quantity_change;

    -- Check if stock would go negative
    IF v_new_stock < 0 THEN
        RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', v_current_stock, ABS(p_quantity_change);
    END IF;

    -- Update stock
    UPDATE raw_materials
    SET current_stock = v_new_stock,
        updated_at = NOW()
    WHERE id = p_material_id;

    -- Log transaction
    INSERT INTO material_transactions (
        material_id,
        transaction_type,
        quantity,
        reference_id,
        transaction_date,
        performed_by
    ) VALUES (
        p_material_id,
        p_transaction_type,
        p_quantity_change,
        p_reference_id,
        CURRENT_DATE,
        p_user_id
    );

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ========================================================================
-- 17. TRIGGERS FOR AUTOMATION
-- ========================================================================

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to tables with updated_at column
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_machines_modtime BEFORE UPDATE ON machines FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_molds_modtime BEFORE UPDATE ON molds FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_raw_materials_modtime BEFORE UPDATE ON raw_materials FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_production_orders_modtime BEFORE UPDATE ON production_orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_finished_goods_inventory_modtime BEFORE UPDATE ON finished_goods_inventory FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_sales_orders_modtime BEFORE UPDATE ON sales_orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (table_name, record_id, action, old_values, changed_at)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), NOW());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (table_name, record_id, action, old_values, new_values, changed_at)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (table_name, record_id, action, new_values, changed_at)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), NOW());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_production_orders AFTER INSERT OR UPDATE OR DELETE ON production_orders FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_quality_inspection_reports AFTER INSERT OR UPDATE OR DELETE ON quality_inspection_reports FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_machine_downtime AFTER INSERT OR UPDATE OR DELETE ON machine_downtime FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_raw_materials AFTER INSERT OR UPDATE OR DELETE ON raw_materials FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ========================================================================
-- 18. INITIAL DATA SETUP
-- ========================================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'System Administrator', '{"all": true}'),
('production_manager', 'Production Manager', '{"production": "full", "quality": "full", "machines": "full"}'),
('quality_inspector', 'Quality Inspector', '{"quality": "full", "production": "read"}'),
('machine_operator', 'Machine Operator', '{"production": "limited", "machines": "limited"}'),
('warehouse_staff', 'Warehouse Staff', '{"inventory": "full", "materials": "full"}'),
('sales_staff', 'Sales Staff', '{"sales": "full", "customers": "full"}');

-- Insert default production shifts
INSERT INTO production_shifts (shift_name, shift_code, start_time, end_time) VALUES
('Morning Shift', 'SHIFT1', '07:00', '15:00'),
('Afternoon Shift', 'SHIFT2', '15:00', '23:00'),
('Night Shift', 'SHIFT3', '23:00', '07:00');

-- Insert default cost centers
INSERT INTO cost_centers (cost_center_code, name, description) VALUES
('PROD001', 'Production Department', 'Main production cost center'),
('QUAL001', 'Quality Control', 'Quality control and testing'),
('MAINT001', 'Maintenance', 'Machine maintenance and repair'),
('WARE001', 'Warehouse', 'Inventory and warehouse operations'),
('ADMIN001', 'Administration', 'Administrative costs');

-- Insert default system configurations
INSERT INTO system_configurations (config_key, config_value, description, data_type, category) VALUES
('company_name', 'PT. Plastik Injection Indonesia', 'Company name', 'string', 'company'),
('default_currency', 'IDR', 'Default currency', 'string', 'system'),
('working_hours_per_day', '8', 'Standard working hours per day', 'number', 'production'),
('quality_alert_threshold', '5', 'Quality alert threshold percentage', 'number', 'quality'),
('low_stock_alert_threshold', '20', 'Low stock alert threshold percentage', 'number', 'inventory'),
('oee_target', '85', 'Target OEE percentage', 'number', 'production'),
('maintenance_lead_time_days', '7', 'Maintenance notification lead time', 'number', 'maintenance');

-- Insert default warehouse locations
INSERT INTO warehouse_locations (location_code, location_name, location_type) VALUES
('RM001', 'Raw Material Storage A', 'raw_material'),
('RM002', 'Raw Material Storage B', 'raw_material'),
('FG001', 'Finished Goods Storage A', 'finished_goods'),
('FG002', 'Finished Goods Storage B', 'finished_goods'),
('WIP001', 'Work in Progress Area', 'work_in_progress'),
('PKG001', 'Packaging Material Storage', 'packaging');

-- ========================================================================
-- 19. COMMENTS AND DOCUMENTATION
-- ========================================================================

COMMENT ON DATABASE ERP_IPP IS 'ERP Database for Plastic Injection Manufacturing Company';

-- Table comments
COMMENT ON TABLE machines IS 'Core table for managing injection molding machines';
COMMENT ON TABLE molds IS 'Mold management and tracking';
COMMENT ON COLUMN molds.image_url IS 'URL to the mold image stored in object storage.';
COMMENT ON TABLE products IS 'Product catalog and specifications';
COMMENT ON COLUMN products.image_url IS 'URL to the product image stored in object storage.';
COMMENT ON TABLE production_orders IS 'Production order management';
COMMENT ON TABLE quality_inspection_reports IS 'Quality control and inspection records';
COMMENT ON TABLE raw_materials IS 'Raw material inventory management';
COMMENT ON COLUMN raw_materials.image_url IS 'URL to the raw material image stored in object storage.';
COMMENT ON TABLE customers IS 'Customer management';
COMMENT ON TABLE sales_orders IS 'Sales order processing';
COMMENT ON TABLE machine_operating_parameters IS 'Real-time operating parameters for machines, partitioned by date.';
COMMENT ON TABLE production_hourly_reports IS 'Hourly production reports, partitioned by date.';
COMMENT ON TABLE machine_sensor_data IS 'Raw sensor data from machines for real-time monitoring and IoT integration.';
COMMENT ON COLUMN users.profile_picture_url IS 'URL to the user''s profile picture stored in object storage.';


-- Column comments for critical fields
COMMENT ON COLUMN machines.tonnage IS 'Clamping force in tons';
COMMENT ON COLUMN machines.shot_size_capacity IS 'Maximum shot size capacity in grams';
COMMENT ON COLUMN production_orders.cycle_time_standard IS 'Standard cycle time in seconds';
COMMENT ON COLUMN production_hourly_reports.oee_overall IS 'Overall Equipment Effectiveness percentage';

-- ========================================================================
-- 20. OPERATIONAL CONSIDERATIONS AND FURTHER ENHANCEMENTS
-- ========================================================================

-- Data Retention Policy (Operational Recommendation)
-- Implement an archiving strategy for older historical data (e.g., beyond 1-2 years)
-- to a data warehouse or cold storage solution for long-term analytics while
-- maintaining primary database performance.
--
-- For system_logs and audit_trail tables, set up scheduled jobs (e.g., cron jobs,
-- pg_cron) to automatically prune old records (e.g., delete data older than 6-12 months)
-- to manage database size and performance.
-- Example of a conceptual function for cleanup (requires pg_cron extension or external scheduler):
-- CREATE OR REPLACE FUNCTION clean_old_logs() RETURNS VOID AS $$
-- BEGIN
--     DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '6 months';
--     DELETE FROM audit_trail WHERE changed_at < NOW() - INTERVAL '1 year';
-- END;
-- $$ LANGUAGE plpgsql;
-- To schedule daily cleanup with pg_cron:
-- SELECT cron.schedule('daily-log-cleanup', '0 2 * * *', 'SELECT clean_old_logs();');


-- Enhanced Notifications (Application Logic Recommendation)
-- Implement application-level logic to trigger real-time alerts based on:
-- - Machine breakdown: Monitor machine_downtime table for new entries, especially
--   those with high priority or unplanned status.
-- - Predictive maintenance: Analyze machine_efficiency_tracking and
--   machine_maintenance_schedule for anomalies (e.g., OEE drops below threshold,
--   next_maintenance_date approaching/overdue).
-- - Quality deviation: Based on quality_measurements (is_within_tolerance = false)
--   and quality_inspection_reports (overall_result = 'fail'), or new customer_complaints.
-- Utilize the notification_settings table to customize these alerts per user and
-- delivery method (email, SMS, in-app).

-- Integration Points (Architecture Recommendation)
-- - SCADA/IoT Systems (using MQTT with NodeMCU):
--   The machine_operating_parameters and machine_sensor_data tables are designed for
--   real-time data collection.
--   - NodeMCU/ESP8266: Collects sensor data (e.g., product counter) and publishes to an MQTT Broker.
--   - MQTT Broker: Receives messages from NodeMCU.
--   - Data Ingestion Service (e.g., Supabase Edge Function, Serverless Function, or custom backend):
--     Subscribes to MQTT topics, parses incoming JSON data, and inserts it into
--     'machine_sensor_data' and/or updates 'machine_operating_parameters'.
--     Example INSERT by ingestion service:
--     INSERT INTO machine_sensor_data (machine_id, sensor_type, sensor_value, timestamp)
--     VALUES ('your_machine_uuid', 'product_output_counter', 1, NOW());
-- - Accounting Systems: Develop integration modules (APIs or batch exports) to synchronize
--   financial data (production costs, sales orders, purchase orders) with external
--   accounting software (e.g., SAP, Oracle Financials, QuickBooks) for automated
--   billing, cost analysis, and financial reporting.

-- Mobile Support (Application Layer Recommendation)
-- Develop mobile applications or responsive web interfaces for:
-- - Machine Operators: To report production quantities, downtime reasons, and
--   consumption directly from the shop floor.
-- - Quality Inspectors: For on-the-spot quality data entry and defect reporting.
-- - Maintenance Technicians: To manage work orders, log maintenance activities,
--   and order parts from a mobile device.

-- ========================================================================
-- END OF SCHEMA
-- ========================================================================

-- ===============================
-- ADDITIONAL STRUCTURE (MERGED)
-- ===============================

-- ================================================================
-- UPDATED ERP DATABASE SCHEMA WITH ENHANCED FEATURES
-- ================================================================
-- Note: This includes only additional/modified tables for clarity

-- ===============================
-- 1. EMPLOYEE TRAINING & CERTIFICATION
-- ===============================
CREATE TABLE employee_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    certification_name VARCHAR(255) NOT NULL,
    certification_level VARCHAR(100),
    issued_by VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certification_file_url TEXT,
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- 2. FORECASTING & PRODUCTION PLANNING
-- ===============================
CREATE TABLE demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    forecast_month DATE NOT NULL, -- first day of month
    forecast_quantity INTEGER NOT NULL,
    forecast_method VARCHAR(100), -- manual, trend, ML
    confidence_level DECIMAL(5,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, forecast_month)
);

CREATE TABLE production_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_date DATE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    planned_quantity INTEGER NOT NULL,
    machine_id UUID REFERENCES machines(id),
    shift_id UUID REFERENCES production_shifts(id),
    reference_forecast_id UUID REFERENCES demand_forecasts(id),
    status VARCHAR(50) DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- 3. VERSION CONTROL FOR PRODUCT & BOM
-- ===============================
CREATE TABLE product_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    version_code VARCHAR(50) NOT NULL,
    change_description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, version_code)
);

CREATE TABLE bom_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_version_id UUID REFERENCES product_versions(id) ON DELETE CASCADE,
    material_id UUID REFERENCES raw_materials(id),
    quantity_per_piece DECIMAL(10,3),
    unit_of_measure VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- 4. DOCUMENT MANAGEMENT
-- ===============================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    related_table VARCHAR(100), -- e.g., 'products', 'molds'
    related_id UUID,
    file_name TEXT,
    file_url TEXT NOT NULL,
    document_type VARCHAR(100), -- sop, msds, drawing
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- 5. PREDICTIVE MAINTENANCE
-- ===============================
CREATE TABLE predictive_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id),
    alert_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    predicted_issue VARCHAR(255),
    confidence_score DECIMAL(5,2),
    source_model VARCHAR(100),
    handled BOOLEAN DEFAULT false,
    notes TEXT
);

-- ===============================
-- 6. OPERATOR FEEDBACK & SUGGESTIONS
-- ===============================
CREATE TABLE operator_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    machine_id UUID REFERENCES machines(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    feedback_type VARCHAR(100), -- issue, improvement
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ===============================
-- 7. JOB TIME TRACKING
-- ===============================
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID REFERENCES production_orders(id),
    work_order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE labor_time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    work_order_id UUID REFERENCES work_orders(id),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    total_minutes INTEGER GENERATED ALWAYS AS (FLOOR(EXTRACT(EPOCH FROM (end_time - start_time)) / 60)) STORED,
    task_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- 8. CONTAINER / PACKAGING MANAGEMENT
-- ===============================
CREATE TABLE containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_code VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50), -- pallet, box, carton
    status VARCHAR(50) DEFAULT 'available',
    current_location_id UUID REFERENCES warehouse_locations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE container_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID REFERENCES containers(id),
    finished_goods_id UUID REFERENCES finished_goods_inventory(id),
    quantity INTEGER,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- END OF UPDATED STRUCTURE
-- ===============================

-- ======================================
-- COMMENT EXTENSION FOR ERP DATABASE
-- ======================================

-- Komentar untuk database
COMMENT ON DATABASE ERP_IPP IS 'ERP Database for Plastic Injection Manufacturing Company';

-- work_orders
COMMENT ON TABLE work_orders IS 'Work orders untuk mencatat aktivitas kerja berdasarkan produksi';
COMMENT ON COLUMN work_orders.id IS 'Primary key work order';
COMMENT ON COLUMN work_orders.production_order_id IS 'Relasi ke production_orders';
COMMENT ON COLUMN work_orders.work_order_number IS 'Nomor unik work order';
COMMENT ON COLUMN work_orders.status IS 'Status work order: open, in_progress, completed';
COMMENT ON COLUMN work_orders.created_at IS 'Waktu pencatatan work order';

-- labor_time_logs
COMMENT ON TABLE labor_time_logs IS 'Log waktu kerja operator pada work order tertentu';
COMMENT ON COLUMN labor_time_logs.id IS 'Primary key log waktu';
COMMENT ON COLUMN labor_time_logs.user_id IS 'Relasi ke pengguna/operator';
COMMENT ON COLUMN labor_time_logs.work_order_id IS 'Relasi ke work order yang dikerjakan';
COMMENT ON COLUMN labor_time_logs.start_time IS 'Waktu mulai kerja';
COMMENT ON COLUMN labor_time_logs.end_time IS 'Waktu selesai kerja';
COMMENT ON COLUMN labor_time_logs.total_minutes IS 'Total menit kerja dihitung otomatis';
COMMENT ON COLUMN labor_time_logs.task_description IS 'Deskripsi tugas yang dikerjakan';
COMMENT ON COLUMN labor_time_logs.created_at IS 'Waktu pencatatan log';

-- containers
COMMENT ON TABLE containers IS 'Manajemen kontainer fisik seperti pallet dan box';
COMMENT ON COLUMN containers.id IS 'Primary key kontainer';
COMMENT ON COLUMN containers.container_code IS 'Kode unik kontainer';
COMMENT ON COLUMN containers.type IS 'Tipe kontainer: pallet, box, carton';
COMMENT ON COLUMN containers.status IS 'Status ketersediaan kontainer';
COMMENT ON COLUMN containers.current_location_id IS 'Relasi ke lokasi warehouse saat ini';
COMMENT ON COLUMN containers.created_at IS 'Waktu pencatatan kontainer';

-- container_assignments
COMMENT ON TABLE container_assignments IS 'Relasi antara kontainer dan barang jadi yang disimpan';
COMMENT ON COLUMN container_assignments.id IS 'Primary key';
COMMENT ON COLUMN container_assignments.container_id IS 'Relasi ke kontainer';
COMMENT ON COLUMN container_assignments.finished_goods_id IS 'Relasi ke inventory barang jadi';
COMMENT ON COLUMN container_assignments.quantity IS 'Jumlah barang dalam kontainer';
COMMENT ON COLUMN container_assignments.assigned_at IS 'Waktu penempatan barang ke kontainer';

-- predictive_alerts
COMMENT ON TABLE predictive_alerts IS 'Alert prediktif berdasarkan model machine learning';
COMMENT ON COLUMN predictive_alerts.id IS 'Primary key';
COMMENT ON COLUMN predictive_alerts.machine_id IS 'Relasi ke mesin yang dipantau';
COMMENT ON COLUMN predictive_alerts.alert_datetime IS 'Waktu munculnya alert';
COMMENT ON COLUMN predictive_alerts.predicted_issue IS 'Masalah yang diprediksi akan muncul';
COMMENT ON COLUMN predictive_alerts.confidence_score IS 'Tingkat keyakinan prediksi';
COMMENT ON COLUMN predictive_alerts.source_model IS 'Model ML yang digunakan';
COMMENT ON COLUMN predictive_alerts.handled IS 'Status apakah alert sudah ditindaklanjuti';
COMMENT ON COLUMN predictive_alerts.notes IS 'Catatan tambahan';

-- operator_feedback
COMMENT ON TABLE operator_feedback IS 'Masukan dan saran dari operator terkait mesin dan proses';
COMMENT ON COLUMN operator_feedback.id IS 'Primary key';
COMMENT ON COLUMN operator_feedback.user_id IS 'Operator yang memberi masukan';
COMMENT ON COLUMN operator_feedback.machine_id IS 'Mesin yang relevan';
COMMENT ON COLUMN operator_feedback.submitted_at IS 'Waktu pengajuan masukan';
COMMENT ON COLUMN operator_feedback.feedback_type IS 'Tipe masukan: issue, improvement';
COMMENT ON COLUMN operator_feedback.message IS 'Isi pesan atau saran';
COMMENT ON COLUMN operator_feedback.status IS 'Status penanganan masukan';
COMMENT ON COLUMN operator_feedback.reviewed_by IS 'Siapa yang meninjau masukan';
COMMENT ON COLUMN operator_feedback.reviewed_at IS 'Kapan masukan ditinjau';

-- finished_goods_inventory
COMMENT ON TABLE finished_goods_inventory IS 'Inventarisasi barang jadi yang telah diproduksi';
COMMENT ON COLUMN finished_goods_inventory.id IS 'Primary key inventory barang jadi';
COMMENT ON COLUMN finished_goods_inventory.product_id IS 'Produk terkait';
COMMENT ON COLUMN finished_goods_inventory.production_order_id IS 'Referensi ke produksi';
COMMENT ON COLUMN finished_goods_inventory.batch_number IS 'Nomor batch produksi';
COMMENT ON COLUMN finished_goods_inventory.quantity IS 'Jumlah unit dalam inventory';
COMMENT ON COLUMN finished_goods_inventory.production_date IS 'Tanggal produksi';
COMMENT ON COLUMN finished_goods_inventory.expiry_date IS 'Tanggal kadaluarsa (jika relevan)';
COMMENT ON COLUMN finished_goods_inventory.quality_status IS 'Status kualitas: approved, rejected, quarantine';
COMMENT ON COLUMN finished_goods_inventory.location_id IS 'Lokasi penyimpanan barang jadi';
COMMENT ON COLUMN finished_goods_inventory.unit_cost IS 'Biaya per unit';
COMMENT ON COLUMN finished_goods_inventory.total_cost IS 'Total nilai inventory';
COMMENT ON COLUMN finished_goods_inventory.status IS 'Status barang: available, reserved, shipped';
COMMENT ON COLUMN finished_goods_inventory.notes IS 'Catatan tambahan';
COMMENT ON COLUMN finished_goods_inventory.created_at IS 'Waktu pencatatan';
COMMENT ON COLUMN finished_goods_inventory.updated_at IS 'Waktu update terakhir';