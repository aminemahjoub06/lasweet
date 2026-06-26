import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const authSchema = z.object({ password: z.string().min(1).max(200) });

export const listAdminOrders = createServerFn({ method: "POST" })
  .inputValidator((input) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
    if (!expected || data.password !== expected) {
      throw new Error("Invalid admin password.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_email, customer_phone, business, delivery_method, delivery_address, delivery_date, order_type, notes, items, subtotal, delivery_fee, total, payment_method, payment_status, payment_plan, amount_paid_online, balance_due_cash, balance_collected_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { orders: rows ?? [] };
  });