import React, { useEffect } from "react";
import useDebounce from "../hooks/useDebounce";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./SearchBar.css";

export default function SearchBar(props) {
  // Get the artist ID from the URL using useParams hook
  let artistId = useParams();

  const { value, setValue } = props;
  const navigate = useNavigate();

  // Function to handle changes to the search input
  const handleChange = (event) => {
    // If there is an artist ID in the URL, navigate to the search page
    if (artistId) {
      navigate("/search");
    }
    // Update the value of the search input
    setValue(event.target.value);
  };

  // Debounce the value of the search input
  const term = useDebounce(value, 700);

  // Function to fetch data from the Setlist API and the Ticketmaster API
  const fetchData = () => {
    // Send a GET request to the Setlist API with the artist name and page number as parameters
    const setlistPromise = axios.get("/rest/1.0/search/setlists", {
      params: {
        artistName: `"${value}"`,
        p: "1",
      },
      // Set the headers to include the API key
      headers: {
        Accept: "application/json",
        "x-api-key": process.env.REACT_APP_SETLIST_KEY,
      },
    });

    // Send a GET request to the Ticketmaster API with the search keyword, segment ID, sort order, and API key as parameters
    const ticketmasterPromise = axios.get(
      "https://app.ticketmaster.com/discovery/v2/suggest",
      {
        params: {
          keyword: `"${value}"`,
          segmentId: "KZFzniwnSyZfZ7v7nJ",
          sort: "name,asc",
          apikey: process.env.REACT_APP_TICKETMASTER_KEY,
        },
      }
    );

    Promise.all([setlistPromise, ticketmasterPromise])
      .then(([setlistResponse, ticketmasterResponse]) => {
        // Update the setlist and ticketmaster state with the data returned from the API requests
        props.setSetlist(setlistResponse.data.setlist);
        props.setTicketmaster(ticketmasterResponse.data._embedded);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // useEffect hook to fetch data from the APIs whenever the term changes
  useEffect(() => {
    // If the search input is empty, don't fetch data
    if (term.length === 0) {
      return;
    }
    // Fetch data from the APIs
    fetchData();
  }, [term]);

  return (
    <div className="search">
      <form
        className="input-container"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          className="input-text-search"
          type="search"
          value={value}
          placeholder="Search your favorite artist here and find your next adventure"
          onChange={handleChange}
        ></input>
      </form>
    </div>
  );
}