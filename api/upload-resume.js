export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRequestBuffer(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function json(response, statusCode, payload) {
  response.status(statusCode).setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || "portfolio-assets";
  const uploadPath = process.env.SUPABASE_RESUME_PATH || "resume/current.jpg";

  if (!supabaseUrl || !serviceRoleKey) {
    return json(response, 500, { error: "Missing Supabase server configuration" });
  }

  const contentType = request.headers["content-type"] || "application/octet-stream";
  const contentLength = Number(request.headers["content-length"] || 0);

  if (!contentLength) {
    return json(response, 400, { error: "Empty upload" });
  }

  try {
    const fileBuffer = await readRequestBuffer(request);
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
      return json(response, 500, {
        error: "Upload to Supabase failed",
        detail: errorText,
      });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${uploadPath}`;
    return json(response, 200, { publicUrl });
  } catch (error) {
    return json(response, 500, {
      error: "Unexpected upload error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
