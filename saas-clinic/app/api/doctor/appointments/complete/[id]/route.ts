import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || `http://127.0.0.1:8000/api`;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized: missing token" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch(
      `${API_BASE_URL}/doctor/appointments/${id}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          message:
            data.message || data.error || "Failed to complete appointment",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("Error in /api/doctor/appointments/complete/[id]:", err);

    let message = "Internal server error";
    if (err instanceof Error) message = err.message;

    return NextResponse.json({ message }, { status: 500 });
  }
}
