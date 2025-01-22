import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { env } from '../config/env';
import axios from 'axios';
import { VagaData } from '../types';

export async function listarVagas(req: Request, res: Response) {
  try {
    const { data: vagas, error } = await supabase
      .from('vagas')
      .select(`
        *,
        empresas (
          id,
          nome,
          jobboard
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Formatar os dados para o frontend
    const vagasFormatadas = vagas.map(vaga => ({
      id: vaga.id,
      url: vaga.url,
      empresa_id: vaga.empresa_id,
      empresa_nome: vaga.empresas?.nome,
      titulo: vaga.titulo,
      area: vaga.area,
      senioridade: vaga.senioridade,
      modelo_trabalho: vaga.modelo_trabalho,
      modelo_contrato: vaga.modelo_contrato,
      localizacao: vaga.localizacao,
      descricao: vaga.descricao,
      requisitos: vaga.requisitos,
      beneficios: vaga.beneficios,
      status: vaga.status,
      data_importacao: vaga.data_importacao,
      created_at: vaga.created_at,
      updated_at: vaga.updated_at
    }));

    res.json(vagasFormatadas);
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
}

export async function processarVaga(req: Request, res: Response) {
  try {
    const { url, empresa_id } = req.body;

    if (!url || !empresa_id) {
      res.status(400).json({ error: 'URL e empresa_id são obrigatórios' });
      return;
    }

    // Verificar se a vaga já existe
    const { data: vagaExistente } = await supabase
      .from('vagas')
      .select('id')
      .eq('url', url)
      .eq('empresa_id', empresa_id)
      .single();

    if (vagaExistente) {
      res.status(409).json({ error: 'Vaga já existe', vaga_id: vagaExistente.id });
      return;
    }

    // Processar vaga com IA
    const aiResponse = await axios.post(`${env.API_BASE_URL}/job-ai-analysis`, {
      url
    });

    // Inserir vaga no banco
    const vagaData = aiResponse.data as VagaData;
    const { data: novaVaga, error } = await supabase
      .from('vagas')
      .insert({
        empresa_id,
        url,
        titulo: vagaData.titulo || 'Sem título',
        area: vagaData.area,
        senioridade: vagaData.senioridade,
        modelo_trabalho: vagaData.modelo_trabalho,
        modelo_contrato: vagaData.modelo_contrato,
        localizacao: vagaData.localizacao,
        descricao: vagaData.descricao,
        requisitos: vagaData.requisitos,
        beneficios: vagaData.beneficios,
        status: true,
        data_importacao: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Vaga processada com sucesso',
      vaga_id: novaVaga.id,
      dados: vagaData
    });
  } catch (error) {
    console.error('Erro ao processar vaga:', error);
    res.status(500).json({ error: 'Erro ao processar vaga' });
  }
} 