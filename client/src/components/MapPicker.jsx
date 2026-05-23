import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { FiSearch, FiNavigation, FiLoader, FiMapPin } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

// Custom Red Marker Icon for Blood Bank Theme
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically pan/zoom map when coordinates change externally
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom || 15);
    }
  }, [center, zoom, map]);
  return null;
}

// Component to capture map click events
function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ latitude, longitude, onChange }) {
  const defaultLat = parseFloat(latitude) || 20.5937; // Center of India
  const defaultLng = parseFloat(longitude) || 78.9629;
  const isDefaultIndia = !latitude && !longitude;

  const [position, setPosition] = useState([defaultLat, defaultLng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Sync state if props change externally and aren't 0
  useEffect(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      if (lat !== position[0] || lng !== position[1]) {
        setPosition([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  // Helper to reverse geocode lat/lng to Address details
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'BloodBankManagementSystem/1.0'
          }
        }
      );
      if (!response.ok) throw new Error('Reverse geocoding failed');
      const data = await response.json();
      
      const addr = data.address || {};
      const street = [
        addr.road,
        addr.suburb,
        addr.neighbourhood,
        addr.village
      ].filter(Boolean).join(', ') || data.display_name.split(',').slice(0, 2).join(', ');

      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
      const state = addr.state || '';
      const pincode = addr.postcode || '';

      onChange({
        latitude: lat,
        longitude: lng,
        street: street,
        city: city,
        state: state,
        pincode: pincode
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Fallback: update coords only
      onChange({
        latitude: lat,
        longitude: lng
      });
    }
  };

  const handlePositionChange = async (lat, lng) => {
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));
    setPosition([roundedLat, roundedLng]);
    await reverseGeocode(roundedLat, roundedLng);
  };

  // Handle Search submit
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=1&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'BloodBankManagementSystem/1.0'
          }
        }
      );
      if (!response.ok) throw new Error('Search failed');
      const results = await response.json();

      if (results && results.length > 0) {
        const match = results[0];
        const lat = parseFloat(match.lat);
        const lng = parseFloat(match.lon);
        
        setPosition([lat, lng]);
        
        const addr = match.address || {};
        const street = [
          addr.road,
          addr.suburb,
          addr.neighbourhood
        ].filter(Boolean).join(', ') || match.display_name.split(',').slice(0, 2).join(', ');

        const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';

        onChange({
          latitude: lat,
          longitude: lng,
          street: street,
          city: city,
          state: state,
          pincode: pincode
        });
        toast.success('Location found!');
      } else {
        toast.error('Location not found. Try adding more details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Search request failed.');
    } finally {
      setIsSearching(false);
    }
  };

  // Detect current location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser.');
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await handlePositionChange(lat, lng);
        toast.success('Current location detected!');
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        let msg = 'Could not retrieve your location.';
        if (err.code === 1) msg = 'Location access denied by user.';
        toast.error(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {/* Control Panel */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: 6, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search address or area in India..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{
              flex: 1,
              padding: '0.5rem 2.5rem 0.5rem 0.875rem',
              fontSize: '0.85rem',
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={isSearching}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isSearching ? <FiLoader className="spinner-icon animate-spin" /> : <FiSearch />}
          </button>
        </form>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            fontSize: '0.82rem',
            borderRadius: 8,
            cursor: 'pointer',
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}
        >
          {isLocating ? <FiLoader className="animate-spin" /> : <FiNavigation />}
          Locate Me
        </button>
      </div>

      {/* Leaflet Map */}
      <div
        style={{
          height: 250,
          width: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <MapContainer
          center={position}
          zoom={isDefaultIndia ? 5 : 15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeMapView center={position} zoom={isDefaultIndia ? 5 : 15} />
          <MapEventsHandler onMapClick={handlePositionChange} />
          <Marker
            position={position}
            icon={redIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                handlePositionChange(pos.lat, pos.lng);
              },
            }}
          />
        </MapContainer>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        <FiMapPin style={{ color: 'var(--accent)' }} />
        <span>Drag marker or click map to select precise coordinates.</span>
      </div>
    </div>
  );
}
