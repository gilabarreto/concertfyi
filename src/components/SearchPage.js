import axios from "axios";
import logo from "../icons/logo-small.png";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SearchPage(props) {
  const navigate = useNavigate();

  // define a function to add an artist to the favorites list
  const handleFavourite = (artistId, artist, artistImage) => {
    // check if the image URL starts with "http", if not, make a request to get the image URL from the Ticketmaster API
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
          // make a post request to add the artist to the favorites list with the artist ID, artist name, and image URL
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
              // update the favorites list in the parent component by adding the new artist to it
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
    // if the image URL starts with "http", make a post request to add the artist to the favorites list with the artist ID, artist name, and image URL
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
        // update the favorites list in the parent component by adding the new artist to it
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

  // This function returns the next concert date given a local date
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

    // Format date to human readable format
    const nextConcert = date.toLocaleDateString("en-US", options);

    return nextConcert;
  };

  // This function returns the last concert date, null if the date is in the future
  const lastConcertDate = (eventDate) => {
    const [day, month, year] = eventDate.split("-");
    const date = new Date(year, month - 1, day);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    // Format date to human readable format
    const lastConcert = date.toLocaleDateString("en-US", options);

    if (date > new Date()) {
      return null;
    }
    return lastConcert;
  };

  // This filters setlist data by concert date, only shows concerts that already happened
  const noUpcomingConcert = props.setlist.filter((item) => {
    const [day, month, year] = item.eventDate.split("-");
    const date = new Date(year, month - 1, day);

    // Returns false for future dates, true for past dates
    if (Number(date) > Number(new Date())) {
      return false;
    }
    return true;
  });

  const uniqueIds = [];

  // Filters the data for unique artists
  const uniqueSetlist = noUpcomingConcert.filter((item) => {
    const isDuplicate = uniqueIds.includes(item.artist.mbid);

    if (!isDuplicate) {
      uniqueIds.push(item.artist.mbid);

      return true;
    }
    return false;
  });

  // Returns null if there is no setlist data or the ticketmaster data is undefined
  if (props.setlist.length === 0 || props.ticketmaster === undefined) {
    return null;
  }

  return (
    // Start of component
    <div className="search-card-container">
      {/* Mapping through the unique setlist array */}
      {uniqueSetlist.map((setlist, index) => {
        // Creating a concert variable and initializing with current setlist item
        const concert = setlist;

        // Extracting artist id, concert id, artist name, tour name, and last concert date from concert object
        const artistId = concert.artist.mbid;
        const concertId = concert.id;
        const artist = concert.artist.name;
        // const tour = concert?.tour?.name;
        // const lastConcert = concert.eventDate;

        // Finding the spotify link and image for the specific artist from the ticketmaster data 
        const ticketmasterMap = props.ticketmaster.attractions.find((item) => item.name === artist);
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

        // Filtering the ticketmaster events array for only events that include the current artist
        // Sorting them by the start date of the event
        const ticketmasterEvents = props.ticketmaster.events
          .filter((item) => {
            if (item._embedded.attractions !== undefined) {
              for (const attraction of item._embedded.attractions) {
                if (attraction.name === artist) {
                  return item;
                }
              }
            }
            return item;
          })
          .sort((a, b) => a.dates.start.localDate - b.dates.start.localDate);

        // Initializing localDate variable with the start date of the next event
        let localDate = null;
        if (ticketmasterEvents[0] && ticketmasterEvents[0].dates) {
          localDate = ticketmasterEvents[0].dates.start.localDate;
        }

        return (
          <div key={artistId} className="search-page-card">
            <div className="search-page-image-box">
              <img
                alt=""
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
              className={`favourite-icon${props.favourites.find((item) => item.artistid === artistId)
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
