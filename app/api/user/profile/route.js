export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkId, getVehiclesByUserId } from "@/lib/Database/Utils-db";

export async function GET() {
  try {
    const { userId } = await auth();

    console.log("CLERK userId →", userId);

    if (!userId) return NextResponse.json(null);

    const user = await getUserByClerkId("users", userId);
    if (!user) return NextResponse.json(null);

    const vehicles = await getVehiclesByUserId("user_vehicles", userId);

    return NextResponse.json({
      firstName: user.full_name?.split(" ")[0] || "",
      lastName: user.full_name?.split(" ")[1] || "",
      email: user.email,
      phone: user.phone,
      vehicles: vehicles.map((v) => ({
        id: v.id,
        registration: v.registration,
        is_default: v.is_default,
      })),
    });
  } catch (error) {
    console.error("Failed to load user profile:", error);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}
