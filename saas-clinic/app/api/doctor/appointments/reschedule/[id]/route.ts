import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function PUT(
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
    const { appointment_date, appointment_time } = body;

    if (!appointment_date || !appointment_time) {
      return NextResponse.json(
        {
          message: "Both appointment_date and appointment_time are required",
        },
        { status: 422 }
      );
    }

    const res = await fetch(
      `${API_BASE_URL}/doctor/appointments/reschedule/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          appointment_date,
          appointment_time,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          message:
            data.message || data.error || "Failed to reschedule appointment",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("Error in /api/doctor/appointments/reschedule/[id]:", err);

    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
