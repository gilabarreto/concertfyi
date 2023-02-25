import { useNavigate } from "react-router-dom";

// PreviousConcerts component that takes in a setlist and artistId as props and displays a list of previous concerts
export default function PreviousConcerts(props) {
  // Use the useNavigate hook from the react-router-dom library to navigate to different pages
  const navigate = useNavigate();
  
  // Render a list of up to 10 previous concerts for the artist, filtered by artistId
  return (
    <>
      {
        // Filter setlist by artist id
        props.setlist
          .filter((item) => item.artist.mbid === props.artistId)
          .map((concert) => {
            // Parse the event date string into a date object
            const str = concert.eventDate;
            const [day, month, year] = str.split("-");
            const date = new Date(year, month - 1, day);
            
            // Define the options for the date format
            const options = {
              year: "numeric",
              month: "long",
              day: "numeric",
            };
            
            // Get the city, state, and country code for the venue
            const city = concert.venue.city?.name;
            const state = concert.venue.city?.state;
            const country = concert.venue.city?.country.code;
            
            // Only display concerts that have already happened
            if (new Date(date) < new Date()) {
              const concertLabel = `${date.toLocaleDateString(
                "en-US",
                options
              )} (${city}, ${state}, ${country})`;
              
              // Render a clickable span that navigates to the concert details page when clicked
              return (
                <span className="prevConc-list" key={concertLabel}>
                  <span
                    className="prevConc"
                    onClick={() => {
                      navigate(`/artists/${props.artistId}/concerts/${concert.id}`);
                    }}
                  >
                    {concertLabel}
                  </span>
                </span>
              );
            }
          })
          // Limit the list to the 10 most recent concerts
          .slice(0, 10)
      }
    </>
  );
}