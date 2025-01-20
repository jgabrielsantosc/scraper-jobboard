import { DashboardStats, Empresa, FilaProcessamento, Vaga } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_URL}/stats`);
  if (!response.ok) {
    throw new Error('Falha ao buscar estatísticas');
  }
  return response.json();
}

export async function getEmpresas(): Promise<Empresa[]> {
  const response = await fetch(`${API_URL}/empresas`);
  if (!response.ok) {
    throw new Error('Falha ao buscar empresas');
  }
  return response.json();
}

export async function getVagas(): Promise<Vaga[]> {
  const response = await fetch(`${API_URL}/vagas`);
  if (!response.ok) {
    throw new Error('Falha ao buscar vagas');
  }
  return response.json();
}

export async function getFilaProcessamento(): Promise<FilaProcessamento[]> {
  const response = await fetch(`${API_URL}/fila`);
  if (!response.ok) {
    throw new Error('Falha ao buscar fila de processamento');
  }
  return response.json();
}

export async function getLogs(): Promise<string[]> {
  const response = await fetch(`${API_URL}/logs`);
  if (!response.ok) {
    throw new Error('Falha ao buscar logs');
  }
  return response.json();
} 