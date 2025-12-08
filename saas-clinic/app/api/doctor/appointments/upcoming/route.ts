import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `http://127.0.0.1:8000/api`;

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json(
            { message: "Unauthorized: missing token" },
            { status: 401 }
        );
    }

    try {
        const res = await fetch(`${API_BASE_URL}/doctor/appointments/upcoming`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: authHeader,
            },
            cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                {
                    message: data.message || data.error || "Failed to fetch upcoming appointments",
                },
                { status: res.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error("Error fetching upcoming appointments:", err);
        return NextResponse.json(
            {
                message:
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch upcoming appointments",
            },
            { status: 500 }
        );
    }
}
