import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

export default function Favourites(props) {
  const navigate = useNavigate();
  const { favouritesTickets, favouritesConcerts } = props;

  // function to handle the deletion of an artist from the user's favourites
  const handleDelete = (artistId) => {
    const token = localStorage.getItem("token");

    axios
      .post(
        "http://localhost:4000/favourite/delete",
        {
          artist_id: artistId,
        },
        {
          headers: {
            token: token,
          },
        }
      )
      .then(() => {
        // update the favourites state to remove the deleted artist
        props.setFavourites((prev) =>
          [...prev].filter((item) => item.artist_id !== artistId)
        );
        // navigate to the favourites page
        navigate("/favourite");
      })
      .catch((error) => {
        console.log("Error:", error);
        alert(error);
      });
  };

  // function to format the date of the next concert for display
  const nextConcertDate = (localDate) => {
    if (!localDate) {
      return null;
    }
    const [year, month, day] = localDate.split("-");
    const date = new Date(year, month - 1, day);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const nextConcert = date.toLocaleDateString("en-US", options);
    return nextConcert;
  };

  // function to format the date of the last concert for display
  const lastConcertDate = (eventDate) => {
    const [day, month, year] = eventDate.split("-");
    const date = new Date(year, month - 1, day);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const lastConcert = date.toLocaleDateString("en-US", options);
    if (date > new Date()) {
      return null;
    }
    return lastConcert;
  };

  // initialize the spotify variable to null
  let spotify = null;

  // if the component is still loading, display a loading message
  if (props.loadingfavourites) {
    return <h1 className="favourite-text">Loading..</h1>;
  }

  // if the component has finished loading but the user has no favourites, return null
  if (!props.loadingfavourites && props.favourites.length === 0) {
    return null;
  }

  return (
    <>
      {props.favourites.map((favourite) => {
        // Extract artist name, image, and ID from the current favourite object
        const artist = favourite.artistname;
        const artistImage = favourite.artistimage;
        const artistId = favourite.artist_id;

        return (
          <div key={artistId} className="search-page-card">
            {/* Display artist image */}
            <div className="search-page-image-box">
              <img src={artistImage} className="search-page-image" />
            </div>

            {/* Display artist name */}
            <div className="search-page-info-box">
              <h1 className="search-artist">{artist}</h1>
            </div>

            {/* Display trash icon for deleting this favourite */}
            <FontAwesomeIcon
              icon="trash"
              size="2x"
              className="delete-icon"
              onClick={() => {
                handleDelete(artistId);
              }}
            />

            {/* Display next concert date */}
            <div className="search-page-box">
              <div className="next-concert">Next concert</div>
              <h3>
                {/* Check if there is a favourite ticket for this artist */}
                {favouritesTickets.find((item) => item.artistname === artist)
                  ? // If there is a favourite ticket, display the next concert date
                  nextConcertDate(
                    favouritesTickets.find(
                      (item) => item.artistname === artist
                    ).upcomingConcert
                  )
                  : // If there is no favourite ticket, display "Unavailable"
                  "Unavailable"}
              </h3>
            </div>

            {/* Display last concert date */}
            <div className="search-page-box">
              <div className="last-concert">Last concert</div>
              <h3>
                {/* Check if there is a favourite concert for this artist */}
                {favouritesConcerts.find((item) => item.artistname === artist)
                  ? // If there is a favourite concert, display the last concert date
                  lastConcertDate(
                    favouritesConcerts.find(
                      (item) => item.artistname === artist
                    ).lastConcert
                  )
                  : // If there is no favourite concert, display "Unavailable"
                  "Unavailable"}
              </h3>
            </div>

            {/* Display Spotify icon for playing artist's music */}
            <div className="search-page-box">
              {spotify ? (
                // If there is a Spotify link, display "Play now" and the icon
                <>
                  <span className="spotify-play-now">Play now</span>
                  <a href={spotify} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon
                      icon="fa-brands fa-spotify"
                      color="LimeGreen"
                      size="3x"
                      className="spotify-true"
                    />
                  </a>
                </>
              ) : (
                // If there is no Spotify link, display only the icon
                <FontAwesomeIcon icon="fa-brands fa-spotify" size="3x" />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}  
