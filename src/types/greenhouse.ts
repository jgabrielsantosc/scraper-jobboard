export interface GreenhouseJob {
  absolute_url: string;
  data_compliance?: Array<{
    type: string;
    requires_consent: boolean;
    requires_processing_consent: boolean;
    requires_retention_consent: boolean;
    retention_period: number | null;
    demographic_data_consent_applies: boolean;
  }>;
  education?: string;
  internal_job_id: number;
  location: {
    name: string;
  };
  metadata: any[] | null;
  id: number;
  updated_at: string;
  requisition_id?: string;
  title: string;
  content?: string;
  departments?: GreenhouseDepartment[];
  offices?: GreenhouseOffice[];
}

export interface GreenhouseDepartment {
  id: number;
  name: string;
  child_ids: number[];
  parent_id: number | null;
}

export interface GreenhouseOffice {
  id: number;
  name: string;
  location: string | null;
  child_ids: number[];
  parent_id: number | null;
}

export interface GreenhouseJobsResponse {
  jobs: GreenhouseJob[];
  meta: {
    total: number;
  };
} 