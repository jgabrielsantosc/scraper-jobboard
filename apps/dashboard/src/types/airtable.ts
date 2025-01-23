export interface AirtableCompany {
  id: string;
  fields: {
    Name: string;
    Description?: string;
    Website?: string;
    Industry?: string;
    Size?: string;
    Location?: string;
    Logo?: string[];
    Status?: string;
    CreatedAt?: string;
    UpdatedAt?: string;
  };
}

export interface AirtableJob {
  id: string;
  fields: {
    Title: string;
    Company?: string[];  // Reference to Companies table
    Description?: string;
    Requirements?: string;
    Location?: string;
    SalaryRange?: string;
    JobType?: string;
    Status?: string;
    ExternalLink?: string;
    CreatedAt?: string;
    UpdatedAt?: string;
  };
} 