export const runtime = "nodejs";

  // app/api/bookings/route.js
  import { createItem, getAllItems, updateItem, deleteItem } from "@/lib/Database/Utils-db";

  const TABLE_NAME = process.env.BOOKINGS_TABLE;

  // GET - Fetch all bookings
  export async function GET() {
    try {
      const bookings = await getAllItems(TABLE_NAME);
      return new Response(JSON.stringify(bookings), {
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

  // POST - Create new booking
  export async function POST(request) {
    try {
      const bookingData = await request.json();

      // Validate required fields
      if (!bookingData.ParkingName || !bookingData.Location || !bookingData.customerDetails) {
        return new Response(JSON.stringify({ 
          error: 'ParkingName, Location, and customerDetails are required' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Generate unique ID if not provided
      bookingData.id = bookingData.id || `PC${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Add timestamps
      bookingData.createdAt = new Date().toISOString();
      bookingData.updatedAt = new Date().toISOString();
      
      // Ensure bookingDetails has a status
      if (!bookingData.bookingDetails) {
        bookingData.bookingDetails = {};
      }
      bookingData.bookingDetails.status = bookingData.bookingDetails.status || 'pending';

      const newBooking = await createItem(TABLE_NAME, bookingData);

      return new Response(JSON.stringify(newBooking), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      return new Response(JSON.stringify({ error: 'Failed to create booking' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // PUT - Update booking
  export async function PUT(request) {
    try {
      const { id, ...updateData } = await request.json();

      if (!id) {
        return new Response(JSON.stringify({ error: 'Booking ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const stringId = String(id);
      updateData.updatedAt = new Date().toISOString();

      const updatedBooking = await updateItem(TABLE_NAME, stringId, updateData);
      return new Response(JSON.stringify(updatedBooking), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('Error updating booking:', err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // DELETE - Delete booking by ID
  export async function DELETE(request) {
    try {
      const { id } = await request.json();

      if (!id) {
        return new Response(JSON.stringify({ error: 'Booking ID is required for deletion' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await deleteItem(TABLE_NAME, id);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('Error deleting booking:', err);
      return new Response(JSON.stringify({ error: 'Failed to delete booking' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
