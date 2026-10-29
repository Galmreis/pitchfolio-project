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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      pitch_decks: {
        Row: {
          created_at: string
          id: string
          pdf_export_url: string | null
          portfolio_id: string
          slide_1_who_i_am: Json
          slide_2_what_i_did: Json
          slide_3_skills: Json
          slide_4_highlight: Json
          slide_5_contact: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pdf_export_url?: string | null
          portfolio_id: string
          slide_1_who_i_am: Json
          slide_2_what_i_did: Json
          slide_3_skills: Json
          slide_4_highlight: Json
          slide_5_contact: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pdf_export_url?: string | null
          portfolio_id?: string
          slide_1_who_i_am?: Json
          slide_2_what_i_did?: Json
          slide_3_skills?: Json
          slide_4_highlight?: Json
          slide_5_contact?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitch_decks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pitch_decks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          about_me: string
          created_at: string
          data: Json
          experience: Json
          id: string
          input_method: Database["public"]["Enums"]["portfolio_input_method"]
          is_published: boolean
          name: string
          photo_url: string | null
          selected_theme: Database["public"]["Enums"]["portfolio_theme"]
          slug: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          about_me?: string
          created_at?: string
          data: Json
          experience?: Json
          id?: string
          input_method?: Database["public"]["Enums"]["portfolio_input_method"]
          is_published?: boolean
          name?: string
          photo_url?: string | null
          selected_theme?: Database["public"]["Enums"]["portfolio_theme"]
          slug: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          about_me?: string
          created_at?: string
          data?: Json
          experience?: Json
          id?: string
          input_method?: Database["public"]["Enums"]["portfolio_input_method"]
          is_published?: boolean
          name?: string
          photo_url?: string | null
          selected_theme?: Database["public"]["Enums"]["portfolio_theme"]
          slug?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_profile_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_timeline: {
        Row: {
          created_at: string
          description: string
          display_order: number
          end_date: string | null
          id: string
          is_current: boolean
          is_visible: boolean
          organization: string
          portfolio_id: string
          role: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          end_date?: string | null
          id?: string
          is_current?: boolean
          is_visible?: boolean
          organization?: string
          portfolio_id: string
          role: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          end_date?: string | null
          id?: string
          is_current?: boolean
          is_visible?: boolean
          organization?: string
          portfolio_id?: string
          role?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_timeline_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          full_name: string
          github_url: string | null
          id: string
          last_name: string
          linkedin_url: string | null
          phone_number: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          full_name?: string
          github_url?: string | null
          id: string
          last_name?: string
          linkedin_url?: string | null
          phone_number?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          full_name?: string
          github_url?: string | null
          id?: string
          last_name?: string
          linkedin_url?: string | null
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_windows: {
        Row: {
          scope: string
          used: number
          window_start: string
        }
        Insert: {
          scope: string
          used?: number
          window_start: string
        }
        Update: {
          scope?: string
          used?: number
          window_start?: string
        }
        Relationships: []
      }
      user_certifications: {
        Row: {
          created_at: string
          credential: string | null
          display_order: number
          id: string
          is_visible: boolean
          issue_date: string | null
          issuer: string
          portfolio_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          issue_date?: string | null
          issuer?: string
          portfolio_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          issue_date?: string | null
          issuer?: string
          portfolio_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_certifications_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string
          deploy_url: string | null
          description: string
          display_order: number
          id: string
          is_highlight: boolean
          is_visible: boolean
          name: string
          portfolio_id: string
          repository_url: string | null
          stars: number
          technologies: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deploy_url?: string | null
          description?: string
          display_order?: number
          id?: string
          is_highlight?: boolean
          is_visible?: boolean
          name: string
          portfolio_id: string
          repository_url?: string | null
          stars?: number
          technologies?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deploy_url?: string | null
          description?: string
          display_order?: number
          id?: string
          is_highlight?: boolean
          is_visible?: boolean
          name?: string
          portfolio_id?: string
          repository_url?: string | null
          stars?: number
          technologies?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          name: string
          portfolio_id: string
          source: Database["public"]["Enums"]["skill_source"]
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          name: string
          portfolio_id: string
          source?: Database["public"]["Enums"]["skill_source"]
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          name?: string
          portfolio_id?: string
          source?: Database["public"]["Enums"]["skill_source"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_portfolio_curation: {
        Args: { p_items: Json; p_portfolio_id: string }
        Returns: number
      }
      consume_pitchfolio_budget: { Args: { p_kind: string }; Returns: boolean }
      publish_pitchfolio_draft: {
        Args: {
          p_data: Json
          p_input_method?: Database["public"]["Enums"]["portfolio_input_method"]
          p_photo_url?: string
          p_slug?: string
          p_theme: Database["public"]["Enums"]["portfolio_theme"]
        }
        Returns: {
          portfolio_id: string
          slug: string
        }[]
      }
    }
    Enums: {
      portfolio_input_method:
        | "pdf_upload"
        | "linkedin_text"
        | "guided_questions"
      portfolio_theme: "moderno" | "quente" | "minimal"
      skill_category: "hard_skill" | "soft_skill" | "tool" | "language"
      skill_source: "github" | "linkedin" | "manual"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      portfolio_input_method: [
        "pdf_upload",
        "linkedin_text",
        "guided_questions",
      ],
      portfolio_theme: ["moderno", "quente", "minimal"],
      skill_category: ["hard_skill", "soft_skill", "tool", "language"],
      skill_source: ["github", "linkedin", "manual"],
    },
  },
} as const
