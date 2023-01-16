import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

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
  const [lat, setLat] = useState([]);
  const [long, setLong] = useState([]);
  const [token, setToken] = useState("");
  const [value, setValue] = useState("");
  const [favourites, setFavourites] = useState([]);
  const [loadingfavourites, setLoadingfavourites] = useState(false);
  const [favouritesConcerts, setFavouritesConcerts] = useState([]);
  const [favouritesTickets, setFavouritesTickets] = useState([]);

  const fetchDataByFavourite = (favourite) => {
    const setlistPromise = axios
      //GET Request Setlist
      .get("/rest/1.0/search/setlists", {
        params: {
          artistName: `"${favourite.artistname}"`,
          p: "1",
        },
        headers: {
          Accept: "application/json",
          "x-api-key": process.env.REACT_APP_SETLIST_KEY,
        },
      });

    const ticketmasterPromise = axios.get(
      "https://app.ticketmaster.com/discovery/v2/suggest",
      {
        params: {
          keyword: `"${favourite.artistname}"`,
          segmentId: "KZFzniwnSyZfZ7v7nJ",
          sort: "name,asc",
          apikey: process.env.REACT_APP_TICKETMASTER_KEY,
        },
      }
    );

    Promise.all([setlistPromise, ticketmasterPromise])
      .then(([setlistResponse, ticketmasterResponse]) => {
        //Filters setlist data by concert date, only show concerts that already happened
        const noUpcomingConcert = setlistResponse.data.setlist.filter(
          (item) => {
            const [day, month, year] = item.eventDate.split("-");
            const date = new Date(year, month - 1, day);

            if (Number(date) > Number(new Date())) {
              return false;
            }
            return true;
          }
        );

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

        setFavouritesConcerts((prev) => [
          ...prev,
          {
            artistname: favourite.artistname,
            lastConcert: uniqueSetlist[0].eventDate,
          },
        ]);

        //Find spotify link and image for specific artist
        const ticketmasterMap =
          ticketmasterResponse.data._embedded.attractions.find(
            (item) => item.name === favourite.artistname
          );

        let spotify = null;
        if (
          ticketmasterMap &&
          ticketmasterMap.externalLinks &&
          ticketmasterMap.externalLinks.spotify
        ) {
          spotify = ticketmasterMap.externalLinks.spotify[0].url;
        }

        // Filter for only attractions from events
        const ticketmasterEvents = ticketmasterResponse.data._embedded.events
          .filter((item) => {
            if (item._embedded.attractions !== undefined) {
              for (const attraction of item._embedded.attractions) {
                if (attraction.name === favourite.artistname) {
                  return item;
                }
              }
            }
          })
          .sort((a, b) => a.dates.start.localDate - b.dates.start.localDate);

        let upcomingConcert = null;

        if (ticketmasterEvents[0] && ticketmasterEvents[0].dates) {
          upcomingConcert = ticketmasterEvents[0].dates.start.localDate;
        }
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
  };

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
        // res.data.map((item) => fetchDataByFavourite(item));
      })
      .catch(() => {
        setLoadingfavourites(false);
      });
  }, []);

  useEffect(() => {
    favourites.map((item) => fetchDataByFavourite(item));
  }, [favourites])

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
