import { NextRequest, NextResponse } from "next/server";
import { mapAppointmentFromApi, ApiAppointment } from "@/utils/mapAppointment";
import type { Appointment } from "@/types/appointment";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL||`http://127.0.0.1:8000/api`

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json(
            { message: "Unauthorized: missing token" },
            { status: 401 }
        );
    }

    try {
        // Get query parameters from the request
        const { searchParams } = new URL(req.url);
        const queryString = searchParams.toString();
        const url = `${API_BASE_URL}/doctor/appointments${queryString ? `?${queryString}` : ''}`;

        const res = await fetch(url, {
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
      message: data.message || data.error || "Failed to fetch appointments",
    },
    { status: res.status }
  );
}

const mapped: Appointment[] = (data.appointments as ApiAppointment[]).map(
  mapAppointmentFromApi
);



return NextResponse.json({ appointments: mapped }, { status: 200 });
    }
    
    catch (err: unknown) {
        console.error("Error in /doctor/appointments:", err);

        let message = "Internal server error";

        if (err instanceof Error) {
            message = err.message;
        }

        return NextResponse.json(
            { message },
            { status: 500 }
        );
    }
}
