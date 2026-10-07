import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(url, serviceKey);

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data, error: userError } = await admin.auth.getUser(token);
    if (userError || !data.user) {
      console.error("getUser failed:", userError?.message, userError?.status);
      return json(
        { error: "Unauthorized", detail: userError?.message ?? "no user" },
        401,
      );
    }
    const user = data.user;

    const bucket = admin.storage.from("avatars");
    const { data: files, error: listError } = await bucket.list(user.id, {
      limit: 1000,
    });
    if (listError) {
      return json({ error: `Storage list failed: ${listError.message}` }, 500);
    }

    if (files && files.length > 0) {
      const paths = files.map((f) => `${user.id}/${f.name}`);
      const { error: removeError } = await bucket.remove(paths);
      if (removeError) {
        return json(
          { error: `Storage remove failed: ${removeError.message}` },
          500,
        );
      }
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return json({ error: `User delete failed: ${deleteError.message}` }, 500);
    }

    return json({ success: true });
  } catch (err) {
    console.error("delete-account crashed:", err);
    return json({ error: String(err) }, 500);
  }
});
