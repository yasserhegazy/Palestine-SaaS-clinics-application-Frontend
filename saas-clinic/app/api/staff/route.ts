import { NextResponse } from 'next/server';

// Mock Data
let staffList = [
  {
    id: 1,
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@clinic.com",
    phone: "+1 (555) 123-4567",
    role: "Doctor",
    status: "Active",
    specialization: "Cardiology",
    workingHours: "Mon-Fri, 9:00 AM - 5:00 PM"
  },
  {
    id: 2,
    name: "John Doe",
    email: "john.doe@clinic.com",
    phone: "+1 (555) 987-6543",
    role: "Secretary",
    status: "Active"
  },
  {
    id: 3,
    name: "Dr. Emily Chen",
    email: "emily.chen@clinic.com",
    phone: "+1 (555) 456-7890",
    role: "Doctor",
    status: "Inactive",
    specialization: "Pediatrics",
    workingHours: "Mon-Wed, 8:00 AM - 4:00 PM"
  },
  {
    id: 4,
    name: "Michael Brown",
    email: "michael.brown@clinic.com",
    phone: "+1 (555) 789-0123",
    role: "Secretary",
    status: "Active"
  },
  {
    id: 5,
    name: "Dr. James Smith",
    email: "james.smith@clinic.com",
    phone: "+1 (555) 321-6547",
    role: "Doctor",
    status: "Active",
    specialization: "Dermatology",
    workingHours: "Tue-Sat, 10:00 AM - 6:00 PM"
  },
  {
    id: 6,
    name: "Jessica Taylor",
    email: "jessica.taylor@clinic.com",
    phone: "+1 (555) 654-3210",
    role: "Secretary",
    status: "Inactive"
  }
];

export async function GET() {
  return NextResponse.json(staffList);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newStaff = {
    id: staffList.length + 1,
    ...body
  };
  staffList.push(newStaff);
  return NextResponse.json(newStaff, { status: 201 });
}
