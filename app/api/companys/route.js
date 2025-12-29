// app/api/companys/route.js
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem
} from "@/lib/Database/Utils-db";

const TABLE_NAME = process.env.COMPANYSTABLE;

/* ---------------- GET ---------------- */
export async function GET() {
  try {
    const data = await getAllItems(TABLE_NAME);
    return Response.json(data);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

/* ---------------- POST ---------------- */
export async function POST(req) {
  try {
    const body = await req.json();

    body.id = body.id || `CP${Date.now()}`;
    body.createdAt = new Date().toISOString();
    body.updatedAt = new Date().toISOString();

    await createItem(TABLE_NAME, body);
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create company" }, { status: 500 });
  }
}

/* ---------------- PUT ---------------- */
export async function PUT(req) {
  try {
    const { id, ...data } = await req.json();
    data.updatedAt = new Date().toISOString();

    await updateItem(TABLE_NAME, id, data);
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to update company" }, { status: 500 });
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await deleteItem(TABLE_NAME, id);
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
