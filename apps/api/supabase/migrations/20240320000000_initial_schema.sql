-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_boards table
CREATE TABLE job_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_board_id UUID REFERENCES job_boards(id) ON DELETE CASCADE,
    url TEXT NOT NULL UNIQUE,
    title TEXT,
    area TEXT,
    seniority TEXT,
    work_model TEXT,
    contract_type TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    requirements JSONB,
    benefits JSONB,
    raw_data JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scraping_schedules table
CREATE TABLE scraping_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_board_id UUID REFERENCES job_boards(id) ON DELETE CASCADE,
    frequency TEXT NOT NULL,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_schedules ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_jobs_job_board_id ON jobs(job_board_id);
CREATE INDEX idx_job_boards_company_id ON job_boards(company_id);
CREATE INDEX idx_scraping_schedules_job_board_id ON scraping_schedules(job_board_id); 