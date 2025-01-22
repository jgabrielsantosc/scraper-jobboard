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
      address: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_primary: boolean
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          postal_code: string | null
          state: string | null
          street: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          postal_code?: string | null
          state?: string | null
          street?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          postal_code?: string | null
          state?: string | null
          street?: string | null
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          method: string
          processing_time_ms: number | null
          request_body: Json | null
          request_headers: Json | null
          response_body: Json | null
          response_status: number
          route: string
          source_system: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          method: string
          processing_time_ms?: number | null
          request_body?: Json | null
          request_headers?: Json | null
          response_body?: Json | null
          response_status: number
          route: string
          source_system?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          method?: string
          processing_time_ms?: number | null
          request_body?: Json | null
          request_headers?: Json | null
          response_body?: Json | null
          response_status?: number
          route?: string
          source_system?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      attribute_type_category: {
        Row: {
          created_at: string
          description: string | null
          embedding: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      business_model: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      company: {
        Row: {
          business_model: string | null
          category: string | null
          country_code: string | null
          created_at: string
          description: string | null
          employee_count: number | null
          employee_range: number | null
          founded_year: number | null
          id: string
          industry: string | null
          metadata: Json | null
          name: string
          name_variations: string[] | null
          parent_company_id: string | null
          sector: string | null
          updated_at: string
        }
        Insert: {
          business_model?: string | null
          category?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          employee_count?: number | null
          employee_range?: number | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          name: string
          name_variations?: string[] | null
          parent_company_id?: string | null
          sector?: string | null
          updated_at?: string
        }
        Update: {
          business_model?: string | null
          category?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          employee_count?: number | null
          employee_range?: number | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          name?: string
          name_variations?: string[] | null
          parent_company_id?: string | null
          sector?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "company_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employee_range_fkey"
            columns: ["employee_range"]
            isOneToOne: false
            referencedRelation: "employee_range"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      company_category: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      company_description: {
        Row: {
          company_id: string | null
          content: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          language: string | null
          source: string | null
          type: string | null
        }
        Insert: {
          company_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          language?: string | null
          source?: string | null
          type?: string | null
        }
        Update: {
          company_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          language?: string | null
          source?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_description_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      company_employee_history: {
        Row: {
          company_id: string | null
          employee_count: number | null
          employee_range_id: number | null
          id: string
          recorded_at: string | null
          source: string | null
        }
        Insert: {
          company_id?: string | null
          employee_count?: number | null
          employee_range_id?: number | null
          id?: string
          recorded_at?: string | null
          source?: string | null
        }
        Update: {
          company_id?: string | null
          employee_count?: number | null
          employee_range_id?: number | null
          id?: string
          recorded_at?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_employee_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employee_history_employee_range_id_fkey"
            columns: ["employee_range_id"]
            isOneToOne: false
            referencedRelation: "employee_range"
            referencedColumns: ["id"]
          },
        ]
      }
      company_jobs_history: {
        Row: {
          company_id: string | null
          id: string
          jobs_by_area: Json | null
          metadata: Json | null
          recorded_at: string | null
          total_open_jobs: number | null
        }
        Insert: {
          company_id?: string | null
          id?: string
          jobs_by_area?: Json | null
          metadata?: Json | null
          recorded_at?: string | null
          total_open_jobs?: number | null
        }
        Update: {
          company_id?: string | null
          id?: string
          jobs_by_area?: Json | null
          metadata?: Json | null
          recorded_at?: string | null
          total_open_jobs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_jobs_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subcategory: {
        Row: {
          category: number | null
          created_at: string
          description: string | null
          id: number
          name: string | null
        }
        Insert: {
          category?: number | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          category?: number | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      company_tag: {
        Row: {
          company: string | null
          created_at: string
          id: string
          metadata: Json | null
          tag: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          tag?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_tag_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tag_tag_fkey"
            columns: ["tag"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
        ]
      }
      contact: {
        Row: {
          contact_type: string
          contact_value: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_primary: boolean | null
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          contact_type: string
          contact_value: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          contact_type?: string
          contact_value?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_logs: {
        Row: {
          created_at: string | null
          credits_used: number
          description: string | null
          id: string
          list_id: string | null
          profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_used: number
          description?: string | null
          id?: string
          list_id?: string | null
          profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          description?: string | null
          id?: string
          list_id?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_logs_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_list: {
        Row: {
          company: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          product: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          product?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          product?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_list_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_list_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      data_fields: {
        Row: {
          cluster: string | null
          created_at: string | null
          credit_cost: number
          data_key: string
          description: string | null
          entity_type: string | null
          field_name: string
          id: string
        }
        Insert: {
          cluster?: string | null
          created_at?: string | null
          credit_cost: number
          data_key: string
          description?: string | null
          entity_type?: string | null
          field_name: string
          id?: string
        }
        Update: {
          cluster?: string | null
          created_at?: string | null
          credit_cost?: number
          data_key?: string
          description?: string | null
          entity_type?: string | null
          field_name?: string
          id?: string
        }
        Relationships: []
      }
      demo_list: {
        Row: {
          companies: string[] | null
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: number
          list_type: string
          metadata: Json | null
          name: string
          products: string[] | null
          public: boolean | null
        }
        Insert: {
          companies?: string[] | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          list_type: string
          metadata?: Json | null
          name: string
          products?: string[] | null
          public?: boolean | null
        }
        Update: {
          companies?: string[] | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          list_type?: string
          metadata?: Json | null
          name?: string
          products?: string[] | null
          public?: boolean | null
        }
        Relationships: []
      }
      demo_list_item: {
        Row: {
          entity_id: string
          entity_type: string
          list_id: number
          metadata: Json | null
        }
        Insert: {
          entity_id: string
          entity_type: string
          list_id: number
          metadata?: Json | null
        }
        Update: {
          entity_id?: string
          entity_type?: string
          list_id?: number
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "list_item_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "demo_list"
            referencedColumns: ["id"]
          },
        ]
      }
      domain: {
        Row: {
          created_at: string
          description: string | null
          domain_type: string
          entity_id: string
          entity_type: string
          id: string
          is_main_site: boolean
          metadata: Json | null
          title: string | null
          updated_at: string | null
          url: string
          url_parts: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_type: string
          entity_id: string
          entity_type: string
          id?: string
          is_main_site?: boolean
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          url: string
          url_parts?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_type?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_main_site?: boolean
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          url?: string
          url_parts?: Json | null
        }
        Relationships: []
      }
      employee_range: {
        Row: {
          created_at: string | null
          id: number
          max_employees: number | null
          min_employees: number
          name: string
          range_text: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          max_employees?: number | null
          min_employees: number
          name: string
          range_text?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          max_employees?: number | null
          min_employees?: number
          name?: string
          range_text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      enrich_external: {
        Row: {
          created_at: string
          data: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          provider: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
        }
        Relationships: []
      }
      enrich_log: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          error: string | null
          id: string
          metadata: Json | null
          source: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          error?: string | null
          id?: string
          metadata?: Json | null
          source: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      formacoes: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_pt: string
          name_variations_en: string[] | null
          name_variations_pt: string[] | null
          type_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_pt: string
          name_variations_en?: string[] | null
          name_variations_pt?: string[] | null
          type_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_pt?: string
          name_variations_en?: string[] | null
          name_variations_pt?: string[] | null
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "formacoes_type_fk"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "tipos_formacao"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_investor: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          funding_round_id: string | null
          id: string
          investment_type: string | null
          is_lead: boolean | null
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          funding_round_id?: string | null
          id?: string
          investment_type?: string | null
          is_lead?: boolean | null
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          funding_round_id?: string | null
          id?: string
          investment_type?: string | null
          is_lead?: boolean | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_investor_funding_round_id_fkey"
            columns: ["funding_round_id"]
            isOneToOne: false
            referencedRelation: "funding_round"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_round: {
        Row: {
          amount: number | null
          company_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          round_date: string | null
          round_type: string | null
        }
        Insert: {
          amount?: number | null
          company_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          round_date?: string | null
          round_type?: string | null
        }
        Update: {
          amount?: number | null
          company_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          round_date?: string | null
          round_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_round_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      image: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id: string
          metadata?: Json | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      image_link: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          image_id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id: string
          image_id: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          image_id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_image_link_image"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_link_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
        ]
      }
      job: {
        Row: {
          address_id: string | null
          company_id: string
          contract_model: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          job_area_id: number | null
          job_subarea_id: number | null
          job_title_id: number
          jobboard_id: string | null
          language: string | null
          metadata: Json | null
          salary_range: number[] | null
          seniority: string | null
          short_url: string | null
          slug: string | null
          status: boolean | null
          title: string
          turnoff_date: string | null
          updated_at: string
          url: string | null
          work_model: string | null
        }
        Insert: {
          address_id?: string | null
          company_id: string
          contract_model?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          job_area_id?: number | null
          job_subarea_id?: number | null
          job_title_id: number
          jobboard_id?: string | null
          language?: string | null
          metadata?: Json | null
          salary_range?: number[] | null
          seniority?: string | null
          short_url?: string | null
          slug?: string | null
          status?: boolean | null
          title: string
          turnoff_date?: string | null
          updated_at?: string
          url?: string | null
          work_model?: string | null
        }
        Update: {
          address_id?: string | null
          company_id?: string
          contract_model?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          job_area_id?: number | null
          job_subarea_id?: number | null
          job_title_id?: number
          jobboard_id?: string | null
          language?: string | null
          metadata?: Json | null
          salary_range?: number[] | null
          seniority?: string | null
          short_url?: string | null
          slug?: string | null
          status?: boolean | null
          title?: string
          turnoff_date?: string | null
          updated_at?: string
          url?: string | null
          work_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_job_area_id_fkey"
            columns: ["job_area_id"]
            isOneToOne: false
            referencedRelation: "job_area"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_job_seniority_id_fkey"
            columns: ["seniority"]
            isOneToOne: false
            referencedRelation: "job_seniority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_job_subarea_id_fkey"
            columns: ["job_subarea_id"]
            isOneToOne: false
            referencedRelation: "job_subarea"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_title"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_jobboard_id_fkey"
            columns: ["jobboard_id"]
            isOneToOne: false
            referencedRelation: "jobboard"
            referencedColumns: ["id"]
          },
        ]
      }
      job_area: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      job_attribute: {
        Row: {
          job_attribute_type_id: string
          job_id: string
        }
        Insert: {
          job_attribute_type_id: string
          job_id: string
        }
        Update: {
          job_attribute_type_id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_attribute_job_attribute_type_id_fkey"
            columns: ["job_attribute_type_id"]
            isOneToOne: false
            referencedRelation: "job_attribute_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attribute_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job"
            referencedColumns: ["id"]
          },
        ]
      }
      job_attribute_type: {
        Row: {
          attribute_type_category_id: string | null
          created_at: string
          description: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          name: string
          name_variations: string[] | null
          product_id: string | null
        }
        Insert: {
          attribute_type_category_id?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          name: string
          name_variations?: string[] | null
          product_id?: string | null
        }
        Update: {
          attribute_type_category_id?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          name_variations?: string[] | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_attribute_type_attribute_type_category_id_fkey"
            columns: ["attribute_type_category_id"]
            isOneToOne: false
            referencedRelation: "attribute_type_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attribute_type_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      job_benefit: {
        Row: {
          benefit_value: number | null
          job_benefit_type_id: string
          job_id: string
          metadata: Json | null
        }
        Insert: {
          benefit_value?: number | null
          job_benefit_type_id: string
          job_id: string
          metadata?: Json | null
        }
        Update: {
          benefit_value?: number | null
          job_benefit_type_id?: string
          job_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "job_benefit_job_benefit_type_id_fkey"
            columns: ["job_benefit_type_id"]
            isOneToOne: false
            referencedRelation: "job_benefit_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_benefit_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job"
            referencedColumns: ["id"]
          },
        ]
      }
      job_benefit_type: {
        Row: {
          created_at: string
          description: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          name: string
          name_variations: string[] | null
          product_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          name: string
          name_variations?: string[] | null
          product_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          name_variations?: string[] | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_benefit_type_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      job_bruto: {
        Row: {
          attribute: string[] | null
          benefits: string[] | null
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          title: string | null
          url: string | null
        }
        Insert: {
          attribute?: string[] | null
          benefits?: string[] | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          url?: string | null
        }
        Update: {
          attribute?: string[] | null
          benefits?: string[] | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_bruto_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      job_fila: {
        Row: {
          company_id: string
          created_at: string
          id: string
          jobboard: string
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          jobboard: string
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          jobboard?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_fila_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_fila_jobboard_fkey"
            columns: ["jobboard"]
            isOneToOne: false
            referencedRelation: "jobboard"
            referencedColumns: ["id"]
          },
        ]
      }
      job_seniority: {
        Row: {
          created_at: string | null
          description: string | null
          description_long: string | null
          embedding: string | null
          examples: string[] | null
          id: string
          internal_job_title: string | null
          internal_name: string | null
          level: number | null
          level_variations: Json | null
          metadata: Json | null
          name_variations: string[]
          public_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          embedding?: string | null
          examples?: string[] | null
          id?: string
          internal_job_title?: string | null
          internal_name?: string | null
          level?: number | null
          level_variations?: Json | null
          metadata?: Json | null
          name_variations?: string[]
          public_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          embedding?: string | null
          examples?: string[] | null
          id?: string
          internal_job_title?: string | null
          internal_name?: string | null
          level?: number | null
          level_variations?: Json | null
          metadata?: Json | null
          name_variations?: string[]
          public_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_subarea: {
        Row: {
          description: string | null
          id: number
          job_area_id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          job_area_id: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          job_area_id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_subarea_job_area_id_fkey"
            columns: ["job_area_id"]
            isOneToOne: false
            referencedRelation: "job_area"
            referencedColumns: ["id"]
          },
        ]
      }
      job_title: {
        Row: {
          created_at: string | null
          description: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          name: string
          similar_titles: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          name: string
          similar_titles?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          name?: string
          similar_titles?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jobboard: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          platform: string
          status: boolean
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          platform: string
          status: boolean
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          platform?: string
          status?: boolean
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      legal_company: {
        Row: {
          cnpj: string | null
          company_id: string | null
          created_at: string | null
          id: string
          legal_name: string
        }
        Insert: {
          cnpj?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          legal_name: string
        }
        Update: {
          cnpj?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          legal_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      list: {
        Row: {
          archived: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          profile_id: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          profile_id?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      list_columns: {
        Row: {
          column_name: string
          created_at: string | null
          credits_used: number | null
          data_field_id: string | null
          id: string
          list_id: string | null
          unlocked: boolean | null
        }
        Insert: {
          column_name: string
          created_at?: string | null
          credits_used?: number | null
          data_field_id?: string | null
          id?: string
          list_id?: string | null
          unlocked?: boolean | null
        }
        Update: {
          column_name?: string
          created_at?: string | null
          credits_used?: number | null
          data_field_id?: string | null
          id?: string
          list_id?: string | null
          unlocked?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "list_columns_data_field_id_fkey"
            columns: ["data_field_id"]
            isOneToOne: false
            referencedRelation: "data_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_columns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "list"
            referencedColumns: ["id"]
          },
        ]
      }
      list_item: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          list_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          list_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          list_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_item_list_id_fkey1"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "list"
            referencedColumns: ["id"]
          },
        ]
      }
      list_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          list_id: string | null
          profile_id: string | null
          team_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          list_id?: string | null
          profile_id?: string | null
          team_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          list_id?: string | null
          profile_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_logs_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          address_id: string | null
          content: string | null
          created_at: string
          id: string
          language: string | null
          metadata: Json | null
          portal_id: string | null
          publication_date: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          language?: string | null
          metadata?: Json | null
          portal_id?: string | null
          publication_date?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          language?: string | null
          metadata?: Json | null
          portal_id?: string | null
          publication_date?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "news_portal"
            referencedColumns: ["id"]
          },
        ]
      }
      news_address: {
        Row: {
          address_id: string
          news_id: string
        }
        Insert: {
          address_id: string
          news_id: string
        }
        Update: {
          address_id?: string
          news_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_address_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_address_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_company: {
        Row: {
          company_id: string
          news_id: string
        }
        Insert: {
          company_id: string
          news_id: string
        }
        Update: {
          company_id?: string
          news_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_company_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_person: {
        Row: {
          news_id: string
          person_id: string
          role: string | null
        }
        Insert: {
          news_id: string
          person_id: string
          role?: string | null
        }
        Update: {
          news_id?: string
          person_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_person_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_person_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      news_portal: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          url?: string | null
        }
        Relationships: []
      }
      news_product: {
        Row: {
          news_id: string
          product_id: string
        }
        Insert: {
          news_id: string
          product_id: string
        }
        Update: {
          news_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_product_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_product_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      news_stock: {
        Row: {
          news_id: string
          stock_id: string
        }
        Insert: {
          news_id: string
          stock_id: string
        }
        Update: {
          news_id?: string
          stock_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_stock_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_stock_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stock"
            referencedColumns: ["id"]
          },
        ]
      }
      person: {
        Row: {
          company_id: string | null
          created_at: string
          first_name: string
          full_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          first_name: string
          full_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          first_name?: string
          full_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          company_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          parent_product_id: string | null
          price: number | null
          primary_lists: number[] | null
          product_type_id: number | null
          sku: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          parent_product_id?: string | null
          price?: number | null
          primary_lists?: number[] | null
          product_type_id?: number | null
          sku?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          parent_product_id?: string | null
          price?: number | null
          primary_lists?: number[] | null
          product_type_id?: number | null
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_type"
            referencedColumns: ["id"]
          },
        ]
      }
      product_type: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      professional: {
        Row: {
          area: number | null
          created_at: string
          id: string
          person: string
          role: number | null
          seniority: string | null
          subarea: number | null
        }
        Insert: {
          area?: number | null
          created_at?: string
          id?: string
          person: string
          role?: number | null
          seniority?: string | null
          subarea?: number | null
        }
        Update: {
          area?: number | null
          created_at?: string
          id?: string
          person?: string
          role?: number | null
          seniority?: string | null
          subarea?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_area_fkey"
            columns: ["area"]
            isOneToOne: false
            referencedRelation: "job_area"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_person_fkey1"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "job_title"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_seniority_fkey"
            columns: ["seniority"]
            isOneToOne: false
            referencedRelation: "job_seniority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_subarea_fkey"
            columns: ["subarea"]
            isOneToOne: false
            referencedRelation: "job_subarea"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_onboarding: {
        Row: {
          company_name: string | null
          completed: boolean
          completed_at: string | null
          created_at: string | null
          department: string | null
          id: string
          objective: string | null
          profile_id: string
          tools: string[] | null
          use_case: string | null
        }
        Insert: {
          company_name?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          objective?: string | null
          profile_id: string
          tools?: string[] | null
          use_case?: string | null
        }
        Update: {
          company_name?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          objective?: string | null
          profile_id?: string
          tools?: string[] | null
          use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_onboarding_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          follower_count: number | null
          id: string
          metadata: Json | null
          platform: string
          profile_url: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          follower_count?: number | null
          id?: string
          metadata?: Json | null
          platform: string
          profile_url: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          follower_count?: number | null
          id?: string
          metadata?: Json | null
          platform?: string
          profile_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stock: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          exchange: string
          id: string
          metadata: Json | null
          stock_type: string
          ticker: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          exchange: string
          id?: string
          metadata?: Json | null
          stock_type: string
          ticker: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          exchange?: string
          id?: string
          metadata?: Json | null
          stock_type?: string
          ticker?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          stripe_subscription_id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status: string
          stripe_subscription_id: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          stripe_subscription_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tag: {
        Row: {
          description: string | null
          id: string
          metadata: Json | null
          name: string | null
          name_variations: string[] | null
          type: string
        }
        Insert: {
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          name_variations?: string[] | null
          type: string
        }
        Update: {
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          name_variations?: string[] | null
          type?: string
        }
        Relationships: []
      }
      team_billing: {
        Row: {
          billing_cycle_end: string
          billing_cycle_start: string
          credits_remaining: number
          credits_total: number
          current_plan: string
          id: string
          stripe_customer_id: string
          team_id: string | null
        }
        Insert: {
          billing_cycle_end: string
          billing_cycle_start: string
          credits_remaining?: number
          credits_total?: number
          current_plan: string
          id?: string
          stripe_customer_id: string
          team_id?: string | null
        }
        Update: {
          billing_cycle_end?: string
          billing_cycle_start?: string
          credits_remaining?: number
          credits_total?: number
          current_plan?: string
          id?: string
          stripe_customer_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_billing_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_company: {
        Row: {
          company_id: string
          team_id: string
        }
        Insert: {
          company_id: string
          team_id: string
        }
        Update: {
          company_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_company_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_credits: {
        Row: {
          credits: number
          team_id: string
          updated_at: string
        }
        Insert: {
          credits?: number
          team_id: string
          updated_at: string
        }
        Update: {
          credits?: number
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_credits_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_users: {
        Row: {
          created_at: string | null
          profile_id: string
          role: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          profile_id: string
          role?: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          profile_id?: string
          role?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_users_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          current_plan: string | null
          id: string
          name: string
          owner_id: string | null
          stripe_customer_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_plan?: string | null
          id?: string
          name: string
          owner_id?: string | null
          stripe_customer_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_plan?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_formacao: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_pt: string
          name_variations: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_pt: string
          name_variations?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_pt?: string
          name_variations?: string[] | null
        }
        Relationships: []
      }
      unlocked_data: {
        Row: {
          company_id: string | null
          credit_cost: number
          data_key: string
          entity_id: string | null
          entity_type: string | null
          id: string
          list_id: string | null
          profile_id: string | null
          unlocked_at: string | null
        }
        Insert: {
          company_id?: string | null
          credit_cost: number
          data_key: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          list_id?: string | null
          profile_id?: string | null
          unlocked_at?: string | null
        }
        Update: {
          company_id?: string | null
          credit_cost?: number
          data_key?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          list_id?: string | null
          profile_id?: string | null
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_data_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_data_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      url_content: {
        Row: {
          body: string | null
          content_hash: string | null
          created_at: string | null
          description: string | null
          domain_id: string
          html_content: string | null
          id: string
          language: string
          metadata: Json | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          title: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          body?: string | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          domain_id: string
          html_content?: string | null
          id?: string
          language: string
          metadata?: Json | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          title?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          body?: string | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          domain_id?: string
          html_content?: string | null
          id?: string
          language?: string
          metadata?: Json | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "url_content_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domain"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_items_to_list: {
        Args: {
          p_list_id: number
          p_entity_type: string
          p_entity_ids: string[]
        }
        Returns: undefined
      }
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      buscar_atributo_trabalho_similar: {
        Args: {
          texto: string
        }
        Returns: {
          id: string
          name: string
          name_variations: string[]
        }[]
      }
      complete_onboarding:
        | {
            Args: {
              p_user_id: string
              p_data: Json
            }
            Returns: Json
          }
        | {
            Args: {
              user_id: string
              team_name: string
            }
            Returns: undefined
          }
      count_companies_without_airtable: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_company_with_related: {
        Args: {
          p_company: Json
          p_main_site?: Json
          p_address?: Json
          p_social_networks?: Json
          p_contacts?: Json
          p_products?: Json
          p_jobboards?: Json
        }
        Returns: Json
      }
      create_job_with_address: {
        Args: {
          p_job: Json
          p_address: Json
        }
        Returns: Json
      }
      create_job_with_related_data: {
        Args: {
          job_data: Json
          address_data?: Json
          attribute_ids?: string[]
          benefit_ids?: string[]
        }
        Returns: string
      }
      create_subscription: {
        Args: {
          team_id: string
          plan: string
        }
        Returns: undefined
      }
      create_team_and_subscription: {
        Args: {
          p_user_id: string
          p_user_email: string
          p_user_name: string
        }
        Returns: Json
      }
      create_user_records: {
        Args: {
          user_id: string
          email: string
        }
        Returns: undefined
      }
      find_company_data:
        | {
            Args: {
              p_name?: string
              p_linkedin?: string
              p_domain?: string
            }
            Returns: {
              company_id: string
              company_name: string
              company_description: string
              address_id: string
              address_street: string
              address_city: string
              address_state: string
              address_country: string
              social_id: string
              social_platform: string
              social_profile_url: string
              jobboard_id: string
              jobboard_url: string
              stock_id: string
              stock_ticker: string
              stock_exchange: string
              funding_round_id: string
              funding_round_type: string
              funding_round_amount: number
              funding_round_date: string
              domain_id: string
              domain_url: string
              domain_is_main_site: boolean
            }[]
          }
        | {
            Args: {
              p_name?: string
              p_linkedin?: string
              p_domain?: string
              p_jobboard?: string
            }
            Returns: {
              company_id: string
              company_name: string
              company_description: string
              address_id: string
              address_street: string
              address_city: string
              address_state: string
              address_country: string
              social_id: string
              social_platform: string
              social_profile_url: string
              jobboard_id: string
              jobboard_url: string
              stock_id: string
              stock_ticker: string
              stock_exchange: string
              funding_round_id: string
              funding_round_type: string
              funding_round_amount: number
              funding_round_date: string
              domain_id: string
              domain_url: string
              domain_is_main_site: boolean
            }[]
          }
      find_seniority_by_variation: {
        Args: {
          search_term: string
        }
        Returns: string
      }
      get_all_job_fila_items: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          company_id: string
          url: string
          jobboard: string
          created_at: string
        }[]
      }
      get_companies_to_update:
        | {
            Args: {
              platform_filter: string
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              platform_filter: string
              limit_rows?: number
            }
            Returns: {
              id: string
              name: string
              employee_count: number
              description: string
              social: Json
            }[]
          }
      get_companies_with_active_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          company_name: string
          updated_at: string
        }[]
      }
      get_companies_with_domains: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          company_name: string
          company_updated_at: string
          domain_url: string
          domain_entity_type: string
          domain_is_main_site: boolean
          domain_domain_type: string
          domain_updated_at: string
        }[]
      }
      get_companies_with_domains_prod: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          company_name: string
          company_updated_at: string
          domain_url: string
          domain_entity_type: string
          domain_is_main_site: boolean
          domain_domain_type: string
          domain_updated_at: string
        }[]
      }
      get_companies_with_filters: {
        Args: {
          p_name?: string
          p_industry?: string
          p_sector?: string
          p_employee_count?: number
          p_business_model?: string
          p_company_type_id?: number
          p_page?: number
          p_limit?: number
        }
        Returns: Json
      }
      get_companies_with_url: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          company_name: string
          company_description: string
          company_updated_at: string
          url: string
        }[]
      }
      get_companies_with_url_v2: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          company_name: string
          company_description: string
          company_updated_at: string
          url: string
        }[]
      }
      get_companies_without_logos: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          domain_url: string
        }[]
      }
      get_company_benefits: {
        Args: {
          company_id_param: string
        }
        Returns: {
          benefit_type_id: string
          benefit_name: string
          benefit_description: string
          job_count: number
          jobs_with_benefit_percentage: number
          average_benefit_value: number
        }[]
      }
      get_company_customers: {
        Args: {
          p_company_id: string
        }
        Returns: {
          id: string
          name: string
          metadata: Json
          relationship_type: string
          created_at: string
        }[]
      }
      get_company_data_fields: {
        Args: {
          company_id: string
        }
        Returns: Json
      }
      get_company_details:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              company_id: string
              company_name: string
              company_description: string
              image_link_id: string
              image_id: string
              image_link_entity_type: string
              image_link_entity_id: string
              social_id: string
              social_platform: string
              social_profile_url: string
              social_follower_count: number
            }[]
          }
        | {
            Args: {
              p_company_id: string
            }
            Returns: {
              company_id: string
              name: string
              description: string
              founded_year: number
              country_code: string
              industry: string
              sector: string
              size: string
              employee_count: number
              business_model: string
              company_type_id: number
              parent_company_id: string
              name_variations: string[]
              main_domain: string
              logo_url: string
              social_links: Json
              job_count: number
            }[]
          }
      get_company_full_details: {
        Args: {
          p_company_id: string
        }
        Returns: Json
      }
      get_customer_list_by_company: {
        Args: {
          id_company: string
        }
        Returns: {
          id: number
          name: string
          list_type: string
          created_at: string
          public: boolean
          description: string
          metadata: Json
        }[]
      }
      get_enrich_external_by_entity: {
        Args: {
          p_entity_id: string
        }
        Returns: {
          provider: string
          data: Json
        }[]
      }
      get_image_links: {
        Args: {
          entity_id: string
        }
        Returns: Json
      }
      get_images_by_company: {
        Args: {
          company_id: string
        }
        Returns: {
          image_id: string
          url: string
          file_type: string
          file_size: number
          metadata: Json
        }[]
      }
      get_job_attribute_types: {
        Args: {
          input_job_id: string
        }
        Returns: {
          attribute_type_id: string
          attribute_name: string
          attribute_description: string
          attribute_type: string
          attribute_metadata: Json
        }[]
      }
      get_job_attributes: {
        Args: {
          input_job_id: string
        }
        Returns: {
          job_id: string
          attribute_name: string
          attribute_type: string
          attribute_value: string
        }[]
      }
      get_job_benefits: {
        Args: {
          input_job_id: string
        }
        Returns: {
          benefit_type_id: string
          benefit_name: string
          benefit_description: string
          benefit_metadata: Json
        }[]
      }
      get_job_subareas_with_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          subarea_id: number
          subarea_name: string
          job_count: number
        }[]
      }
      get_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          url: string
          short_url: string
          slug: string
          created_at: string
          updated_at: string
          status: boolean
        }[]
      }
      get_jobs_by_company: {
        Args: {
          company_id: string
        }
        Returns: {
          job_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        }[]
      }
      get_jobs_paginated: {
        Args: {
          p_page: number
          p_limit: number
          p_filters?: Json
        }
        Returns: Json
      }
      get_next_linkedin_social_item: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          profile_url: string
        }[]
      }
      get_oldest_job_fila_item: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          company_id: string
          url: string
          jobboard: string
          created_at: string
        }[]
      }
      get_random_domains: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          url: string
        }[]
      }
      get_random_linkedin_social_item: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          entity_type: string
          entity_id: string
          platform: string
          profile_url: string
          follower_count: number
          metadata: Json
          created_at: string
          updated_at: string
        }[]
      }
      get_seniority_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          seniority: string
          count: number
        }[]
      }
      get_social_details: {
        Args: {
          p_id: string
        }
        Returns: {
          entity_id: string
          metadata: Json
        }[]
      }
      get_social_metadata: {
        Args: {
          p_id: string
        }
        Returns: Json
      }
      get_team_billing_info: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      get_top_attributes: {
        Args: {
          area_id?: number
          subarea_id?: number
          job_title_id?: number
          seniority_id?: string
        }
        Returns: {
          attribute_id: string
          attribute_name: string
          attribute_description: string
          attribute_count: number
          attribute_category: string
          attribute_metadata: Json
          embedding: string
        }[]
      }
      get_top_attributes_by_area_subarea_seniority: {
        Args: {
          area_id: number
          subarea_id?: number
          seniority_id?: string
        }
        Returns: {
          attribute_id: string
          attribute_name: string
          attribute_description: string
          attribute_count: number
          attribute_category: string
          attribute_metadata: Json
          embedding: string
        }[]
      }
      get_top_attributes_by_company: {
        Args: {
          company_id: string
        }
        Returns: {
          attribute_name: string
          attribute_description: string
          attribute_count: number
          attribute_category: string
          attribute_metadata: Json
          embedding: string
        }[]
      }
      get_top_attributes_by_job_title_seniority: {
        Args: {
          job_title_id: number
          seniority_id?: string
        }
        Returns: {
          attribute_id: string
          attribute_name: string
          attribute_description: string
          attribute_count: number
          attribute_category: string
          attribute_metadata: Json
          embedding: string
        }[]
      }
      get_top_benefits_by_company: {
        Args: {
          company_id: string
        }
        Returns: {
          benefit_id: string
          benefit_name: string
          benefit_count: number
        }[]
      }
      get_top_job_areas_by_company: {
        Args: {
          company_uuid: string
        }
        Returns: {
          area_id: number
          area_name: string
          job_count: number
        }[]
      }
      get_top_job_attribute_types: {
        Args: {
          p_job_area_id?: number
          p_job_subarea_id?: number
        }
        Returns: {
          attribute_type_id: string
          attribute_type_name: string
          attribute_count: number
        }[]
      }
      get_top_job_subareas_by_company: {
        Args: {
          company_uuid: string
        }
        Returns: {
          subarea_id: number
          subarea_name: string
          job_count: number
        }[]
      }
      get_unmapped_seniorities: {
        Args: Record<PropertyKey, never>
        Returns: {
          seniority: string
          count: number
        }[]
      }
      get_user_status: {
        Args: {
          p_email: string
        }
        Returns: {
          is_completed: boolean
          current_step: number
          email: string
          user_id: string
        }[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      insert_job_address: {
        Args: {
          job_id: string
          address_data: Json
        }
        Returns: string
      }
      insert_job_attributes: {
        Args: {
          job_id: string
          attribute_ids: string[]
        }
        Returns: undefined
      }
      insert_job_base: {
        Args: {
          job_data: Json
        }
        Returns: string
      }
      insert_job_benefits: {
        Args: {
          job_id: string
          benefit_ids: string[]
        }
        Returns: undefined
      }
      insert_job_v2:
        | {
            Args: {
              p_job: Json
              p_address?: Json
            }
            Returns: Json
          }
        | {
            Args: {
              p_job: Json
              p_address?: Json
            }
            Returns: Json
          }
      insert_job_with_details: {
        Args: {
          p_input: Json
        }
        Returns: Json
      }
      insert_job_with_related_data: {
        Args: {
          job_data: Json
          address_data?: Json
          attribute_ids?: string[]
          benefit_ids?: string[]
        }
        Returns: string
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      list_job_attributes_count_by_company: {
        Args: {
          company_id_param: string
        }
        Returns: {
          attribute_name: string
          attribute_value: Json
          attribute_count: number
        }[]
      }
      list_job_benefits_count_by_company:
        | {
            Args: {
              company_id_param: string
            }
            Returns: {
              benefit_name: string
              benefit_count: number
            }[]
          }
        | {
            Args: {
              company_id_param: string
            }
            Returns: {
              benefit_name: string
              benefit_count: number
            }[]
          }
      match_attribute_type_text: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          name: string
          attribute_type_category_id: string
          similarity: number
        }[]
      }
      match_benefits: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          name: string
          similarity: number
        }[]
      }
      match_benefits_v2_text:
        | {
            Args: {
              query_embedding: string
              match_threshold?: number
              match_count?: number
            }
            Returns: {
              id: string
              name: string
              similarity: number
            }[]
          }
        | {
            Args: {
              query_embedding: string
              match_threshold?: number
              match_count?: number
            }
            Returns: {
              id: string
              name: string
              similarity: number
            }[]
          }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: string
          name: string
          description: string
          metadata: Json
          similarity: number
        }[]
      }
      match_job_titles_text:
        | {
            Args: {
              query_embedding: string
              match_threshold?: number
              match_count?: number
            }
            Returns: {
              id: number
              name: string
              similarity: number
            }[]
          }
        | {
            Args: {
              query_embedding: string
              match_threshold?: number
              match_count?: number
            }
            Returns: {
              id: number
              name: string
              similarity: number
            }[]
          }
      match_seniority: {
        Args: {
          search_term: string
          query_embedding: string
          match_threshold?: number
        }
        Returns: {
          id: string
          name: string
          similarity: number
        }[]
      }
      return_update_job: {
        Args: Record<PropertyKey, never>
        Returns: {
          job_id: string
          url: string
          short_url: string
          slug: string
          created_at: string
          updated_at: string
          status: boolean
        }[]
      }
      search_job_attribute_type:
        | {
            Args: {
              query_embedding: string
              match_count?: number
            }
            Returns: {
              id: string
              name: string
            }[]
          }
        | {
            Args: {
              search_text: string
              limit_results?: number
            }
            Returns: {
              id: string
              name: string
              name_variations: string[]
            }[]
          }
      search_job_attributes_simple: {
        Args: {
          query_text: string
          match_count?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          attribute_count: number
        }[]
      }
      search_job_benefit_types: {
        Args: {
          search_text: string
        }
        Returns: {
          id: string
          name: string
          description: string
        }[]
      }
      search_job_benefits:
        | {
            Args: {
              query_text: string
              query_embedding: string
              match_count?: number
              full_text_weight?: number
              semantic_weight?: number
            }
            Returns: {
              id: string
              name: string
              description: string
              benefit_count: number
              similarity: number
            }[]
          }
        | {
            Args: {
              search_text: string
            }
            Returns: {
              id: string
              name: string
              description: string
              count: number
            }[]
          }
      search_job_benefits_hybrid: {
        Args: {
          query_text: string
          match_count?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          name_variations: string
          benefit_count: number
          similarity: number
        }[]
      }
      search_job_benefits_simple: {
        Args: {
          query_text: string
          match_count?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          benefit_count: number
        }[]
      }
      search_job_titles: {
        Args: {
          search_text: string
        }
        Returns: {
          id: number
          name: string
        }[]
      }
      search_job_titles_advanced:
        | {
            Args: {
              search_text: string
              embedding_vector?: string
              similarity_threshold?: number
            }
            Returns: {
              id: number
              name: string
              similarity: number
              match_type: string
            }[]
          }
        | {
            Args: {
              search_text: string
              similarity_threshold?: number
            }
            Returns: {
              id: number
              name: string
              similarity: number
              match_type: string
            }[]
          }
      search_jobs_v2: {
        Args: {
          p_filters: Json
          p_page?: number
          p_limit?: number
        }
        Returns: Json
      }
      search_similar_job_titles: {
        Args: {
          search_text: string
        }
        Returns: {
          id: number
          name: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      update_company_jobs_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_onboarding_step: {
        Args: {
          p_profile_id: string
          p_current_step: number
          p_company_name?: string
          p_objective?: string
          p_tools?: string[]
        }
        Returns: undefined
      }
      update_social_metadata: {
        Args: {
          p_id: string
          p_metadata: Json
        }
        Returns: undefined
      }
      update_team_credits:
        | {
            Args: {
              p_user_id: string
              p_credits_used: number
              p_description: string
            }
            Returns: Json
          }
        | {
            Args: {
              team_id: string
              credits_to_deduct: number
            }
            Returns: undefined
          }
        | {
            Args: {
              team_id: string
              credits_to_deduct: number
              profile_id: string
              company_id: string
              description: string
            }
            Returns: undefined
          }
      use_credits: {
        Args: {
          p_team_id: string
          p_profile_id: string
          p_credits_used: number
          p_description: string
        }
        Returns: Json
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
