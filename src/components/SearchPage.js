// Versão revisada e robusta de SearchPage.js com validações e segurança extra
import axios from "axios";
import logo from "../icons/logo-small.png";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SearchPage(props) {
  const navigate = useNavigate();
  const { setlist = [], ticketmaster = {}, favourites = [], setFavourites } = props;
  const attractions = ticketmaster.attractions || [];
  const events = ticketmaster.events || [];

  const handleFavourite = (artistId, artist, artistImage) => {
    const token = localStorage.getItem("token");

    if (!artistImage.startsWith("http")) {
      return axios
        .get("/ticketmaster/discovery/v2/suggest", {
          params: {
            keyword: artist,
            segmentId: "KZFzniwnSyZfZ7v7nJ",
            sort: "name,asc",
            apikey: process.env.REACT_APP_TICKETMASTER_KEY,
          },
        })
        .then((res) => res.data._embedded?.attractions?.[0]?.images?.[0]?.url || logo)
        .then((artistURL) => {
          return axios.post(
            "http://localhost:4000/favourite/add",
            { artistId, artistName: artist, image: artistURL },
            { headers: { token } }
          ).then((res) => {
            const artist_id = res.data.favourite.artist_id;
            setFavourites((prev) => [...prev, {
              artist_id,
              artistimage: artistURL,
              artistid: artistId,
              artistname: artist,
            }]);
          });
        });
    }

    axios.post(
      "http://localhost:4000/favourite/add",
      { artistId, artistName: artist, image: artistImage },
      { headers: { token } }
    ).then((res) => {
      const artist_id = res.data.favourite.artist_id;
      setFavourites((prev) => [...prev, {
        artist_id,
        artistimage: artistImage,
        artistid: artistId,
        artistname: artist,
      }]);
    }).catch((err) => {
      console.log("Error:", err);
      alert(err);
    });
  };

  const nextConcertDate = (localDate) => {
    if (!localDate) return null;
    const date = new Date(localDate);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const lastConcertDate = (eventDate) => {
    const [day, month, year] = eventDate.split("-");
    const date = new Date(`${year}-${month}-${day}`);
    if (date > new Date()) return null;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const noUpcomingConcert = setlist.filter((item) => {
    const [day, month, year] = item.eventDate.split("-");
    const date = new Date(`${year}-${month}-${day}`);
    return date < new Date();
  });

  const uniqueIds = [];
  const uniqueSetlist = noUpcomingConcert.filter((item) => {
    const isDuplicate = uniqueIds.includes(item.artist.mbid);
    if (!isDuplicate) uniqueIds.push(item.artist.mbid);
    return !isDuplicate;
  });

  if (!setlist.length || !ticketmaster) return null;

  return (
    <div className="search-card-container">
      {uniqueSetlist.slice(0, 3).map((setlistItem) => {
        const artistId = setlistItem.artist.mbid;
        const concertId = setlistItem.id;
        const artist = setlistItem.artist.name;
        const ticketmasterMap = attractions.find((item) => item.name === artist);

        let spotify = null;
        let artistImage = logo;

        if (ticketmasterMap?.externalLinks?.spotify) {
          spotify = ticketmasterMap.externalLinks.spotify[0].url;
        }
        if (ticketmasterMap?.images) {
          artistImage = ticketmasterMap.images[0].url;
        }

        const artistEvents = events
          .filter((item) =>
            item._embedded?.attractions?.some((a) => a.name === artist)
          )
          .sort((a, b) => a.dates.start.localDate.localeCompare(b.dates.start.localDate));

        const localDate = artistEvents?.[0]?.dates?.start?.localDate || null;

        return (
          <div key={artistId} className="search-page-card">
            <div className="search-page-image-box">
              <img
                alt={artist}
                src={artistImage}
                className="search-page-image"
                onClick={() => navigate(`/artists/${artistId}/concerts/${concertId}`)}
              />
            </div>
            <div className="search-page-info-box" onClick={() => navigate(`/artists/${artistId}/concerts/${concertId}`)}>
              <h1 className="search-artist">{artist}</h1>
            </div>
            <FontAwesomeIcon
              icon="heart"
              size="2x"
              className={`favourite-icon${favourites.find((item) => item.artistid === artistId) ? " active" : ""}`}
              onClick={() => handleFavourite(artistId, artist, artistImage)}
            />
            <div className="search-page-box">
              <div className="next-concert">Next concert</div>
              <h3>{localDate ? nextConcertDate(localDate) : "Unavailable"}</h3>
            </div>
            <div className="search-page-box">
              <div className="last-concert">Last concert</div>
              <h3>{lastConcertDate(setlistItem.eventDate)}</h3>
            </div>
            <div className="search-page-box">
              {spotify ? (
                <>
                  <span className="spotify-play-now">Play now</span>
                  <a href={spotify} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon="fa-brands fa-spotify" color="LimeGreen" size="3x" className="spotify-true" />
                  </a>
                </>
              ) : (
                <FontAwesomeIcon icon="fa-brands fa-spotify" size="3x" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}