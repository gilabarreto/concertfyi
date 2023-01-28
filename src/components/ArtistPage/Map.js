import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api"

import "../styles/styles.css";

export default function Map(props) {

  const coordinates = props.concert.venue.city.coords;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGGLE_MAPS_KEY
  })

  if (!isLoaded) return <div>Loading...</div>

  return <ArtistMap latitude={coordinates.lat} longitude={coordinates.long} />
}

function ArtistMap(props) {

  return (
    <GoogleMap
      zoom={13}
      center={{ lat: parseFloat(props.latitude), lng: parseFloat(props.longitude) }}
      mapContainerClassName="map-container"
    >

      <MarkerF position={{ lat: parseFloat(props.latitude), lng: parseFloat(props.longitude) }}></MarkerF>
    </GoogleMap>
  );
}