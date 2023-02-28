import { ticketFinder } from "../../helpers/selectors";

export default function UpcomingConcertList(props) {
  // Extracts the relevant events from the Ticketmaster API data based on the artist's name
  const ticketmasterEvents = props.ticketmaster.events
    ? props.ticketmaster.events
        .filter((item) => {
          // Filters out events that do not have any attractions or the artist's name does not match
          if (item._embedded.attractions !== undefined) {
            for (const attraction of item._embedded.attractions) {
              if (attraction.name === props.concert.artist.name) {
                return item;
              }
            }
          }
          return item;
        })
        // Sorts the events by start date
        .sort((a, b) => a.dates.start.localDate - b.dates.start.localDate)
    : [];

  // Converts the dates of the upcoming concerts to a readable format
  const upcomingConcerts = ticketmasterEvents.map((upcomingConcert) => {
    const str = upcomingConcert.dates.start.localDate;
    const [year, month, day] = str.split("-");
    const date = new Date(year, month - 1, day);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  });

  // Creates an array of upcoming concert items to render
  const mapConcerts =
    upcomingConcerts.length > 0
      ? upcomingConcerts
          .slice(0, 10) // Limits the number of items to 10
          .map((upcomingConcert, upcomingConcertIndex) => {
            const ticketArr = ticketFinder(props.ticketmaster);
            const ticketsUrl = ticketArr[upcomingConcertIndex];

            return (
              <UpcomingConcertListItem
                key={upcomingConcertIndex}
                ticketsUrl={ticketsUrl}
                upcomingConcert={upcomingConcert}
              />
            );
          })
      : [];

  return (
    <>
      {upcomingConcerts.length === 0 ? (
        "There are no upcoming concerts.\n Please come back later"
      ) : (
        // Renders the upcoming concert items
        mapConcerts
      )}
    </>
  );
}

function UpcomingConcertListItem(props) {
  // Renders an upcoming concert item with a clickable link to buy tickets
  return (
    <div className="upcoming-concerts-container">
      {props.upcomingConcert.split("-").reverse().join("-")}&ensp;
      <span
        className="get-tickets"
        onClick={() => window.open(props.ticketsUrl, "_blank")}
      >
        Get Tickets!
      </span>
    </div>
  );
}
