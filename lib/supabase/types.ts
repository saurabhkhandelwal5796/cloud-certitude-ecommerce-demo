/**
 * Supabase Schema Types
 *
 * This file contains TypeScript definitions representing the database schema.
 * It is structured to match the output of the Supabase CLI generator.
 *
 * Update this file as the database schema evolves to maintain compile-time safety
 * across database queries, auth metadata, and storage structures.
 */

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
          created_at: string;
          updated_at: string | null;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "customer" | "admin";
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string | null;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin";
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin";
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          name: string;
          description: string | null;
          price: number;
          images: string[];
          category: string;
          stock: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name: string;
          description?: string | null;
          price: number;
          images?: string[];
          category: string;
          stock?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          images?: string[];
          category?: string;
          stock?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          user_id: string;
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          total_amount: number;
          shipping_address: Json | null;
          payment_intent_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          user_id: string;
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          total_amount: number;
          shipping_address?: Json | null;
          payment_intent_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          user_id?: string;
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          total_amount?: number;
          shipping_address?: Json | null;
          payment_intent_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
