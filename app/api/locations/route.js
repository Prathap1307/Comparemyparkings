export const runtime = "nodejs";

// app/api/locations/route.js
import {
  createItem,
  getAllItems,
  updateItem,
  deleteItem,
} from '../../../lib/Database/Utils-db';

const TABLE_NAME = process.env.AVAILABLE_LOCATIONS_TABLE;

/* ---------------- GET: fetch all locations ---------------- */
export async function GET() {
  try {
    const locations = await getAllItems(TABLE_NAME);
    return new Response(JSON.stringify(locations || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET locations error:', err);
    return new Response(JSON.stringify([]), { status: 200 });
  }
}

/* ---------------- POST: create location ---------------- */
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.location_name) {
      return new Response(
        JSON.stringify({ error: 'location_name is required' }),
        { status: 400 }
      );
    }

    const item = {
      id: data.id || `LOC_${Date.now()}`,
      location_name: data.location_name,
      active: data.active ?? true,
      createdAt: new Date().toISOString(),
    };

    await createItem(TABLE_NAME, item);

    return new Response(JSON.stringify(item), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST location error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to create location' }),
      { status: 500 }
    );
  }
}

/* ---------------- PUT: update location ---------------- */
export async function PUT(request) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'id is required' }),
        { status: 400 }
      );
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await updateItem(TABLE_NAME, id, updates);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('PUT location error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to update location' }),
      { status: 500 }
    );
  }
}

/* ---------------- DELETE: delete location ---------------- */
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'id is required' }),
        { status: 400 }
      );
    }

    await deleteItem(TABLE_NAME, id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('DELETE location error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to delete location' }),
      { status: 500 }
    );
  }
}
