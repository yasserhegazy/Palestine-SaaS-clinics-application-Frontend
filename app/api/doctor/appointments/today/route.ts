import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || `http://127.0.0.1:8000/api`;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized: missing token" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${API_BASE_URL}/doctor/appointments/today`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          message:
            data.message ||
            data.error ||
            "Failed to fetch today's appointments",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("Error in /api/doctor/appointments/today:", err);

    let message = "Internal server error";
    if (err instanceof Error) message = err.message;

    return NextResponse.json({ message }, { status: 500 });
  }
}
