function json(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(payload), {
    ...init,
    headers,
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
    },
  });
}

export async function onRequestPost(context) {
  const supabaseUrl = context.env.SUPABASE_URL;
  const serviceRoleKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = context.env.SUPABASE_BUCKET || "portfolio-assets";
  const uploadPath = context.env.SUPABASE_RESUME_PATH || "resume/current.jpg";

  if (!supabaseUrl || !serviceRoleKey) {
    return json(
      { error: "Missing Supabase server configuration" },
      { status: 500 }
    );
  }

  const request = context.request;
  const contentType =
    request.headers.get("content-type") || "application/octet-stream";
  try {
    const fileBuffer = await request.arrayBuffer();
    if (!fileBuffer.byteLength) {
      return json({ error: "Empty upload" }, { status: 400 });
    }

    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${uploadPath}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return json(
        {
          error: "Upload to Supabase failed",
          detail: errorText,
        },
        { status: 500 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${uploadPath}`;
    return json({ publicUrl }, { status: 200 });
  } catch (error) {
    return json(
      {
        error: "Unexpected upload error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
