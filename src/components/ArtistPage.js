import { useState } from "react";
import { useParams } from "react-router-dom";

import "./styles/styles.css";

import ConcertInfo from "./ArtistPage/ConcertInfo";
import Map from "./ArtistPage/Map";
import Setlist from "./ArtistPage/Setlist";
import Player from "./ArtistPage/Player";
import UpcomingConcertList from "./ArtistPage/UpcomingConcertList";
import PreviousConcerts from "./ArtistPage/PreviousConcerts";

export default function ArtistPage(props) {
  // State for Spotify artist or track
  const [spotifyArtist, setSpotifyArtist] = useState([]);

  // Get artistId and concertId from URL params
  let { concertId, artistId } = useParams();

  // If setlist is empty or ticketmaster is undefined, render nothing
  if (props.setlist.length === 0 || props.ticketmaster === undefined) {
    return null;
  }

  // Get the concert data that matches the concertId
  const concert = props.setlist.find((result) => result.id === concertId);

  return (
    <div>
      {/* Top section of the artist page */}
      <div className="artist-page-top-container">
        {/* Concert info section */}
        <div className="artist-page-concert-info">
          <ConcertInfo
            concert={concert}
            setlist={props.setlist}
            ticketmaster={props.ticketmaster}
          />
        </div>
        {/* Map section */}
        <div className="artist-page-map">
          {props.ticketmaster ? <Map concert={concert} /> : null}
        </div>
      </div>
      {/* Bottom section of the artist page */}
      <div className="artist-page-bottom-container">
        {/* Bottom left section */}
        <div className="artist-page-bottom-left-container">
          {/* Setlist section */}
          <div className="artist-page-setlist">
            <Setlist concert={concert} />
          </div>
          {/* Spotify section */}
          <div className="artist-page-spotify">
            <Player
              concert={concert}
              ticketmaster={props.ticketmaster}
              spotifyArtist={spotifyArtist}
              setSpotifyArtist={setSpotifyArtist}
            />
          </div>
        </div>
        {/* Bottom right section */}
        <div className="artist-page-bottom-right-container">
          {/* Upcoming concerts section */}
          <div className="artist-page-upcoming-concerts">
            <span className="next-concerts">Upcoming Concerts</span>
              <UpcomingConcertList
                ticketmaster={props.ticketmaster}
                setlist={props.setlist}
                concert={concert}
              />
          </div>
          {/* Previous concerts section */}
          <div className="artist-page-previous-concerts">
            <span className="prevConc-title">Previous Concerts</span>
              <div>
                <PreviousConcerts
                  concert={concert}
                  setlist={props.setlist}
                  artistId={artistId}
                />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
