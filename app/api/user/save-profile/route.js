export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createItem, getUserByClerkId, saveUserVehicles } from "@/lib/Database/Utils-db";

export async function POST(request) {
  const { userId } = await auth();

  console.log("CLERK userId →", userId);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const fullName = payload?.fullName || "";
  const email = payload?.email || "";
  const phone = payload?.phone || "";

  if (!fullName && !email && !phone && !Array.isArray(payload?.vehicles)) {
    return NextResponse.json({ error: "No profile data provided" }, { status: 400 });
  }

  const existingUser = await getUserByClerkId("users", userId);
  const now = new Date().toISOString();

  await createItem("users", {
    id: userId,
    full_name: fullName,
    email,
    phone,
    created_at: existingUser?.created_at || now,
    updated_at: now,
  });

  if (Array.isArray(payload?.vehicles)) {
    const vehicles = payload.vehicles
      .filter(Boolean)
      .map((registration, index) => ({
        registration,
        is_default: index === 0,
      }));

    await saveUserVehicles("user_vehicles", userId, vehicles);
  }

  return NextResponse.json({ ok: true });
}
