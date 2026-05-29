import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../api/axios';
import { FiSearch, FiMapPin, FiPhone, FiMail, FiClock, FiDroplet } from 'react-icons/fi';

// Fix leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom blood-drop icon
const createBloodIcon = (color = '#ef4444') => L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,0.6);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodBankLocator() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [bloodGroup, setBloodGroup] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(50);
  const [searchMode, setSearchMode] = useState('all'); // 'all' | 'nearby'
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const mapRef = useRef();

  useEffect(() => {
    // Automatically trigger user location request on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter([loc.lat, loc.lng]);
          setSearchMode('nearby');
        },
        (err) => {
          console.warn('Geolocation failed or denied on mount:', err);
          loadBranches();
        }
      );
    } else {
      loadBranches();
    }
  }, []);

  useEffect(() => {
    if (searchMode === 'nearby' && userLocation) {
      fetchNearby(userLocation);
    } else if (searchMode === 'all') {
      loadBranches();
    }
  }, [bloodGroup, radius, searchMode, userLocation]);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const params = {};
      if (bloodGroup !== 'All') params.bloodGroup = bloodGroup;
      const { data } = await API.get('/geo/map', { params });
      setBranches(data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const loadNearby = async () => {
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter([loc.lat, loc.lng]);
          setSearchMode('nearby');
        },
        () => alert('Location access denied. Please enable location.')
      );
    } else {
      setSearchMode('nearby');
    }
  };

  const fetchNearby = async (loc) => {
    setLoading(true);
    try {
      const params = { lat: loc.lat, lng: loc.lng, radius, ...(bloodGroup !== 'All' ? { bloodGroup } : {}) };
      const { data } = await API.get('/geo/nearby', { params });
      setBranches(data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
    if (branch.latitude && branch.longitude) {
      mapRef.current?.flyTo([branch.latitude, branch.longitude], 14, { animate: true, duration: 1.2 });
    }
  };

  return (
    <div className="locator-container">
      {/* Sidebar */}
      <div className="locator-sidebar">
        {/* Sidebar Header */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiMapPin style={{ color: '#ef4444' }} /> Blood Bank Locator
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {branches.length} blood banks found
          </p>

          {/* Blood Group Filter */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              FILTER BY BLOOD GROUP
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {BLOOD_GROUPS.map((bg) => (
                <button key={bg} onClick={() => setBloodGroup(bg)} style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                  background: bloodGroup === bg ? '#ef4444' : 'var(--bg-base)',
                  color: bloodGroup === bg ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${bloodGroup === bg ? '#ef4444' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{bg}</button>
              ))}
            </div>
          </div>

          {/* Nearby Search */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={radius} onChange={(e) => setRadius(e.target.value)} style={{ flex: 1, padding: '7px 10px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
              <option value={100}>Within 100 km</option>
            </select>
            <button onClick={loadNearby} style={{ padding: '7px 14px', borderRadius: 'var(--btn-radius)', background: 'var(--gradient-primary)', boxShadow: '0 0 20px var(--accent-glow)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiSearch size={13} /> Near Me
            </button>
          </div>
          {searchMode === 'nearby' && (
            <button onClick={() => { setSearchMode('all'); loadBranches(); }} style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              ← Show all branches
            </button>
          )}
        </div>

        {/* Branch List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</div>
          ) : branches.map((branch) => (
            <div
              key={branch._id}
              onClick={() => handleBranchClick(branch)}
              style={{
                padding: '12px', borderRadius: 10, marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s',
                background: selectedBranch?._id === branch._id ? 'rgba(239,68,68,0.12)' : 'var(--bg-base)',
                border: `1px solid ${selectedBranch?._id === branch._id ? '#ef4444' : 'var(--border)'}`,
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: 4 }}>
                🏥 {branch.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                {branch.address?.city}, {branch.address?.state}
              </div>
              {branch.distance != null && (
                <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>
                  📍 {branch.distance} km away
                </div>
              )}
              {/* Blood stock mini display */}
              {branch.stock?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {branch.stock.filter((s) => s.units > 0).slice(0, 5).map((s) => (
                    <span key={s._id} style={{ padding: '1px 6px', borderRadius: 12, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef444430' }}>
                      {s._id}: {s.units}u
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!loading && branches.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
              No blood banks found
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="locator-map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* User location */}
          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_ICON}>
                <Popup>📍 Your Location</Popup>
              </Marker>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radius * 1000}
                pathOptions={{ fillColor: '#3b82f6', color: '#3b82f6', fillOpacity: 0.05, weight: 1 }}
              />
            </>
          )}

          {/* Branch markers */}
          {branches.map((branch) => (
            branch.latitude && branch.longitude ? (
              <Marker
                key={branch._id}
                position={[branch.latitude, branch.longitude]}
                icon={createBloodIcon(selectedBranch?._id === branch._id ? '#b91c1c' : '#ef4444')}
                eventHandlers={{ click: () => handleBranchClick(branch) }}
              >
                <Popup maxWidth={260}>
                  <div style={{ fontFamily: 'inherit' }}>
                    <strong style={{ fontSize: '0.95rem' }}>🏥 {branch.name}</strong>
                    <div style={{ marginTop: 6, fontSize: '0.82rem', color: '#666' }}>
                      <div>📍 {branch.address?.street}, {branch.address?.city}</div>
                      <div>📞 {branch.phone}</div>
                      <div>✉️ {branch.email}</div>
                      {branch.operatingHours && (
                        <div>🕐 {branch.operatingHours.open} – {branch.operatingHours.close}</div>
                      )}
                      {branch.distance != null && (
                        <div style={{ color: '#ef4444', fontWeight: 700 }}>📍 {branch.distance} km away</div>
                      )}
                    </div>
                    {branch.stock?.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {branch.stock.filter((s) => s.units > 0).map((s) => (
                          <span key={s._id} style={{ padding: '1px 6px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                            {s._id}: {s.units}u
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>

        {/* Info overlay */}
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50% 50% 50% 0', background: '#ef4444', transform: 'rotate(-45deg)' }} />
            Blood Bank
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} />
            Your Location
          </div>
        </div>
      </div>
    </div>
  );
}
