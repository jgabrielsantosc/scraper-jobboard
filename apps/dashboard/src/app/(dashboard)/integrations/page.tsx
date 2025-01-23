'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { listBases } from '@/lib/airtable/api';
import { saveApiKey } from '@/lib/supabase/apiKeys';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Base {
  id: string;
  name: string;
}

export default function IntegrationsPage() {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [bases, setBases] = useState<Base[]>([]);
  const [selectedBase, setSelectedBase] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

  useEffect(() => {
    if (apiKey) {
      listBases(apiKey)
        .then(setBases)
        .catch((error) => {
          console.error('Erro ao listar bases:', error);
          toast({
            title: "Erro",
            description: "Não foi possível listar as bases. Verifique sua chave API.",
            variant: "destructive",
          });
        });
    }
  }, [apiKey, toast]);

  const handleApiKeySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    console.log('🚀 Iniciando processo de salvamento...');

    try {
      console.log('📝 Obtendo dados do usuário...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Erro ao obter usuário:', userError);
        throw new Error('Falha ao obter dados do usuário');
      }

      console.log('👤 Dados do usuário:', { userId: user?.id });
      
      if (!user) {
        console.error('❌ Usuário não encontrado');
        throw new Error('Usuário não autenticado');
      }

      console.log('🔑 Tentando salvar API key...', {
        userId: user.id,
        apiKeyLength: apiKey.length,
        selectedBase
      });

      const result = await saveApiKey(user.id, apiKey, selectedBase);
      console.log('✅ Resultado do salvamento:', result);
      
      toast({
        title: "Sucesso",
        description: "Credenciais salvas com sucesso!",
      });
      
      console.log('⏭️ Avançando para próximo passo...');
      setStep(2);
    } catch (error) {
      console.error('❌ Erro detalhado ao salvar credenciais:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        errorStack: error instanceof Error ? error.stack : undefined
      });

      toast({
        title: "Erro",
        description: error instanceof Error 
          ? `Erro: ${error.message}`
          : "Não foi possível salvar as credenciais. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 Finalizando processo de salvamento');
      setLoading(false);
    }
  };

  const handleBaseSelection = (baseId: string) => {
    setSelectedBase(baseId);
    setStep(3);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Integrações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurar Airtable</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Selecione a Plataforma</h2>
              <Button 
                onClick={() => setStep(2)} 
                className="flex items-center space-x-2"
                variant="outline"
              >
                <Image 
                  src="/airtable-logo.png" 
                  alt="Airtable Logo" 
                  width={24} 
                  height={24} 
                />
                <span>Airtable</span>
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleApiKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  Airtable API Key
                </label>
                <Input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Insira sua chave API do Airtable"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !apiKey}
              >
                {loading ? 'Salvando...' : 'Salvar Credenciais'}
              </Button>
            </form>
          )}

          {step === 3 && bases.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Selecione a Base</h2>
              <div className="grid gap-2">
                {bases.map((base) => (
                  <Button
                    key={base.id}
                    variant="outline"
                    onClick={() => handleBaseSelection(base.id)}
                    className="w-full justify-start text-left"
                  >
                    {base.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 