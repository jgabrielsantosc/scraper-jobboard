import axios from 'axios';

export async function listBases(apiKey: string) {
  const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return response.data.bases;
} 