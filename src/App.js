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

import SpotifyAuth from "./components/SpotifyAuth";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
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
        // console.log("res.data:", res.data);
        setLoadingfavourites(false);
        setFavourites(res.data);
      })
      .catch(() => {
        setLoadingfavourites(false);
      });
  }, []);

  library.add(fab, faHeart);

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
              />
            }
          ></Route>
          {/* <Route
            path="/"
            element={
              <>
                <Main
                  setSetlist={setSetlist}
                  setTicketmaster={setTicketmaster}
                  setLat={setLat}
                  setLong={setLong}
                  value={value}
                  setValue={setValue}
                  setlist={setlist}
                  ticketmaster={ticketmaster}
                />
              </>
            }
          ></Route> */}

          <Route
            path="/search"
            element={
              <> 
              <div className="column-labels">
              <div className="next-concert">Next concert</div>
              <div className="last-concert">Last concert</div>
              <div className="play-now">Play now</div>
              </div>
                <SearchPage
                  favourites={favourites}
                  setFavourites={setFavourites}
                  setlist={setlist}
                  ticketmaster={ticketmaster}
                />
              </>
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
