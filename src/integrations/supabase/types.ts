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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string
          id: string
          project_id: string
          prompt: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          prompt?: string | null
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          prompt?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          content: string
          created_at: string
          id: string
          idx: number
          project_id: string
          title: string
          updated_at: string
          word_count: number
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          idx?: number
          project_id: string
          title: string
          updated_at?: string
          word_count?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          idx?: number
          project_id?: string
          title?: string
          updated_at?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "chapters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          appearance: string | null
          backstory: string | null
          created_at: string
          goals: string | null
          id: string
          name: string
          notes: string | null
          project_id: string
          relationships: string | null
          role: string | null
        }
        Insert: {
          appearance?: string | null
          backstory?: string | null
          created_at?: string
          goals?: string | null
          id?: string
          name: string
          notes?: string | null
          project_id: string
          relationships?: string | null
          role?: string | null
        }
        Update: {
          appearance?: string | null
          backstory?: string | null
          created_at?: string
          goals?: string | null
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
          relationships?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_url: string
          format: string
          id: string
          metadata: Json | null
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number
          file_url?: string
          format: string
          id?: string
          metadata?: Json | null
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_url?: string
          format?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      print_credits: {
        Row: {
          expires_at: string
          id: string
          issued_at: string
          redeemed_order_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          expires_at: string
          id?: string
          issued_at?: string
          redeemed_order_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          issued_at?: string
          redeemed_order_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      print_orders: {
        Row: {
          created_at: string
          credit_redemption_id: string | null
          id: string
          project_id: string
          provider_order_id: string | null
          quote: Json | null
          spec: Json
          status: string
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_redemption_id?: string | null
          id?: string
          project_id: string
          provider_order_id?: string | null
          quote?: Json | null
          spec: Json
          status?: string
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_redemption_id?: string | null
          id?: string
          project_id?: string
          provider_order_id?: string | null
          quote?: Json | null
          spec?: Json
          status?: string
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_orders_project_id_fkey"
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
          created_at: string
          display_name: string | null
          id: string
          plan: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          plan?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          cover_image_url: string | null
          created_at: string
          genre: string | null
          goal_words: number | null
          id: string
          status: string | null
          synopsis: string | null
          template: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          genre?: string | null
          goal_words?: number | null
          id?: string
          status?: string | null
          synopsis?: string | null
          template?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          genre?: string | null
          goal_words?: number | null
          id?: string
          status?: string | null
          synopsis?: string | null
          template?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          plan: string
          provider: string | null
          status: string
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          plan?: string
          provider?: string | null
          status?: string
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          plan?: string
          provider?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_ai: {
        Row: {
          calls: number
          day: string
          id: string
          tokens: number
          user_id: string
        }
        Insert: {
          calls?: number
          day?: string
          id?: string
          tokens?: number
          user_id: string
        }
        Update: {
          calls?: number
          day?: string
          id?: string
          tokens?: number
          user_id?: string
        }
        Relationships: []
      }
      world_notes: {
        Row: {
          body: string | null
          created_at: string
          id: string
          project_id: string
          title: string
          type: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          project_id: string
          title: string
          type?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          project_id?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "world_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_owner: {
        Args: { pid: string; uid: string }
        Returns: boolean
      }
      word_count_of: {
        Args: { "": string }
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
    Enums: {},
  },
} as const
