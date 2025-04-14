// This function takes in a Ticketmaster data object and returns an array of ticket URLs
export function ticketFinder(ticketmasterData) {

  // Extract an array of upcoming concert dates
  const upcomingConcerts = ticketmasterData?.events?.map((upcomingConcert) => {
    return upcomingConcert.dates.start.localDate
  }).sort()

  // Map over the events and return an array of ticket URLs
  const tickets = ticketmasterData?.events?.map((upcomingConcert, index) => {

    // Check if the current event has the same date as the first upcoming concert
    if (upcomingConcert?.dates?.start?.localDate === upcomingConcerts[index]?.dates?.start?.localDate) {
      return null // If yes, return null
    }
    return upcomingConcert?.url // If not, return the ticket URL
  })

  return tickets // Return the array of ticket URLs
}

// This function takes in a Ticketmaster data object and returns the latitude of the venue for the first upcoming concert
export function latitudeFinder(ticketmasterData) {

  // Extract an array of upcoming concert dates
  const upcomingConcerts = ticketmasterData?.events?.map((upcomingConcert) => {
    return upcomingConcert.dates.start.localDate
  }).sort()

  // Find the event with the same date as the first upcoming concert and return its latitude
  const latitude = ticketmasterData?.events?.find((upcomingConcert) => {
    if (!upcomingConcerts[0]) { // Check if there is at least one upcoming concert
      return null
    }
    return upcomingConcert.dates.start.localDate === upcomingConcerts[0]
  })

  const result = latitude?._embedded?.venues[0].location.latitude

  return result; // Return the latitude
}

// This function takes in a Ticketmaster data object and returns the longitude of the venue for the first upcoming concert
export function longitudeFinder(ticketmasterData) {

  // Extract an array of upcoming concert dates
  const upcomingConcerts = ticketmasterData?.events?.map((upcomingConcert) => {
    return upcomingConcert.dates.start.localDate
  }).sort()

  // Find the event with the same date as the first upcoming concert and return its longitude
  const longitude = ticketmasterData?.events?.find((upcomingConcert) => {
    if (!upcomingConcerts[0]) { // Check if there is at least one upcoming concert
      return null
    }
    return upcomingConcert.dates.start.localDate === upcomingConcerts[0]
  })

  const result = longitude?._embedded?.venues[0].location.longitude

  return result; // Return the longitude
}
