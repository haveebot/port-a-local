import type { Business } from "@palocal/data/businesses";

export type BrowseStackParamList = {
  Home: undefined;
  Category: { slug: string };
  Business: { slug: string; preview?: Business };
  WebPage: { url: string; title: string };
};

export type ServicesStackParamList = {
  ServicesHub: undefined;
  Service: { slug: ServiceSlug };
  // Native deliver flow
  DeliverHome: undefined;
  Restaurant: { slug: string };
  Cart: undefined;
  Checkout: undefined;
  PayWeb: { url: string; orderId: string };
  OrderSuccess: { orderId: string };
};

export type AccountStackParamList = {
  AccountHome: undefined;
  Settings: undefined;
};

export type RootTabParamList = {
  Browse: undefined;
  Services: undefined;
  Search: undefined;
  Account: undefined;
};

export type ServiceSlug =
  | "deliver"
  | "maintenance"
  | "rent"
  | "beach"
  | "locals"
  | "wheelhouse"
  | "fishing-report"
  | "gully";

export interface ServiceDef {
  slug: ServiceSlug;
  title: string;
  tagline: string;
  webPath: string;
  icon: string; // ionicon name
  accent: "coral" | "gold" | "ocean" | "seafoam" | "sunset";
}

export const SERVICES: ServiceDef[] = [
  {
    slug: "deliver",
    title: "Deliver",
    tagline: "Local food, to your beach house",
    webPath: "/deliver",
    icon: "fast-food",
    accent: "coral",
  },
  {
    slug: "maintenance",
    title: "Maintenance",
    tagline: "Plumbing, AC, repairs — same day",
    webPath: "/maintenance",
    icon: "construct",
    accent: "gold",
  },
  {
    slug: "rent",
    title: "Golf Cart Rentals",
    tagline: "Get around the island, your way",
    webPath: "/rent",
    icon: "car-sport",
    accent: "ocean",
  },
  {
    slug: "beach",
    title: "Beach Gear",
    tagline: "Chairs, umbrellas, kayaks — delivered",
    webPath: "/beach",
    icon: "umbrella",
    accent: "sunset",
  },
  {
    slug: "fishing-report",
    title: "Fishing Report",
    tagline: "Daily intel from the jetty and offshore",
    webPath: "/fishing-report",
    icon: "fish",
    accent: "ocean",
  },
  {
    slug: "locals",
    title: "Locals Network",
    tagline: "Off-market homes, services, deals",
    webPath: "/locals",
    icon: "people",
    accent: "seafoam",
  },
];
