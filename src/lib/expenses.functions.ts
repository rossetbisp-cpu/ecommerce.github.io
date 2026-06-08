import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getExpenses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const startedAt = Date.now();
    const userId = context.userId ?? "unknown";
    console.info(`[getExpenses] start user=${userId}`);
    try {
      // Dev-only: force a simulated Supabase-like failure to validate the error UI.
      if (process.env.NODE_ENV !== "production" && process.env.SIMULATE_GET_EXPENSES_ERROR === "1") {
        const simulated = {
          code: "SIMULATED_42501",
          message: "permission denied for table expenses (simulated)",
          details: "Simulated failure triggered by SIMULATE_GET_EXPENSES_ERROR=1",
          hint: "Unset SIMULATE_GET_EXPENSES_ERROR to restore normal behavior",
        };
        console.error(
          `[getExpenses] simulated error user=${userId} code=${simulated.code} message=${simulated.message} details=${simulated.details} hint=${simulated.hint}`,
        );
        const err = new Error(`getExpenses failed: ${simulated.message}`) as Error & {
          code?: string;
          details?: string;
          hint?: string;
        };
        err.code = simulated.code;
        err.details = simulated.details;
        err.hint = simulated.hint;
        throw err;
      }
      const { supabase } = context;
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false })
        .limit(5000);

      if (error) {
        console.error(
          `[getExpenses] supabase error user=${userId} code=${error.code ?? "n/a"} message=${error.message} details=${error.details ?? "n/a"} hint=${error.hint ?? "n/a"}`,
        );
        throw new Error(`getExpenses failed: ${error.message}`);
      }

      const rows = data ?? [];
      console.info(
        `[getExpenses] ok user=${userId} rows=${rows.length} ms=${Date.now() - startedAt}`,
      );
      return rows;
    } catch (err) {
      console.error(
        `[getExpenses] unhandled user=${userId} ms=${Date.now() - startedAt}`,
        err,
      );
      throw err;
    }
  });
