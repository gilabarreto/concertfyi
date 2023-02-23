import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api"
import "../styles/styles.css";

export default function Map(props) {
  // Get the coordinates from the concert object
  const coordinates = props.concert.venue.city.coords;

  // Load the Google Maps API using the useLoadScript hook
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY
  })

  // If the Google Maps API is not loaded yet, display a loading message
  if (!isLoaded) return <div>Loading...</div>

  // Render the ArtistMap component with the coordinates as props
  return <ArtistMap latitude={coordinates.lat} longitude={coordinates.long} />
}

// ArtistMap component that displays the GoogleMap with a marker at a specific location
function ArtistMap(props) {

  return (
    // Render the GoogleMap component with the latitude and longitude as center
    <GoogleMap
      zoom={13}
      center={{ lat: parseFloat(props.latitude), lng: parseFloat(props.longitude) }}
      mapContainerClassName="map-container"
    >
      {/* Add a marker to the map at the latitude and longitude */}
      <MarkerF position={{ lat: parseFloat(props.latitude), lng: parseFloat(props.longitude) }}></MarkerF>
    </GoogleMap>
  );
}