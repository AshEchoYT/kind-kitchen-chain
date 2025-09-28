export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
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
      food_reports: {
        Row: {
          assigned_agent_id: string | null
          created_at: string
          description: string | null
          expiry_time: string | null
          food_name: string
          food_type: "veg" | "non_veg" | "snacks" | "beverages" | "dairy" | "bakery"
          hotel_id: string
          id: string
          image_url: string | null
          pickup_time: string
          quantity: number
          status: "new" | "assigned" | "picked" | "delivered" | "cancelled" | null
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string
          description?: string | null
          expiry_time?: string | null
          food_name: string
          food_type: "veg" | "non_veg" | "snacks" | "beverages" | "dairy" | "bakery"
          hotel_id: string
          id?: string
          image_url?: string | null
          pickup_time: string
          quantity: number
          status?: "new" | "assigned" | "picked" | "delivered" | "cancelled" | null
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string
          description?: string | null
          expiry_time?: string | null
          food_name?: string
          food_type?: "veg" | "non_veg" | "snacks" | "beverages" | "dairy" | "bakery"
          hotel_id?: string
          id?: string
          image_url?: string | null
          pickup_time?: string
          quantity?: number
          status?: "new" | "assigned" | "picked" | "delivered" | "cancelled" | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_reports_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
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
          role: "hotel" | "agent" | "admin"
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
          role?: "hotel" | "agent" | "admin"
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
          role?: "hotel" | "agent" | "admin"
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
      [_ in never]: never
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

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]