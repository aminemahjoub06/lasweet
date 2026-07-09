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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_stock: {
        Row: {
          delivery_date: string
          initial_units: number
          product_key: string
          units_remaining: number
          updated_at: string
        }
        Insert: {
          delivery_date: string
          initial_units?: number
          product_key: string
          units_remaining?: number
          updated_at?: string
        }
        Update: {
          delivery_date?: string
          initial_units?: number
          product_key?: string
          units_remaining?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      geocoding_cache: {
        Row: {
          address: string
          created_at: string
          lat: number
          lng: number
          provider: string
          raw: Json | null
        }
        Insert: {
          address: string
          created_at?: string
          lat: number
          lng: number
          provider?: string
          raw?: Json | null
        }
        Update: {
          address?: string
          created_at?: string
          lat?: number
          lng?: number
          provider?: string
          raw?: Json | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_paid_online: number
          balance_collected_at: string | null
          balance_due_cash: number
          business: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_date: string | null
          delivery_distance_km: number | null
          delivery_fee: number
          delivery_lat: number | null
          delivery_lng: number | null
          delivery_method: string
          delivery_time: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          order_type: string | null
          payment_method: string
          payment_plan: string
          payment_status: string
          pending_delivery_quote: boolean
          refunded_amount: number
          refunded_at: string | null
          stripe_session_id: string | null
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid_online?: number
          balance_collected_at?: string | null
          balance_due_cash?: number
          business?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_distance_km?: number | null
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_method: string
          delivery_time?: string | null
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          order_type?: string | null
          payment_method: string
          payment_plan?: string
          payment_status?: string
          pending_delivery_quote?: boolean
          refunded_amount?: number
          refunded_at?: string | null
          stripe_session_id?: string | null
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          amount_paid_online?: number
          balance_collected_at?: string | null
          balance_due_cash?: number
          business?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_distance_km?: number | null
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_method?: string
          delivery_time?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          order_type?: string | null
          payment_method?: string
          payment_plan?: string
          payment_status?: string
          pending_delivery_quote?: boolean
          refunded_amount?: number
          refunded_at?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      pending_cleanup_log: {
        Row: {
          id: string
          notes: string | null
          rows_recovered: number
          rows_updated: number
          run_at: string
        }
        Insert: {
          id?: string
          notes?: string | null
          rows_recovered?: number
          rows_updated?: number
          run_at?: string
        }
        Update: {
          id?: string
          notes?: string | null
          rows_recovered?: number
          rows_updated?: number
          run_at?: string
        }
        Relationships: []
      }
      rate_limit_allowlist: {
        Row: {
          created_at: string
          id: string
          kind: string
          note: string | null
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          note?: string | null
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          value?: string
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          scope: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          scope: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          scope?: string
        }
        Relationships: []
      }
      rate_limit_log: {
        Row: {
          created_at: string
          email: string | null
          email_count: number | null
          endpoint: string
          id: string
          ip: string | null
          ip_count: number | null
          reason: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_count?: number | null
          endpoint: string
          id?: string
          ip?: string | null
          ip_count?: number | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string | null
          email_count?: number | null
          endpoint?: string
          id?: string
          ip?: string | null
          ip_count?: number | null
          reason?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_daily_stock: {
        Args: {
          p_default_units?: number
          p_delivery_date: string
          p_product_key: string
          p_qty: number
        }
        Returns: number
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_or_init_daily_stock: {
        Args: {
          p_default_units?: number
          p_delivery_date: string
          p_product_key: string
        }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      restore_daily_stock: {
        Args: { p_delivery_date: string; p_product_key: string; p_qty: number }
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
