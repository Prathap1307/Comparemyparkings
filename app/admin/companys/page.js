'use client';

import { useEffect, useState } from 'react';

export default function AdminCompanys() {
  const [companys, setCompanys] = useState([]);
  const [locations, setLocations] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: '',
    name: '',
    type: 'meet-greet',
    Location: '',
    distance: '',
    transferTime: '',
    Displaypicture: '',
    images: '',
    AvailableFacilities: '',
    pricingTiers: '',
    Stars: '4.5',
    StarredRatingsCount: '0',
    FreeCancellation: true,
    Status: 'active',

    // ✅ CONTACT DETAILS
    officialEmail: '',
    contactEmail: '',
    ownerEmail: '',
    companyNumber: '',
    customerCareNumber: '',
    managerNumber: '',
    ownerNumber: '',
  });

  /* ---------------- LOAD DATA ---------------- */
  const loadData = async () => {
    const [c, l] = await Promise.all([
      fetch('/api/companys').then(r => r.json()).catch(() => []),
      fetch('/api/locations').then(r => r.json()).catch(() => [])
    ]);
    setCompanys(Array.isArray(c) ? c : []);
    setLocations(Array.isArray(l) ? l : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------- RESET ---------------- */
  const resetForm = () => {
    setEditing(false);
    setForm({
      id: '',
      name: '',
      type: 'meet-greet',
      Location: '',
      distance: '',
      transferTime: '',
      Displaypicture: '',
      images: '',
      AvailableFacilities: '',
      pricingTiers: '',
      Stars: '4.5',
      StarredRatingsCount: '0',
      FreeCancellation: true,
      Status: 'active',

      officialEmail: '',
      contactEmail: '',
      ownerEmail: '',
      companyNumber: '',
      customerCareNumber: '',
      managerNumber: '',
      ownerNumber: '',
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      images: form.images
        ? form.images.split(',').map(i => i.trim())
        : [],
      pricingTiers: form.pricingTiers
        ? JSON.parse(form.pricingTiers)
        : [],
    };

    await fetch('/api/companys', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    await loadData();
    resetForm();
    setLoading(false);
  };

  /* ---------------- EDIT ---------------- */
  const edit = (c) => {
    setEditing(true);
    setForm({
      ...c,
      images: (c.images || []).join(', '),
      pricingTiers: JSON.stringify(c.pricingTiers || [], null, 2),

      officialEmail: c.officialEmail || '',
      contactEmail: c.contactEmail || '',
      ownerEmail: c.ownerEmail || '',
      companyNumber: c.companyNumber || '',
      customerCareNumber: c.customerCareNumber || '',
      managerNumber: c.managerNumber || '',
      ownerNumber: c.ownerNumber || '',
    });
  };

  /* ---------------- DELETE ---------------- */
  const remove = async (id) => {
    if (!confirm('Delete this company?')) return;

    await fetch('/api/companys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    loadData();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Manage Companies</h1>

      {/* FORM */}
      <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-4">
        <input
          required
          placeholder="Company Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <select
          value={form.Location}
          onChange={e => setForm({ ...form, Location: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Location</option>
          {locations.map(l => (
            <option key={l.id} value={l.location_name}>
              {l.location_name}
            </option>
          ))}
        </select>

        {/* CONTACT EMAILS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Official Email" value={form.officialEmail}
            onChange={e => setForm({ ...form, officialEmail: e.target.value })}
            className="border p-2 rounded" />

          <input placeholder="Contact Email" value={form.contactEmail}
            onChange={e => setForm({ ...form, contactEmail: e.target.value })}
            className="border p-2 rounded" />

          <input placeholder="Owner Email" value={form.ownerEmail}
            onChange={e => setForm({ ...form, ownerEmail: e.target.value })}
            className="border p-2 rounded" />
        </div>

        {/* PHONE NUMBERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input placeholder="Company Number" value={form.companyNumber}
            onChange={e => setForm({ ...form, companyNumber: e.target.value })}
            className="border p-2 rounded" />

          <input placeholder="Customer Care Number" value={form.customerCareNumber}
            onChange={e => setForm({ ...form, customerCareNumber: e.target.value })}
            className="border p-2 rounded" />

          <input placeholder="Manager Number" value={form.managerNumber}
            onChange={e => setForm({ ...form, managerNumber: e.target.value })}
            className="border p-2 rounded" />

          <input placeholder="Owner Number" value={form.ownerNumber}
            onChange={e => setForm({ ...form, ownerNumber: e.target.value })}
            className="border p-2 rounded" />
        </div>

        <textarea
          placeholder="Facilities (use -.)"
          value={form.AvailableFacilities}
          onChange={e => setForm({ ...form, AvailableFacilities: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <textarea
          placeholder="Pricing Tiers JSON"
          value={form.pricingTiers}
          onChange={e => setForm({ ...form, pricingTiers: e.target.value })}
          className="w-full border p-2 rounded font-mono h-40"
        />

        <input
          placeholder="Images (comma separated URLs)"
          value={form.images}
          onChange={e => setForm({ ...form, images: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <button
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-2 rounded"
        >
          {editing ? 'Update Company' : 'Add Company'}
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3">Location</th>
            <th className="p-3">Type</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companys.map(c => (
            <tr key={c.id} className="border-t">
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.Location}</td>
              <td className="p-3">{c.type}</td>
              <td className="p-3">{c.Status}</td>
              <td className="p-3 text-right space-x-3">
                <button onClick={() => edit(c)} className="text-blue-600">Edit</button>
                <button onClick={() => remove(c.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
          {!companys.length && (
            <tr>
              <td colSpan="5" className="p-6 text-center text-gray-500">
                No companies added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
