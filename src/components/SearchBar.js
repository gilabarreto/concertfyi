import React, { useEffect, useCallback } from "react";
import useDebounce from "../hooks/useDebounce";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./SearchBar.css";

export default function SearchBar(props) {
  const { value, setValue, setSetlist, setTicketmaster } = props;
  const navigate = useNavigate();
  const { artistId } = useParams();

  const handleChange = (event) => {
    if (artistId) {
      navigate("/search");
    }
    setValue(event.target.value);
  };

  const term = useDebounce(value, 700);

  const fetchData = useCallback(() => {
    console.log("🔍 Buscando dados para:", value);

    const setlistPromise = axios.get("/setlist/rest/1.0/search/setlists", {
      params: {
        artistName: value,
        p: "1",
      },
      headers: {
        Accept: "application/json",
        "x-api-key": process.env.REACT_APP_SETLIST_KEY,
      },
    });

    const ticketmasterPromise = axios.get("/ticketmaster/discovery/v2/suggest", {
      params: {
        keyword: value,
        segmentId: "KZFzniwnSyZfZ7v7nJ",
        sort: "name,asc",
        apikey: process.env.REACT_APP_TICKETMASTER_KEY,
      },
    });

    Promise.all([setlistPromise, ticketmasterPromise])
      .then(([setlistResponse, ticketmasterResponse]) => {
        const setlists = setlistResponse.data.setlist || [];
        const ticketmasterData = ticketmasterResponse.data._embedded || {};

        console.log("🎵 Setlist API response:", setlists);
        console.log("🎫 Ticketmaster API response:", ticketmasterData);

        setSetlist(setlists);
        setTicketmaster(ticketmasterData);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
      });
  }, [value, setSetlist, setTicketmaster]);

  useEffect(() => {
    if (term.length === 0) return;
    fetchData();
  }, [term, fetchData]);

  return (
    <div className="search">
      <form className="input-container" onSubmit={(event) => event.preventDefault()}>
        <input
          className="input-text-search"
          type="search"
          value={value}
          placeholder="Search your favorite artist here and find your next adventure"
          onChange={handleChange}
        />
      </form>
    </div>
  );
}