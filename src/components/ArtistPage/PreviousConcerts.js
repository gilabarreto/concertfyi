import { useNavigate } from "react-router-dom";

export default function PreviousConcerts(props) {
  const navigate = useNavigate();

  const filteredConcerts = props.setlist
    .filter((item) => item.artist.mbid === props.artistId)
    .filter((concert) => {
      const [day, month, year] = concert.eventDate.split("-");
      const date = new Date(year, month - 1, day);
      return date < new Date(); // Só shows passados
    })
    .slice(0, 10); // Limita aos 10 mais recentes

  return (
    <>
      {filteredConcerts.map((concert) => {
        const [day, month, year] = concert.eventDate.split("-");
        const date = new Date(year, month - 1, day);
        const options = { year: "numeric", month: "long", day: "numeric" };

        const city = concert.venue.city?.name;
        const state = concert.venue.city?.state;
        const country = concert.venue.city?.country.code;

        const concertLabel = `${date.toLocaleDateString(
          "en-US",
          options
        )} (${city}, ${state}, ${country})`;

        return (
          <span className="prevConc-list" key={concert.id}>
            <span
              className="prevConc"
              onClick={() =>
                navigate(`/artists/${props.artistId}/concerts/${concert.id}`)
              }
            >
              {concertLabel}
            </span>
          </span>
        );
      })}
    </>
  );
}
