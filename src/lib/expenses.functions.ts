import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getExpenses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const startedAt = Date.now();
    const userId = context.userId ?? "unknown";
    console.info(`[getExpenses] start user=${userId}`);
    try {
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
