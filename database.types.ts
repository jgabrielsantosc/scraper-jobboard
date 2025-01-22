export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      empresas: {
        Row: {
          airtable_id: string | null
          created_at: string | null
          id: string
          jobboard: string
          linkedin: string | null
          nome: string
          site: string | null
          status: boolean | null
          ultima_execucao: string | null
          updated_at: string | null
        }
        Insert: {
          airtable_id?: string | null
          created_at?: string | null
          id?: string
          jobboard: string
          linkedin?: string | null
          nome: string
          site?: string | null
          status?: boolean | null
          ultima_execucao?: string | null
          updated_at?: string | null
        }
        Update: {
          airtable_id?: string | null
          created_at?: string | null
          id?: string
          jobboard?: string
          linkedin?: string | null
          nome?: string
          site?: string | null
          status?: boolean | null
          ultima_execucao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fila_processamento: {
        Row: {
          created_at: string | null
          empresa_id: string | null
          erro: string | null
          id: string
          status: string | null
          tentativas: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          empresa_id?: string | null
          erro?: string | null
          id?: string
          status?: string | null
          tentativas?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          empresa_id?: string | null
          erro?: string | null
          id?: string
          status?: string | null
          tentativas?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fila_processamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      rotinas: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          empresa_id: string | null
          id: string
          ultima_execucao: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          ultima_execucao?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          ultima_execucao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rotinas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      vagas: {
        Row: {
          area: string | null
          beneficios: Json | null
          created_at: string | null
          data_importacao: string | null
          descricao: string | null
          empresa_id: string | null
          id: string
          localizacao: Json | null
          modelo_contrato: string | null
          modelo_trabalho: string | null
          requisitos: Json | null
          senioridade: string | null
          status: boolean | null
          titulo: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          area?: string | null
          beneficios?: Json | null
          created_at?: string | null
          data_importacao?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          localizacao?: Json | null
          modelo_contrato?: string | null
          modelo_trabalho?: string | null
          requisitos?: Json | null
          senioridade?: string | null
          status?: boolean | null
          titulo?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          area?: string | null
          beneficios?: Json | null
          created_at?: string | null
          data_importacao?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          localizacao?: Json | null
          modelo_contrato?: string | null
          modelo_trabalho?: string | null
          requisitos?: Json | null
          senioridade?: string | null
          status?: boolean | null
          titulo?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "vagas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_job: {
        Args: {
          msg_id: number
        }
        Returns: undefined
      }
      enqueue_jobs: {
        Args: {
          jobs: Json[]
        }
        Returns: undefined
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_next_job: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["CompositeTypes"]["queue_message"]
      }
      get_queue_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      return_job_to_queue: {
        Args: {
          msg_id: number
        }
        Returns: undefined
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      queue_message: {
        id: number | null
        message: Json | null
        visible_at: string | null
        created_at: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
