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
        const res = await fetch(`${API_BASE_URL}/doctor/appointments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: authHeader,
            },
            cache: "no-store",
        });

const data = await res.json();

console.log("RAW API /doctor/appointments =>", data); // <== مهم

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

console.log("MAPPED appointments =>", mapped); // <== كمان مهم

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
