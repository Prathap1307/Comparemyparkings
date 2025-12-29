export const runtime = "nodejs";

// app/api/companys/route.js
import { getAllItems } from "@/lib/Database/Utils-db";

const TABLE_NAME = process.env.PROMOCODE

// GET - Fetch all bookings
export async function GET() {
  try {
    const tabledata = await getAllItems(TABLE_NAME);
    return new Response(JSON.stringify(tabledata), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch bookings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
