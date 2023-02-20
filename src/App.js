import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import ArtistPage from "./components/ArtistPage";
import SearchPage from "./components/SearchPage";
import Favourites from "./components/Favourites";
import Main from "./components/Main";
import BackgroundImage from "./components/BackgroundImage";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faHeart, faMusic, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function App() {
  // Declare state variables and their initial values using the useState hook
  const [setlist, setSetlist] = useState([]); // Array of setlists
  const [ticketmaster, setTicketmaster] = useState([]); // Array of Ticketmaster data
  const [lat, setLat] = useState([null]); // Latitude
  const [long, setLong] = useState([null]); // Longitude
  const [token, setToken] = useState(""); // Token for authentication
  const [value, setValue] = useState(""); // Value of the search input
  const [favourites, setFavourites] = useState([]); // Array of favourite artists
  const [loadingfavourites, setLoadingfavourites] = useState(false); // Flag to indicate whether favourites are loading
  const [favouritesConcerts, setFavouritesConcerts] = useState([]); // Array of concerts for each favourite artist
  const [favouritesTickets, setFavouritesTickets] = useState([]); // Array of ticket information for each favourite artist

  // Function to fetch data for a favourite artist
  const fetchDataByFavourite = useCallback((favourite) => {
    // Make a GET request to Setlist.fm API to get setlists for the artist
    const setlistPromise = axios.get("/rest/1.0/search/setlists", {
      params: {
        artistName: `"${favourite.artistname}"`, // Use the artist name to search for setlists
        p: "1", // Only get the first page of results
      },
      headers: {
        Accept: "application/json",
        "x-api-key": process.env.REACT_APP_SETLIST_KEY, // Use the API key for Setlist.fm
      },
    });

    // Make a GET request to Ticketmaster API to get data for the artist
    const ticketmasterPromise = axios.get(
      "https://app.ticketmaster.com/discovery/v2/suggest",
      {
        params: {
          keyword: `"${favourite.artistname}"`, // Use the artist name to search for events
          segmentId: "KZFzniwnSyZfZ7v7nJ", // Use the music segment ID
          sort: "name,asc", // Sort the results by name in ascending order
          apikey: process.env.REACT_APP_TICKETMASTER_KEY, // Use the API key for Ticketmaster
        },
      }
    );

    Promise.all([setlistPromise, ticketmasterPromise])
      .then(([setlistResponse, ticketmasterResponse]) => {
        // Filters setlist data by concert date, only show concerts that already happened
        const noUpcomingConcert = setlistResponse.data.setlist.filter(item => {
          const [year, month, day] = item.eventDate.split("-");
          return Number(new Date(year, month - 1, day)) < Date.now();
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

        // Updates state with the favourite artist's name and last concert date
        setFavouritesConcerts((prev) => [
          ...prev,
          {
            artistname: favourite.artistname,
            lastConcert: uniqueSetlist[0].eventDate,
          },
        ]);

        // // Finds the Spotify link and image for the favourite artist
        // const ticketmasterMap =
        //   ticketmasterResponse.data._embedded.attractions.find(
        //     (item) => item.name === favourite.artistname
        //   );

        // const spotify = ticketmasterMap?.externalLinks?.spotify?.[0]?.url ?? null;

        // Filters for only attractions from events and sorts by concert date
        const ticketmasterEvents = ticketmasterResponse.data._embedded.events
          .flatMap(event => event._embedded.attractions || [])
          .filter(attraction => attraction.name === favourite.artistname)
          .sort((a, b) => a.dates.start.localDate.localeCompare(b.dates.start.localDate));

        const upcomingConcert = ticketmasterEvents?.[0]?.dates?.start?.localDate ?? null;

        // Updates state with the favourite artist's name and upcoming concert date
        setFavouritesTickets((prev) => [
          ...prev,
          {
            artistname: favourite.artistname,
            upcomingConcert,
          },
        ]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoadingfavourites(true);
    axios
      .get("http://localhost:4000/favourite", {
        headers: {
          token: token,
        },
      })
      .then((res) => {
        setLoadingfavourites(false);
        setFavourites(res.data);
      })
      .catch(() => {
        setLoadingfavourites(false);
      });
  }, []);

  useEffect(() => {
    favourites.map((item) => fetchDataByFavourite(item));
  }, [fetchDataByFavourite, favourites])

  library.add(fab, faHeart, faMusic, faTrash);

  return (
    <Router>
      <BackgroundImage />
      <div className="App">
        <Navbar setValue={setValue} />
        <Main
          setSetlist={setSetlist}
          setTicketmaster={setTicketmaster}
          setLat={setLat}
          setLong={setLong}
          value={value}
          setValue={setValue}
        />
        <Routes>
          <Route
            path="/favourite"
            element={
              <Favourites
                loadingfavourites={loadingfavourites}
                setFavourites={setFavourites}
                favourites={favourites}
                setlist={setlist}
                ticketmaster={ticketmaster}
                setGlobalSpotifyToken={setToken}
                favouritesConcerts={favouritesConcerts}
                favouritesTickets={favouritesTickets}
              />
            }
          ></Route>

          <Route
            path="/"
            element={
              <SearchPage
                favourites={favourites}
                setFavourites={setFavourites}
                setlist={[]}
                ticketmaster={[]}
              />
            }
          ></Route>

          <Route
            path="/search"
            element={
              <SearchPage
                favourites={favourites}
                setFavourites={setFavourites}
                setlist={setlist}
                ticketmaster={ticketmaster}
              />
            }
          ></Route>

          <Route
            path="artists/:artistId/concerts/:concertId"
            element={
              <ArtistPage
                setlist={setlist}
                ticketmaster={ticketmaster}
                lat={lat}
                long={long}
                token={token}
              />
            }
          ></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
