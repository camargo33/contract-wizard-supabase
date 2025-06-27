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
      analises: {
        Row: {
          arquivo_nome: string
          created_at: string
          id: string
          status: string
          tempo_processamento: number | null
          total_erros: number | null
        }
        Insert: {
          arquivo_nome: string
          created_at?: string
          id?: string
          status?: string
          tempo_processamento?: number | null
          total_erros?: number | null
        }
        Update: {
          arquivo_nome?: string
          created_at?: string
          id?: string
          status?: string
          tempo_processamento?: number | null
          total_erros?: number | null
        }
        Relationships: []
      }
      analysis_history: {
        Row: {
          analysis_content: Json
          analysis_duration_ms: number | null
          analysis_timestamp: string
          analyzed_filename: string
          base_contracts_used: string[] | null
          created_at: string
          errors_found: number | null
          id: string
          openai_tokens_used: number | null
          user_id: string
        }
        Insert: {
          analysis_content: Json
          analysis_duration_ms?: number | null
          analysis_timestamp?: string
          analyzed_filename: string
          base_contracts_used?: string[] | null
          created_at?: string
          errors_found?: number | null
          id?: string
          openai_tokens_used?: number | null
          user_id: string
        }
        Update: {
          analysis_content?: Json
          analysis_duration_ms?: number | null
          analysis_timestamp?: string
          analyzed_filename?: string
          base_contracts_used?: string[] | null
          created_at?: string
          errors_found?: number | null
          id?: string
          openai_tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      base_contracts: {
        Row: {
          contract_type: string | null
          created_at: string
          file_path: string | null
          id: string
          is_processed: boolean | null
          name: string
          original_filename: string
          plan_name: string | null
          processed_at: string | null
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          contract_type?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          is_processed?: boolean | null
          name: string
          original_filename: string
          plan_name?: string | null
          processed_at?: string | null
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          contract_type?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          is_processed?: boolean | null
          name?: string
          original_filename?: string
          plan_name?: string | null
          processed_at?: string | null
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      campos_extraidos: {
        Row: {
          analise_id: string
          campos_identificados: Json | null
          created_at: string
          id: string
          pagina_numero: number
          texto_bruto: string | null
        }
        Insert: {
          analise_id: string
          campos_identificados?: Json | null
          created_at?: string
          id?: string
          pagina_numero: number
          texto_bruto?: string | null
        }
        Update: {
          analise_id?: string
          campos_identificados?: Json | null
          created_at?: string
          id?: string
          pagina_numero?: number
          texto_bruto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campos_extraidos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_clauses: {
        Row: {
          base_contract_id: string
          clause_content: string
          clause_title: string | null
          clause_type: string
          created_at: string
          id: string
          is_standard: boolean | null
          section_number: string | null
        }
        Insert: {
          base_contract_id: string
          clause_content: string
          clause_title?: string | null
          clause_type: string
          created_at?: string
          id?: string
          is_standard?: boolean | null
          section_number?: string | null
        }
        Update: {
          base_contract_id?: string
          clause_content?: string
          clause_title?: string | null
          clause_type?: string
          created_at?: string
          id?: string
          is_standard?: boolean | null
          section_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_clauses_base_contract_id_fkey"
            columns: ["base_contract_id"]
            isOneToOne: false
            referencedRelation: "base_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          contract_type: string
          created_at: string
          equipment_info: Json | null
          id: string
          is_active: boolean | null
          name: string
          plan_name: string | null
          pricing_info: Json | null
          standard_clauses: Json | null
          terms_info: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_type: string
          created_at?: string
          equipment_info?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          plan_name?: string | null
          pricing_info?: Json | null
          standard_clauses?: Json | null
          terms_info?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_type?: string
          created_at?: string
          equipment_info?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          plan_name?: string | null
          pricing_info?: Json | null
          standard_clauses?: Json | null
          terms_info?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contratos_modelo: {
        Row: {
          campos_obrigatorios: Json | null
          created_at: string
          id: string
          nome: string
          regras_validacao: Json | null
          template_ativo: boolean
        }
        Insert: {
          campos_obrigatorios?: Json | null
          created_at?: string
          id?: string
          nome: string
          regras_validacao?: Json | null
          template_ativo?: boolean
        }
        Update: {
          campos_obrigatorios?: Json | null
          created_at?: string
          id?: string
          nome?: string
          regras_validacao?: Json | null
          template_ativo?: boolean
        }
        Relationships: []
      }
      erros_detectados: {
        Row: {
          analise_id: string
          campo_afetado: string
          confianca: number
          created_at: string
          id: string
          severidade: string
          sugestao_correcao: string | null
          tipo_erro: string
          valor_encontrado: string | null
          valor_esperado: string | null
        }
        Insert: {
          analise_id: string
          campo_afetado: string
          confianca: number
          created_at?: string
          id?: string
          severidade: string
          sugestao_correcao?: string | null
          tipo_erro: string
          valor_encontrado?: string | null
          valor_esperado?: string | null
        }
        Update: {
          analise_id?: string
          campo_afetado?: string
          confianca?: number
          created_at?: string
          id?: string
          severidade?: string
          sugestao_correcao?: string | null
          tipo_erro?: string
          valor_encontrado?: string | null
          valor_esperado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erros_detectados_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
