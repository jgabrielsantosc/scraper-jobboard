import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('Missing AIRTABLE_API_KEY');
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing AIRTABLE_BASE_ID');
}

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

export const TABLES = {
  COMPANIES: 'Companies',
  JOBS: 'Jobs',
} as const;

export { airtable }; 