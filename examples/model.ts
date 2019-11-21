import { Model } from "use-graphile";

export const model: Model = {
  customer: {
    name: {
      type: "string"
    }
  },
  trip: {
    name: {
      type: "string"
    },
    customer: {
      type: "customer"
    },
    quotes: {
      type: "quote",
      multi: true
    }
  },
  quote: {
    id: { type: "uuid" },
    trip: {
      type: "trip",
      patchProperty: "tripToTripId"
    },
    summary: {
      type: "string"
    },
    quoteDays: {
      type: "quoteDay",
      multi: true,
      patchProperty: "quoteDaysUsingId"
    }
  },
  quoteDay: {
    order: { type: "number" },
    activitySummary: { type: "string" },
    activityDetail: { type: "string" },
    date: { type: "string" },
    quoteDayDestinationsByDayId: {
      type: "quoteDayDestinationsByDayId",
      multi: true,
      patchProperty: "quoteDayDestinationsUsingId"
    }
  },
  quoteDayDestinationsByDayId: {
    order: { type: "number" },
    destination: {
      type: "destination",
      patchProperty: "destinationToDestinationId"
    }
  },
  destination: {
    name: {
      type: "string"
    }
  }
};
