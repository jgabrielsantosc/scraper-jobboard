import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';

export const scraperJobSolides = async (url: string): Promise<string[]> => {
  const companyName = new URL(url).hostname.split('.')[0];
  const baseUrl = `https://${companyName}.vagas.solides.com.br/vaga/`;
  
  const firstPageResponse = await axios.get(
    `https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=1&slug=${companyName}`
  );

  const totalPages = firstPageResponse.data.data.totalPages;
  const allJobs: any[] = [];

  for (let page = 1; page <= totalPages; page++) {
    const response = await axios.get(
      `https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=${page}&slug=${companyName}`
    );
    allJobs.push(...response.data.data.data);
  }

  const jobUrls = allJobs.map(job => `${baseUrl}${job.id}`);
  
  return jobUrls;
};