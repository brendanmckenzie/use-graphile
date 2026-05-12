import { Model, MutationRegistry } from "use-graphile";

export const model: Model = {
  Customer: {
    name: { type: "string" },
  },
  Trip: {
    name: { type: "string" },
    customer: { type: "Customer", foreignKey: "customerId" },
    tripFlights: {
      type: "TripFlight",
      multi: true,
      foreignKey: "tripId",
    },
  },
  TripFlight: {
    carrier: { type: "string" },
    number: { type: "string" },
    departure: { type: "datetime" },
    arrival: { type: "datetime" },
    departureAirport: { type: "Airport", foreignKey: "departureAirportId" },
    arrivalAirport: { type: "Airport", foreignKey: "arrivalAirportId" },
  },
  Airport: {
    name: { type: "string" },
  },
};

export const registry: MutationRegistry = {
  Trip: {
    update: { mutation: "updateTrip", patchType: "TripPatch" },
    create: { mutation: "createTrip", inputKey: "trip", inputType: "TripInput" },
  },
  TripFlight: {
    create: {
      mutation: "createTripFlight",
      inputKey: "tripFlight",
      inputType: "TripFlightInput",
    },
    update: { mutation: "updateTripFlight", patchType: "TripFlightPatch" },
    delete: { mutation: "deleteTripFlight" },
  },
};
