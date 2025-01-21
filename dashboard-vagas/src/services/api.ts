import { DashboardStats, Empresa, FilaProcessamento, Vaga } from "@/types";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getUrlWithTimestamp(url: string) {
  return `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
}

export async function getStats(): Promise<DashboardStats> {
  const response = await fetch(getUrlWithTimestamp(`${API_URL}/stats`), { 
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar estatísticas');
  }
  return response.json();
}

export async function getEmpresas(): Promise<Empresa[]> {
  const response = await fetch(getUrlWithTimestamp(`${API_URL}/empresas`), { 
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar empresas');
  }
  return response.json();
}

export async function getEmpresaById(id: string): Promise<Empresa> {
  const response = await fetch(getUrlWithTimestamp(`${API_URL}/empresas/${id}`), { 
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar empresa');
  }
  return response.json();
}

export async function getVagas(): Promise<Vaga[]> {
  const response = await fetch(getUrlWithTimestamp(`${API_URL}/vagas`), { 
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar vagas');
  }
  return response.json();
}

export async function getVagasByEmpresaId(empresaId: string): Promise<Vaga[]> {
  const response = await fetch(getUrlWithTimestamp(`${API_URL}/empresas/${empresaId}/vagas`), { 
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar vagas da empresa');
  }
  return response.json();
}

export async function getFilaProcessamento(): Promise<FilaProcessamento[]> {
  const response = await fetch(getUrlWithTimestamp(`${API_URL}/fila`), { 
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar fila de processamento');
  }
  return response.json();
}

export async function getLogs(): Promise<string[]> {
  const response = await fetch(getUrlWithTimestamp(`${API_URL}/logs`), { 
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar logs');
  }
  return response.json();
}

export async function processarVagas(formData: FormData) {
  'use server';
  
  const empresaId = formData.get('empresaId');
  const response = await fetch(getUrlWithTimestamp(`${API_URL}/empresas/${empresaId}/processar-vagas`), {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });

  if (!response.ok) {
    throw new Error('Falha ao processar vagas');
  }

  // Revalidar os dados
  revalidatePath('/');
  return response.json();
} 