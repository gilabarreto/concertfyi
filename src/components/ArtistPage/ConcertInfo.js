import { FaYoutube, FaInstagram, FaTwitter } from "react-icons/fa"; // Importing icons from react-icons library

import ConcertDate from "./ConcertDate"; // Importing ConcertDate component

export default function ConcertInfo(props) {
  
  // Extracting required data from props
  const artistInfo = props.setlist; 
  const concert = props.concert;
  
  // Extracting required data from concert object
  const artist = concert.artist.name;
  const tour = concert.tour?.name || "No tour name"; // If tour name is not present, "No tour name" will be used instead
  const venue = concert.venue?.name;
  const city = concert.venue.city?.name;
  const state = concert.venue.city?.state;
  const country = concert.venue.city?.country.code;

  return (
    <>
      <ol>
        <ConcertDate
        concert={concert}
        setlist={props.setlist} 
        artistInfo={artistInfo} />
        <h2>
          Artist:&ensp;{artist}
        </h2>
        <h2 className="tour">Tour:&ensp;{tour}</h2>
        <h2>Venue:&ensp;{venue}</h2>
        <h2>
          Location:&ensp;{city}, {state}, {country}
        </h2>
        <div className="socials-icons">
          {/* Checking if ticketmaster.attractions object exists before accessing youtube, instagram, and twitter links */}
          {props.ticketmaster.attractions ? (
            <a
            href={props.ticketmaster.attractions[0].externalLinks.youtube[0].url}
            target="_blank"
            rel="noreferrer"
          >
              <FaYoutube
                style={{ color: "red", paddingLeft: 5, paddingRight: "2em", height: "2em", width: "2em"}}
              />
            </a>
          ) : null}
          {props.ticketmaster.attractions ? (
            <a
              href={props.ticketmaster.attractions[0].externalLinks.instagram[0].url}
              target="_blank" rel="noreferrer"
            >
              <FaInstagram style={{ color: "hotpink", paddingRight: "2em", height: "2em", width: "2em"}} />
            </a>
          ) : null}
          {props.ticketmaster.attractions ? (
            <a
              href={props.ticketmaster.attractions[0].externalLinks.twitter[0].url}
              target="_blank" rel="noreferrer"
            >
              <FaTwitter style={{ color: "#1DA1F2", height: "2em", width: "2em", paddingRight: "2em"}} />
            </a>
          ) : null}
         </div>
      </ol>
    </>
  );
}
