const headers = { "Cache-Control": "no-store" };

export function GET() {
  return Response.json({ status: "ok" }, { headers });
}

export function HEAD() {
  return new Response(null, { status: 204, headers });
}
