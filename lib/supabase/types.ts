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
          name: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          role: "customer" | "admin";
          newsletter_subscribed: boolean | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string | null;
          email: string;
          name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          role?: "customer" | "admin";
          newsletter_subscribed?: boolean | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          email?: string;
          name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          role?: "customer" | "admin";
          newsletter_subscribed?: boolean | null;
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
          status: string;
          total_amount: number;
          shipping_address: Json | null;
          payment_intent_id: string | null;
          order_id: string | null;
          customer_email: string | null;
          customer_name: string | null;
          payment_method: string | null;
          items: Json | null;
          subtotal: number | null;
          tax: number | null;
          shipping: number | null;
          discount: number | null;
          grand_total: number | null;
          profile_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          user_id?: string;
          status?: string;
          total_amount?: number;
          shipping_address?: Json | null;
          payment_intent_id?: string | null;
          order_id?: string | null;
          customer_email?: string | null;
          customer_name?: string | null;
          payment_method?: string | null;
          items?: Json | null;
          subtotal?: number | null;
          tax?: number | null;
          shipping?: number | null;
          discount?: number | null;
          grand_total?: number | null;
          profile_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          user_id?: string;
          status?: string;
          total_amount?: number;
          shipping_address?: Json | null;
          payment_intent_id?: string | null;
          order_id?: string | null;
          customer_email?: string | null;
          customer_name?: string | null;
          payment_method?: string | null;
          items?: Json | null;
          subtotal?: number | null;
          tax?: number | null;
          shipping?: number | null;
          discount?: number | null;
          grand_total?: number | null;
          profile_id?: string | null;
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
      reviews: {
        Row: {
          id: string;
          product_id: string;
          customer_email: string;
          customer_name: string;
          rating: number;
          review_text: string;
          is_verified_purchase: boolean | null;
          created_at: string | null;
          title: string | null;
          helpful_count: number | null;
          reported: boolean | null;
          helpful_user_emails: string[] | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          customer_email: string;
          customer_name: string;
          rating: number;
          review_text: string;
          is_verified_purchase?: boolean | null;
          created_at?: string | null;
          title?: string | null;
          helpful_count?: number | null;
          reported?: boolean | null;
          helpful_user_emails?: string[] | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          customer_email?: string;
          customer_name?: string;
          rating?: number;
          review_text?: string;
          is_verified_purchase?: boolean | null;
          created_at?: string | null;
          title?: string | null;
          helpful_count?: number | null;
          reported?: boolean | null;
          helpful_user_emails?: string[] | null;
        };
        Relationships: [];
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
