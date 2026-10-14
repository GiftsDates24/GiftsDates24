import React, { useEffect, useState } from "react";
import { Navigation, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "../lib/api";

const ago = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

export default function AdminLiveLocations() {
  const [rows, setRows] = useState(null);
  const load = () => api.get("/admin/live-locations").then(r => setRows(r.data)).catch(() => setRows([]));
  useEffect(() => { load(); const iv = setInterval(load, 20000); return () => clearInterval(iv); }, []);

  return (
    <div className="space-y-4" data-testid="admin-live-locations">
      <div className="flex items-center gap-2">
        <Navigation size={16} className="text-sky-300" />
        <h2 className="text-lg font-semibold text-white">Live locations shared with support</h2>
        <Button size="sm" variant="outline" className="ms-auto h-8 bg-white/5 border-white/15" onClick={load} data-testid="admin-live-refresh"><RefreshCw size={13} className="me-1" />Refresh</Button>
      </div>
      {rows === null ? <div className="text-sm text-slate-500">Loading…</div>
        : rows.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-slate-500" data-testid="admin-live-empty">No one is sharing their live location with support right now.</div>
        : rows.map(r => (
          <div key={`${r.date_id}-${r.user_id}`} className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 space-y-2" data-testid={`admin-live-${r.date_id}-${r.user_id}`}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-sky-100">{r.user_name || r.user_id}</span>
              <span className="text-slate-400">on a date with {r.other_name || r.other_id}</span>
              <span className="text-[11px] text-slate-500">({r.kind}{r.to_date ? ", also shared with date" : ", support only"})</span>
              <span className={`ms-auto text-xs ${ago(r.at) > 5 ? "text-amber-300" : "text-emerald-300"}`}>updated {ago(r.at)} min ago</span>
            </div>
            {r.venue && <div className="text-xs text-slate-400">Venue: {r.venue}</div>}
            <iframe title={`live-${r.user_id}`} className="w-full h-56 rounded-lg border border-white/10" loading="lazy"
              src={`https://maps.google.com/maps?q=${r.lat},${r.lng}&z=15&output=embed`} />
            <a href={`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" data-testid={`admin-live-open-${r.user_id}`}>
              <Button size="sm" className="h-8 bg-sky-500 hover:bg-sky-400 text-white border-0"><Navigation size={13} className="me-1" />Open in Google Maps</Button>
            </a>
          </div>
        ))}
    </div>
  );
}
