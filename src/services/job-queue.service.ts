import { supabase } from '../config/supabase';
import { JobData } from '../types';

export interface QueueMessage {
  id: number;
  message: JobData;
  visible_at: string;
  created_at: string;
}

export class JobQueueService {
  static async adicionarNaFila(job: JobData): Promise<void> {
    const { error } = await supabase.rpc('enqueue_jobs', {
      jobs: [{
        empresa_id: job.empresa_id,
        url: job.url,
        status: job.status,
        tentativas: job.tentativas,
        erro: job.erro,
        data_processamento: job.data_processamento
      }]
    });

    if (error) {
      console.error('Erro ao adicionar job na fila:', error);
      throw error;
    }
  }

  static async obterProximoJob(): Promise<{ id: number; job: JobData } | null> {
    const { data, error } = await supabase.rpc('get_next_job');

    if (error) {
      console.error('Erro ao obter próximo job:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    const message = data as QueueMessage;
    return {
      id: message.id,
      job: message.message
    };
  }

  static async marcarComoProcessado(messageId: number): Promise<void> {
    const { error } = await supabase.rpc('archive_job', {
      msg_id: messageId
    });

    if (error) {
      console.error('Erro ao marcar job como processado:', error);
      throw error;
    }
  }

  static async devolverParaFila(messageId: number): Promise<void> {
    const { error } = await supabase.rpc('return_job_to_queue', {
      msg_id: messageId
    });

    if (error) {
      console.error('Erro ao devolver job para fila:', error);
      throw error;
    }
  }

  static async getStats(): Promise<{
    total: number;
    processando: number;
    arquivadas: number;
  }> {
    const { data, error } = await supabase.rpc('get_queue_stats');

    if (error) {
      console.error('Erro ao buscar estatísticas da fila:', error);
      throw error;
    }

    return data;
  }
} 