'use client';

import { useEffect, useState } from 'react';

export default function LocationsAdmin() {
  /* =======================
     STATE
  ======================= */
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    id: '',
    location_name: '',
    available_terminals: '', // OPTIONAL
    active: true,
  });

  /* =======================
     FETCH LOCATIONS
  ======================= */
  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');

      if (!res.ok) {
        console.error('Failed to fetch locations');
        return;
      }

      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  /* =======================
     FORM HELPERS
  ======================= */
  const resetForm = () => {
    setForm({
      id: '',
      location_name: '',
      available_terminals: '',
      active: true,
    });
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id: form.id || undefined,
      location_name: form.location_name.trim(),
      available_terminals: form.available_terminals
        ? form.available_terminals.split(',').map(t => t.trim())
        : [],
      active: form.active,
    };

    try {
      await fetch('/api/locations', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await fetchLocations();
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (loc) => {
    setEditing(true);
    setForm({
      id: loc.id,
      location_name: loc.location_name || '',
      available_terminals: Array.isArray(loc.available_terminals)
        ? loc.available_terminals.join(', ')
        : '',
      active: !!loc.active,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await fetch('/api/locations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      fetchLocations();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Locations</h1>

      {/* =======================
          FORM
      ======================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow mb-8 space-y-4 max-w-xl"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Location Name
          </label>
          <input
            required
            value={form.location_name}
            onChange={(e) =>
              setForm({ ...form, location_name: e.target.value })
            }
            className="w-full p-2 border rounded"
            placeholder="Heathrow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Terminals (optional)
          </label>
          <input
            value={form.available_terminals}
            onChange={(e) =>
              setForm({ ...form, available_terminals: e.target.value })
            }
            className="w-full p-2 border rounded"
            placeholder="Terminal 2, Terminal 3 (optional)"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm({ ...form, active: e.target.checked })
            }
          />
          <span className="text-sm">Active</span>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded disabled:opacity-60"
          >
            {editing ? 'Update Location' : 'Add Location'}
          </button>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* =======================
          TABLE
      ======================= */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Terminals</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border-b">
                <td className="p-3 font-medium">
                  {loc.location_name}
                </td>

                <td className="p-3">
                  {Array.isArray(loc.available_terminals) &&
                  loc.available_terminals.length
                    ? loc.available_terminals.join(', ')
                    : '—'}
                </td>

                <td className="p-3">
                  {loc.active ? 'Yes' : 'No'}
                </td>

                <td className="p-3 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(loc)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!locations.length && (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-gray-500"
                >
                  No locations added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
