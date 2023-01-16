import axios from "axios";
import logo from "../icons/logo-small.png";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SearchPage(props) {
  const navigate = useNavigate();

  const handleFavourite = (artistId, artist, artistImage) => {
    if (!artistImage.startsWith("http")) {
      return axios
        .get("https://app.ticketmaster.com/discovery/v2/suggest", {
          params: {
            keyword: artist,
            segmentId: "KZFzniwnSyZfZ7v7nJ",
            sort: "name,asc",
            apikey: process.env.REACT_APP_TICKETMASTER_KEY,
          },
        })
        .then((res) => {
          return res.data._embedded.attractions[0].images[0].url;
        })
        .then((artistURL) => {
          const token = localStorage.getItem("token");
          axios
            .post(
              "http://localhost:4000/favourite/add",
              {
                artistId: artistId,
                artistName: artist,
                image: artistURL,
              },
              {
                headers: {
                  token: token,
                },
              }
            )
            .then((res) => {
              const artist_id = res.data.favourite.artist_id;
              props.setFavourites((prev) => {
                return [
                  ...prev,
                  {
                    artist_id,
                    artistimage: artistURL,
                    artistid: artistId,
                    artistname: artist,
                  },
                ];
              });
            });
        });
    }
    const token = localStorage.getItem("token");

    axios
      .post(
        "http://localhost:4000/favourite/add",
        {
          artistId: artistId,
          artistName: artist,
          image: artistImage,
        },
        {
          headers: {
            token: token,
          },
        }
      )
      .then((res) => {
        const artist_id = res.data.favourite.artist_id;
        props.setFavourites((prev) => {
          return [
            ...prev,
            {
              artist_id,
              artistimage: artistImage,
              artistid: artistId,
              artistname: artist,
            },
          ];
        });
      })
      .catch((error) => {
        console.log("Error:", error);
        alert(error);
      });
  };

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

  //Filters setlist data by concert date, only show concerts that already happened
  const noUpcomingConcert = props.setlist.filter((item) => {
    const [day, month, year] = item.eventDate.split("-");
    const date = new Date(year, month - 1, day);

    if (Number(date) > Number(new Date())) {
      return false;
    }
    return true;
  });

  const uniqueIds = [];

  //Filters the data for unique artists
  const uniqueSetlist = noUpcomingConcert.filter((item) => {
    const isDuplicate = uniqueIds.includes(item.artist.mbid);

    if (!isDuplicate) {
      uniqueIds.push(item.artist.mbid);

      return true;
    }
    return false;
  });

  if (props.setlist.length === 0 || props.ticketmaster === undefined) {
    return null;
  }

  return (
    <div class="search-card-container">
      {uniqueSetlist
        .map((setlist, index) => {
          const concert = setlist;

          const artistId = concert.artist.mbid;

          const concertId = concert.id;

          const artist = concert.artist.name;

          const tour = concert?.tour?.name;

          const lastConcert = concert.eventDate;

          //Find spotify link and image for specific artist
          const ticketmasterMap = props.ticketmaster.attractions.find(
            (item) => item.name === artist
          );

          let spotify = null;
          let artistImage = logo;
          if (
            ticketmasterMap &&
            ticketmasterMap.externalLinks &&
            ticketmasterMap.externalLinks.spotify
          ) {
            spotify = ticketmasterMap.externalLinks.spotify[0].url;
          }

          if (ticketmasterMap && ticketmasterMap.images) {
            artistImage = ticketmasterMap.images[0].url;
          }

          // Filter for only attractions from events
          const ticketmasterEvents = props.ticketmaster.events
            .filter((item) => {
              if (item._embedded.attractions !== undefined) {
                for (const attraction of item._embedded.attractions) {
                  if (attraction.name === artist) {
                    return item;
                  }
                }
              }
            })
            .sort((a, b) => a.dates.start.localDate - b.dates.start.localDate);

          let localDate = null;

          if (ticketmasterEvents[0] && ticketmasterEvents[0].dates) {
            localDate = ticketmasterEvents[0].dates.start.localDate;
          }

          return (
            <div key={artistId} className="search-page-card">
              <div className="search-page-image-box">
                <img
                  src={artistImage}
                  className="search-page-image"
                  onClick={() => {
                    navigate(`/artists/${artistId}/concerts/${concertId}`);
                  }}
                />
              </div>
              <div
                className="search-page-info-box"
                onClick={() => {
                  navigate(`/artists/${artistId}/concerts/${concertId}`);
                }}
              >
                <h1 className="search-artist">{artist}</h1>
                {/* {tour && <h3 className="search-tour">Tour: {tour}</h3>} */}
              </div>

              <FontAwesomeIcon
                icon="heart"
                size="2x"
                className={`favourite-icon${
                  props.favourites.find((item) => item.artistid === artistId)
                    ? " active"
                    : ""
                }`}
                onClick={() => handleFavourite(artistId, artist, artistImage)}
              />
              <div className="search-page-box">
                <div className="next-concert">Next concert</div>
                <h3>
                  {localDate ? nextConcertDate(localDate) : "Unavailable"}
                </h3>
              </div>
              <div className="search-page-box">
                <div className="last-concert">Last concert</div>
                <h3>{lastConcertDate(setlist.eventDate)}</h3>
              </div>
              <div className="search-page-box">
                {/* <div className="play-now"> */}
                {spotify ? (
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
                  <FontAwesomeIcon icon="fa-brands fa-spotify" size="3x" />
                )}
                {/* </div> */}
              </div>
            </div>
          );
        })
        .slice(0, 3)}
    </div>
  );
}
