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
  const [setlist, setSetlist] = useState([]);
  const [ticketmaster, setTicketmaster] = useState([]);
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [token, setToken] = useState("");
  const [value, setValue] = useState("");
  const [favourites, setFavourites] = useState([]);
  const [loadingfavourites, setLoadingfavourites] = useState(false);
  const [favouritesConcerts, setFavouritesConcerts] = useState([]);
  const [favouritesTickets, setFavouritesTickets] = useState([]);

  const fetchDataByFavourite = useCallback((favourite) => {
    const setlistPromise = axios.get("/setlist/rest/1.0/search/setlists", {
      params: {
        artistName: favourite.artistname,
        p: "1",
      },
      headers: {
        Accept: "application/json",
        "x-api-key": process.env.REACT_APP_SETLIST_KEY,
      },
    });

    const ticketmasterPromise = axios.get("/ticketmaster/discovery/v2/suggest", {
      params: {
        keyword: favourite.artistname,
        segmentId: "KZFzniwnSyZfZ7v7nJ",
        sort: "name,asc",
        apikey: process.env.REACT_APP_TICKETMASTER_KEY,
      },
    });

    Promise.all([setlistPromise, ticketmasterPromise])
      .then(([setlistResponse, ticketmasterResponse]) => {
        const filteredSetlist = setlistResponse.data.setlist?.filter(item => {
          const [day, month, year] = item.eventDate.split("-");
          return new Date(`${year}-${month}-${day}`) < new Date();
        }) || [];

        const uniqueArtists = [];
        const uniqueSetlist = filteredSetlist.filter(item => {
          if (!uniqueArtists.includes(item.artist.mbid)) {
            uniqueArtists.push(item.artist.mbid);
            return true;
          }
          return false;
        });

        setFavouritesConcerts(prev => ([
          ...prev,
          {
            artistname: favourite.artistname,
            lastConcert: uniqueSetlist[0]?.eventDate || null,
          }
        ]));

        const events = ticketmasterResponse.data._embedded?.events || [];
        const nextEvent = events.find(event =>
          event._embedded?.attractions?.some(a => a.name === favourite.artistname)
        );

        setFavouritesTickets(prev => ([
          ...prev,
          {
            artistname: favourite.artistname,
            upcomingConcert: nextEvent?.dates?.start?.localDate || null,
          }
        ]));
      })
      .catch(err => console.error("Erro ao buscar dados por favorito:", err));
  }, []);

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    setLoadingfavourites(true);
    axios.get("http://localhost:4000/favourite", {
      headers: { token: localToken },
    })
      .then(res => {
        setFavourites(res.data);
        setLoadingfavourites(false);
      })
      .catch(() => setLoadingfavourites(false));
  }, []);

  useEffect(() => {
    if (favourites.length) {
      favourites.forEach(fetchDataByFavourite);
    }
  }, [fetchDataByFavourite, favourites]);

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
          />

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
          />

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
          />

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
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;