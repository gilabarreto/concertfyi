import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Defining the Setlist component and passing props
export default function Setlist(props) {
  // Extracting the list of songs from the props or setting it to an empty array if it is not present
  const songs = props.concert.sets.set[0]?.song || [];

  // Creating a new array of song names from the songs list
  const songsList = songs?.map((song) => {
    return song.name;
  });

  return (
    <>
      {/* A span to display the title of the setlist */}
      <span className="setlist-title">Setlist</span>
      {/* A unordered list to display the songs */}
      <ul className="setlist-songs-ul">
          {/* Displaying a message if there are no songs in the setlist, otherwise displaying the list of songs */}
          {songsList.length === 0
            ? "There are no songs in this setlist.\n Please come back later"
            : songsList.map((song, songIndex) => (
                <div className="setlist-songs" key={songIndex}>
                  {/* Displaying a FontAwesomeIcon before each song */}
                  <FontAwesomeIcon icon="fa-solid fa-music" />
                  {/* Displaying the name of the song */}
                  &ensp;{song}
                </div>
              ))}
      </ul>
    </>
  );
}

