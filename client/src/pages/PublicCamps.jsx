import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchCamps, registerForCamp, fetchMyRegistrations, fetchNearbyCamps } from '../redux/slices/campSlice';
import { fetchPublicBranches } from '../redux/slices/branchSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiCheck, FiRefreshCw, FiSliders, FiSearch, FiLogIn, FiInfo } from 'react-icons/fi';

// Fix leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom blood-drop camp icon
const createCampIcon = (isSelected = false) => L.divIcon({
  className: '',
  html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:${isSelected ? '#991b1b' : '#ef4444'};transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:12px;margin-bottom:2px;margin-right:2px;">⛺</div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -36],
});

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,0.6);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function PublicCamps() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { camps, myRegistrations, loading } = useSelector((s) => s.camps);
  const { publicBranches } = useSelector((s) => s.branches);
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState(50);
  const [dateFilter, setDateFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [hideFullCamps, setHideFullCamps] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India default center
  const [searchMode, setSearchMode] = useState('all'); // 'all' | 'nearby'
  const mapRef = useRef();

  // Try to request user coordinates on mount
  useEffect(() => {
    dispatch(fetchPublicBranches());
    if (isAuthenticated && user?.role === 'donor') {
      dispatch(fetchMyRegistrations());
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setMapCenter([lat, lng]);
          setSearchMode('nearby');
          dispatch(fetchNearbyCamps({ lat, lng, radius }));
        },
        (err) => {
          console.warn('Geolocation failed or denied on mount:', err);
          dispatch(fetchCamps({ upcoming: true }));
        }
      );
    } else {
      dispatch(fetchCamps({ upcoming: true }));
    }
  }, [dispatch, isAuthenticated, user?.role]);

  // Re-fetch camps when search filters/modes change
  useEffect(() => {
    if (searchMode === 'nearby' && coords) {
      dispatch(fetchNearbyCamps({ lat: coords.lat, lng: coords.lng, radius }));
    } else if (searchMode === 'all') {
      dispatch(fetchCamps({ upcoming: true }));
    }
  }, [dispatch, radius, searchMode, coords]);

  const loadCamps = () => {
    if (searchMode === 'nearby' && coords) {
      dispatch(fetchNearbyCamps({ lat: coords.lat, lng: coords.lng, radius }));
    } else {
      dispatch(fetchCamps({ upcoming: true }));
    }
    if (isAuthenticated && user?.role === 'donor') {
      dispatch(fetchMyRegistrations());
    }
  };

  const handleRegister = async (campId, campName) => {
    if (!isAuthenticated) {
      toast.error('Please sign in as a donor to register!');
      navigate(`/login?redirect=/camps`);
      return;
    }
    if (user?.role !== 'donor') {
      toast.error('Only registered donors can sign up for donation camps.');
      return;
    }

    try {
      const res = await dispatch(registerForCamp(campId)).unwrap();
      if (res.success) {
        toast.success(`🎉 Registered successfully for "${campName}"!`);
        loadCamps();
      }
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  const isRegistered = (campId) => {
    return myRegistrations.some((reg) => reg.campId?._id === campId || reg.campId === campId);
  };

  const getRegistrationDetails = (campId) => {
    return myRegistrations.find((reg) => reg.campId?._id === campId || reg.campId === campId);
  };

  const filteredCamps = camps.filter((camp) => {
    if (camp.status !== 'upcoming') return false;
    if (hideFullCamps && camp.totalRegistrations >= camp.maxDonors) return false;
    if (dateFilter && new Date(camp.date).toDateString() !== new Date(dateFilter).toDateString()) return false;
    if (branchFilter && camp.branchId?._id !== branchFilter && camp.branchId !== branchFilter) return false;
    return true;
  });

  const handleCampClick = (camp) => {
    setSelectedCamp(camp);
    if (camp.latitude && camp.longitude) {
      mapRef.current?.flyTo([camp.latitude, camp.longitude], 14, { animate: true, duration: 1.2 });
    }
  };

  const loadNearby = () => {
    if (!coords) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(loc);
          setMapCenter([loc.lat, loc.lng]);
          setSearchMode('nearby');
        },
        () => toast.error('Location access denied. Please enable location services in your browser.')
      );
    } else {
      setSearchMode('nearby');
    }
  };

  return (
    <div className="locator-container" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      {/* Sidebar Panel */}
      <div className="locator-sidebar" style={{ width: '100%', maxWidth: '380px' }}>
        {/* Header Block */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
            🩸 Donation Camps
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Find nearby donation camps and register to save lives.
          </p>

          {/* Location radius filters */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              disabled={searchMode !== 'nearby'}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 8,
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                opacity: searchMode !== 'nearby' ? 0.5 : 1
              }}
            >
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
              <option value={100}>Within 100 km</option>
            </select>
            <button
              onClick={loadNearby}
              className="btn-primary"
              style={{
                padding: '8px 14px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <FiSearch size={13} /> Near Me
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            {searchMode === 'nearby' ? (
              <button
                onClick={() => setSearchMode('all')}
                style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ← Show all camps
              </button>
            ) : (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Showing all upcoming camps</span>
            )}
            <button
              onClick={loadCamps}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Refresh camps list"
            >
              <FiRefreshCw size={11} /> Refresh
            </button>
          </div>
        </div>

        {/* Filters Controls */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8, background: 'color-mix(in srgb, var(--bg-surface) 30%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            <FiSliders size={12} /> Refine Filters
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 2 }}>DATE</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.78rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 2 }}>BRANCH</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.78rem' }}
              >
                <option value="">All Branches</option>
                {publicBranches?.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-primary)', cursor: 'pointer', marginTop: 4 }}>
            <input
              type="checkbox"
              checked={hideFullCamps}
              onChange={(e) => setHideFullCamps(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Hide Fully Booked Camps
          </label>
        </div>

        {/* Camps Scrollable List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <LoadingSpinner text="Finding camps..." />
            </div>
          ) : filteredCamps.map((camp) => {
            const registered = isAuthenticated && user?.role === 'donor' && isRegistered(camp._id);
            const regDetails = registered ? getRegistrationDetails(camp._id) : null;
            const isFull = camp.totalRegistrations >= camp.maxDonors;

            return (
              <div
                key={camp._id}
                onClick={() => handleCampClick(camp)}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  marginBottom: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: selectedCamp?._id === camp._id ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-base)',
                  border: `1px solid ${selectedCamp?._id === camp._id ? '#ef4444' : 'var(--border)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    ⛺ {camp.name}
                  </div>
                  {camp.distance !== undefined && camp.distance !== null && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>
                      {camp.distance} km
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Organized by {camp.organizer}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiCalendar size={12} style={{ color: 'var(--accent)' }} />
                    {new Date(camp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiClock size={12} style={{ color: 'var(--accent)' }} />
                    {camp.startTime} - {camp.endTime}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiMapPin size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {camp.address?.street}, {camp.address?.city}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiUsers size={12} style={{ color: 'var(--accent)' }} />
                    <span>{camp.totalRegistrations} / {camp.maxDonors} registered</span>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                  {registered ? (
                    <span style={{
                      padding: '4px 10px',
                      background: 'rgba(16,185,129,0.15)',
                      color: '#10b981',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <FiCheck /> Pass: {regDetails?.registrationId || 'Registered'}
                    </span>
                  ) : (
                    <button
                      disabled={isFull}
                      onClick={() => handleRegister(camp._id, camp.name)}
                      className={isAuthenticated ? "btn-primary" : "btn-ghost"}
                      style={{
                        padding: '5px 12px',
                        border: isAuthenticated ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        opacity: isFull ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {isFull ? (
                        'Fully Booked'
                      ) : isAuthenticated ? (
                        user?.role === 'donor' ? 'One-Click Register' : 'Registered as Staff'
                      ) : (
                        <>
                          <FiLogIn size={11} /> Register Pass
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && filteredCamps.length === 0 && (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛺</div>
              No upcoming donation camps found matching the criteria.
            </div>
          )}
        </div>
      </div>

      {/* Map display */}
      <div className="locator-map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={5}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* User Location */}
          {coords && (
            <>
              <Marker position={[coords.lat, coords.lng]} icon={USER_ICON}>
                <Popup>📍 Your Location</Popup>
              </Marker>
              <Circle
                center={[coords.lat, coords.lng]}
                radius={radius * 1000}
                pathOptions={{ fillColor: '#3b82f6', color: '#3b82f6', fillOpacity: 0.05, weight: 1 }}
              />
            </>
          )}

          {/* Camp Markers */}
          {filteredCamps.map((camp) => {
            const hasValidCoords = camp.latitude && camp.longitude && camp.latitude !== 0 && camp.longitude !== 0;
            if (!hasValidCoords) return null;

            const registered = isAuthenticated && user?.role === 'donor' && isRegistered(camp._id);
            const isFull = camp.totalRegistrations >= camp.maxDonors;

            return (
              <Marker
                key={camp._id}
                position={[camp.latitude, camp.longitude]}
                icon={createCampIcon(selectedCamp?._id === camp._id)}
                eventHandlers={{ click: () => handleCampClick(camp) }}
              >
                <Popup maxWidth={280}>
                  <div style={{ fontFamily: 'inherit', padding: '2px' }}>
                    <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: 4 }}>⛺ {camp.name}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Organized by: {camp.organizer}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem', color: '#555', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiCalendar style={{ color: '#ef4444' }} />
                        {new Date(camp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiClock style={{ color: '#ef4444' }} />
                        {camp.startTime} - {camp.endTime}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiMapPin style={{ color: '#ef4444', flexShrink: 0 }} />
                        <span>{camp.address?.street}, {camp.address?.city}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiUsers style={{ color: '#ef4444' }} />
                        <span>{camp.totalRegistrations} / {camp.maxDonors} registered</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      {registered ? (
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <FiCheck /> Registered
                        </span>
                      ) : (
                        <button
                          disabled={isFull}
                          onClick={() => handleRegister(camp._id, camp.name)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            opacity: isFull ? 0.5 : 1
                          }}
                        >
                          {isFull ? 'Fully Booked' : isAuthenticated ? 'One-Click Register' : 'Sign In to Register'}
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend Panel */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50% 50% 50% 0', background: '#ef4444', transform: 'rotate(-45deg)' }} />
            Donation Camp
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} />
            Your Location
          </div>
        </div>
      </div>
    </div>
  );
}
