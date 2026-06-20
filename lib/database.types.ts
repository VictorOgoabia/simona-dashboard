// Hand-maintained to mirror supabase/migrations (0001 + 0002).
// Regenerate later with: supabase gen types typescript --project-id <ref> > lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string | null;
          location: string | null;
          tag: string | null;
          notes: string | null;
          fit_notes: string | null;
          uk_size: string | null;
          height_cm: string | null;
          bust_in: string | null;
          waist_in: string | null;
          hip_in: string | null;
          high_hip_in: string | null;
          shoulder_in: string | null;
          sleeve_in: string | null;
          back_in: string | null;
          torso_in: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          email?: string | null;
          location?: string | null;
          tag?: string | null;
          notes?: string | null;
          fit_notes?: string | null;
          uk_size?: string | null;
          height_cm?: string | null;
          bust_in?: string | null;
          waist_in?: string | null;
          hip_in?: string | null;
          high_hip_in?: string | null;
          shoulder_in?: string | null;
          sleeve_in?: string | null;
          back_in?: string | null;
          torso_in?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_code: string | null;
          client_name: string;
          order_type: string | null;
          item: string;
          collection: string | null;
          amount: number | null;
          payment_status: string | null;
          order_date: string | null;
          due_date: string | null;
          status: string;
          assigned_to: string | null;
          notes: string | null;
          qc_note: string | null;
          ops_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_code?: string | null;
          client_name: string;
          order_type?: string | null;
          item: string;
          collection?: string | null;
          amount?: number | null;
          payment_status?: string | null;
          order_date?: string | null;
          due_date?: string | null;
          status?: string;
          assigned_to?: string | null;
          notes?: string | null;
          qc_note?: string | null;
          ops_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          task: string;
          due_date: string | null;
          pillar: string | null;
          assigned_to: string | null;
          priority: string | null;
          done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task: string;
          due_date?: string | null;
          pillar?: string | null;
          assigned_to?: string | null;
          priority?: string | null;
          done?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      orders_safe: {
        Row: {
          id: string | null;
          order_code: string | null;
          client_name: string | null;
          order_type: string | null;
          item: string | null;
          collection: string | null;
          amount: number | null;
          payment_status: string | null;
          order_date: string | null;
          due_date: string | null;
          status: string | null;
          assigned_to: string | null;
          notes: string | null;
          qc_note: string | null;
          ops_note: string | null;
          created_at: string | null;
        };
      };
    };
    Functions: {
      get_my_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
