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
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          name?: string
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          method: string
          path: string
          request_body: Json | null
          response_body: Json | null
          response_time: number
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method: string
          path: string
          request_body?: Json | null
          response_body?: Json | null
          response_time: number
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method?: string
          path?: string
          request_body?: Json | null
          response_body?: Json | null
          response_time?: number
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          jobboard_type: string
          jobboard_url: string
          logo_url: string | null
          name: string
          status: string | null
          updated_at: string
          user_id: string
          website: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          jobboard_type: string
          jobboard_url: string
          logo_url?: string | null
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
          website: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          jobboard_type?: string
          jobboard_url?: string
          logo_url?: string | null
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          website?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          area: string | null
          benefits: Json | null
          city: string | null
          contract_type: string | null
          country: string | null
          created_at: string | null
          id: string
          job_board_id: string | null
          raw_data: Json | null
          requirements: Json | null
          seniority: string | null
          state: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          url: string
          work_model: string | null
        }
        Insert: {
          area?: string | null
          benefits?: Json | null
          city?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          job_board_id?: string | null
          raw_data?: Json | null
          requirements?: Json | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          url: string
          work_model?: string | null
        }
        Update: {
          area?: string | null
          benefits?: Json | null
          city?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          job_board_id?: string | null
          raw_data?: Json | null
          requirements?: Json | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string
          work_model?: string | null
        }
        Relationships: []
      }
      scraping_schedules: {
        Row: {
          created_at: string | null
          frequency: string
          id: string
          is_active: boolean | null
          job_board_id: string | null
          last_run: string | null
          next_run: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          job_board_id?: string | null
          last_run?: string | null
          next_run?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          job_board_id?: string | null
          last_run?: string | null
          next_run?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Relationships: []
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
      get_api_key: {
        Args: {
          p_user_id: string
          p_name: string
        }
        Returns: string
      }
      get_dashboard_stats: {
        Args: {
          p_user_id: string
        }
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
      get_secret: {
        Args: {
          secret_name: string
        }
        Returns: string
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
      save_api_key: {
        Args: {
          p_user_id: string
          p_key: string
          p_name: string
        }
        Returns: string
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
