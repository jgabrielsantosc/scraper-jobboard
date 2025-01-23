import { airtable, TABLES } from './client';
import type { AirtableCompany, AirtableJob } from '@/types/airtable';

export const companyService = {
  async list() {
    try {
      const records = await airtable(TABLES.COMPANIES)
        .select({
          view: 'Grid view',
        })
        .all();

      return records as unknown as AirtableCompany[];
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const record = await airtable(TABLES.COMPANIES).find(id);
      return record as unknown as AirtableCompany;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },
};

export const jobService = {
  async list() {
    try {
      const records = await airtable(TABLES.JOBS)
        .select({
          view: 'Grid view',
        })
        .all();

      return records as unknown as AirtableJob[];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const record = await airtable(TABLES.JOBS).find(id);
      return record as unknown as AirtableJob;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },

  async getByCompany(companyId: string) {
    try {
      const records = await airtable(TABLES.JOBS)
        .select({
          filterByFormula: `FIND("${companyId}", {Company})`,
          view: 'Grid view',
        })
        .all();

      return records as unknown as AirtableJob[];
    } catch (error) {
      console.error(`Error fetching jobs for company ${companyId}:`, error);
      throw error;
    }
  },
}; 