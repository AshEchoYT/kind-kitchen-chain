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
      beggars: {
        Row: {
          city: string
          contact: string | null
          created_at: string
          id: string
          landmark: string | null
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          preferred_food_time: string | null
          street: string
          updated_at: string
        }
        Insert: {
          city: string
          contact?: string | null
          created_at?: string
          id?: string
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          preferred_food_time?: string | null
          street: string
          updated_at?: string
        }
        Update: {
          city?: string
          contact?: string | null
          created_at?: string
          id?: string
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          preferred_food_time?: string | null
          street?: string
          updated_at?: string
        }
        Relationships: []
      }
      collection_records: {
        Row: {
          assigned_agent_id: string | null
          created_at: string
          food_report_id: string
          hotel_id: string
          id: string
          notes: string | null
          pickup_timestamp: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string
          food_report_id: string
          hotel_id: string
          id?: string
          notes?: string | null
          pickup_timestamp?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string
          food_report_id?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          pickup_timestamp?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_records_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_records_food_report_id_fkey"
            columns: ["food_report_id"]
            isOneToOne: false
            referencedRelation: "food_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_records_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_agents: {
        Row: {
          area: string
          contact: string
          created_at: string
          date_of_birth: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          rating: number | null
          total_deliveries: number | null
          unique_id: string
          updated_at: string
          user_id: string
          zone: string
        }
        Insert: {
          area: string
          contact: string
          created_at?: string
          date_of_birth?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          rating?: number | null
          total_deliveries?: number | null
          unique_id: string
          updated_at?: string
          user_id: string
          zone: string
        }
        Update: {
          area?: string
          contact?: string
          created_at?: string
          date_of_birth?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          rating?: number | null
          total_deliveries?: number | null
          unique_id?: string
          updated_at?: string
          user_id?: string
          zone?: string
        }
        Relationships: []
      }
      distribution_records: {
        Row: {
          agent_id: string
          beggar_id: string
          created_at: string
          distribution_timestamp: string
          food_report_id: string
          id: string
          notes: string | null
          quantity_distributed: number
        }
        Insert: {
          agent_id: string
          beggar_id: string
          created_at?: string
          distribution_timestamp?: string
          food_report_id: string
          id?: string
          notes?: string | null
          quantity_distributed: number
        }
        Update: {
          agent_id?: string
          beggar_id?: string
          created_at?: string
          distribution_timestamp?: string
          food_report_id?: string
          id?: string
          notes?: string | null
          quantity_distributed?: number
        }
        Relationships: [
          {
            foreignKeyName: "distribution_records_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_records_beggar_id_fkey"
            columns: ["beggar_id"]
            isOneToOne: false
            referencedRelation: "beggars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_records_food_report_id_fkey"
            columns: ["food_report_id"]
            isOneToOne: false
            referencedRelation: "food_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      food_reports: {
        Row: {
          assigned_agent_id: string | null
          created_at: string
          description: string | null
          expiry_time: string | null
          food_name: string
          food_type: Database["public"]["Enums"]["food_type"]
          hotel_id: string
          id: string
          image_url: string | null
          pickup_time: string
          quantity: number
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string
          description?: string | null
          expiry_time?: string | null
          food_name: string
          food_type: Database["public"]["Enums"]["food_type"]
          hotel_id: string
          id?: string
          image_url?: string | null
          pickup_time: string
          quantity: number
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string
          description?: string | null
          expiry_time?: string | null
          food_name?: string
          food_type?: Database["public"]["Enums"]["food_type"]
          hotel_id?: string
          id?: string
          image_url?: string | null
          pickup_time?: string
          quantity?: number
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_reports_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_reports_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          city: string
          contact: string
          created_at: string
          id: string
          image_url: string | null
          landmark: string | null
          latitude: number | null
          longitude: number | null
          name: string
          rating: number | null
          street: string
          total_food_saved: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          contact: string
          created_at?: string
          id?: string
          image_url?: string | null
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          rating?: number | null
          street: string
          total_food_saved?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          contact?: string
          created_at?: string
          id?: string
          image_url?: string | null
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          rating?: number | null
          street?: string
          total_food_saved?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      food_type: "veg" | "non_veg" | "snacks" | "beverages" | "dairy" | "bakery"
      report_status: "new" | "assigned" | "picked" | "delivered" | "cancelled"
      user_role: "hotel" | "agent" | "admin"
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
      food_type: ["veg", "non_veg", "snacks", "beverages", "dairy", "bakery"],
      report_status: ["new", "assigned", "picked", "delivered", "cancelled"],
      user_role: ["hotel", "agent", "admin"],
    },
  },
} as const
