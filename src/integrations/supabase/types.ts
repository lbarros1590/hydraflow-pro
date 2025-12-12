export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      available_states: {
        Row: {
          code: string
          is_active: boolean | null
          name: string
          regulations_version: string | null
        }
        Insert: {
          code: string
          is_active?: boolean | null
          name: string
          regulations_version?: string | null
        }
        Update: {
          code?: string
          is_active?: boolean | null
          name?: string
          regulations_version?: string | null
        }
        Relationships: []
      }
      emergency_exit_calculations: {
        Row: {
          buildings: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          project_id: string
          results: Json | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          buildings?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          project_id: string
          results?: Json | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          buildings?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          project_id?: string
          results?: Json | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_exit_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hydraulic_calculations: {
        Row: {
          accessories: Json | null
          connections: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          network_data: Json | null
          project_id: string
          report_data: Json | null
          results: Json | null
          version: number | null
        }
        Insert: {
          accessories?: Json | null
          connections?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          network_data?: Json | null
          project_id: string
          report_data?: Json | null
          results?: Json | null
          version?: number | null
        }
        Update: {
          accessories?: Json | null
          connections?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          network_data?: Json | null
          project_id?: string
          report_data?: Json | null
          results?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hydraulic_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          crea_number: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_state: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          crea_number?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_state?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          crea_number?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string | null
          description: string | null
          file_category: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          metadata: Json | null
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_category?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          metadata?: Json | null
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_category?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reviews: {
        Row: {
          comment: string
          created_at: string | null
          file_id: string | null
          id: string
          page_number: number | null
          position_x: number | null
          position_y: number | null
          priority: string | null
          project_id: string
          resolved_at: string | null
          resolved_by: string | null
          reviewer_id: string
          status: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          file_id?: string | null
          id?: string
          page_number?: number | null
          position_x?: number | null
          position_y?: number | null
          priority?: string | null
          project_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          reviewer_id: string
          status?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          file_id?: string | null
          id?: string
          page_number?: number | null
          position_x?: number | null
          position_y?: number | null
          priority?: string | null
          project_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          reviewer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_reviews_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "project_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_shares: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          owner_id: string
          permission: string | null
          project_id: string
          shared_with_email: string
          shared_with_user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          owner_id: string
          permission?: string | null
          project_id: string
          shared_with_email: string
          shared_with_user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string
          permission?: string | null
          project_id?: string
          shared_with_email?: string
          shared_with_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_shares_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          risk_class: string
          state_code: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          risk_class?: string
          state_code?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          risk_class?: string
          state_code?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "available_states"
            referencedColumns: ["code"]
          },
        ]
      }
      regulation_activities: {
        Row: {
          code: string
          created_at: string | null
          description: string
          fire_load_unit: string
          fire_load_value: number
          id: string
          is_risk_determinant: boolean
          occupancy_division: string
          occupancy_group: string
          state_iso: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description: string
          fire_load_unit?: string
          fire_load_value: number
          id?: string
          is_risk_determinant?: boolean
          occupancy_division: string
          occupancy_group: string
          state_iso?: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string
          fire_load_unit?: string
          fire_load_value?: number
          id?: string
          is_risk_determinant?: boolean
          occupancy_division?: string
          occupancy_group?: string
          state_iso?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      separation_calculations: {
        Row: {
          buildings: Json | null
          calculations: Json | null
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          project_id: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          buildings?: Json | null
          calculations?: Json | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          project_id: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          buildings?: Json | null
          calculations?: Json | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          project_id?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "separation_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      state_regulations: {
        Row: {
          category: string | null
          code: string
          content_text: string | null
          created_at: string | null
          description: string | null
          effective_date: string | null
          file_url: string | null
          id: string
          state_code: string
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category?: string | null
          code: string
          content_text?: string | null
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          file_url?: string | null
          id?: string
          state_code: string
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          content_text?: string | null
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          file_url?: string | null
          id?: string
          state_code?: string
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "state_regulations_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "available_states"
            referencedColumns: ["code"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
