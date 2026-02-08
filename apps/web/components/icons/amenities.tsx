import type { ComponentType } from "react";
import {
  Wifi,
  Car,
  Snowflake,
  Tv,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Microwave,
  Refrigerator,
  WashingMachine,
  Droplets,
  ShieldCheck,
  Lock,
  Briefcase,
  BedDouble,
  Bath,
  Wind,
  Coffee,
  Baby,
  Dog,
  CigaretteOff,
  Users,
  MapPin,
  Sparkles,
  Flame,
  PlugZap,
  KeyRound,
  Clock,
  Building2,
  TreePalm,
  Sun,
  LifeBuoy,
  Lamp,
  Music,
  Camera,
  Sofa,
  LampDesk,
  ConciergeBell,
  CircleHelp,
} from "lucide-react";

export type AmenityKey =
  | "WIFI"
  | "PARKING_FREE"
  | "PARKING_PAID"
  | "AIR_CONDITIONING"
  | "HEATING"
  | "TV"
  | "POOL"
  | "GYM"
  | "KITCHEN"
  | "MICROWAVE"
  | "REFRIGERATOR"
  | "WASHER"
  | "DRYER"
  | "HOT_WATER"
  | "ELEVATOR"
  | "SECURITY"
  | "DOORMAN"
  | "LOCK"
  | "WORKSPACE"
  | "FAMILY_FRIENDLY"
  | "PET_FRIENDLY"
  | "NO_SMOKING"
  | "SLEEPS"
  | "BEDROOMS"
  | "BATHROOMS"
  | "LOCATION"
  | "HOUSEKEEPING"
  | "BALCONY"
  | "SEA_VIEW"
  | "CITY_VIEW"
  | "24H_CHECKIN"
  | "CHECKIN_TIME"
  | "CHECKOUT_TIME"
  | "FIRE_EXTINGUISHER"
  | "SMOKE_ALARM"
  | "FIRST_AID"
  | "WIFI_BACKUP"
  | "COFFEE"
  | "SOUND_SYSTEM"
  | "CCTV"
  | "SOFA"
  | "DESK"
  | "CONCIERGE"
  | "OTHER";

export type AmenityMeta = {
  key: AmenityKey;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

const OTHER: AmenityMeta = {
  key: "OTHER",
  label: "Amenity",
  Icon: CircleHelp,
};

export const AMENITY_CATALOG: Record<AmenityKey, AmenityMeta> = {
  WIFI: { key: "WIFI", label: "Wi-Fi", Icon: Wifi },
  WIFI_BACKUP: { key: "WIFI_BACKUP", label: "Wi-Fi backup", Icon: PlugZap },

  PARKING_FREE: { key: "PARKING_FREE", label: "Free parking", Icon: Car },
  PARKING_PAID: { key: "PARKING_PAID", label: "Paid parking", Icon: Car },

  AIR_CONDITIONING: { key: "AIR_CONDITIONING", label: "Air conditioning", Icon: Snowflake },
  HEATING: { key: "HEATING", label: "Heating", Icon: Flame },

  TV: { key: "TV", label: "TV", Icon: Tv },

  POOL: { key: "POOL", label: "Pool", Icon: Waves },
  GYM: { key: "GYM", label: "Gym", Icon: Dumbbell },

  KITCHEN: { key: "KITCHEN", label: "Kitchen", Icon: UtensilsCrossed },
  MICROWAVE: { key: "MICROWAVE", label: "Microwave", Icon: Microwave },
  REFRIGERATOR: { key: "REFRIGERATOR", label: "Refrigerator", Icon: Refrigerator },

  WASHER: { key: "WASHER", label: "Washer", Icon: WashingMachine },
  DRYER: { key: "DRYER", label: "Dryer", Icon: Wind },
  HOT_WATER: { key: "HOT_WATER", label: "Hot water", Icon: Droplets },

  ELEVATOR: { key: "ELEVATOR", label: "Elevator", Icon: Building2 },

  SECURITY: { key: "SECURITY", label: "Building security", Icon: ShieldCheck },
  DOORMAN: { key: "DOORMAN", label: "Doorman", Icon: KeyRound },
  CCTV: { key: "CCTV", label: "CCTV", Icon: Camera },
  SMOKE_ALARM: { key: "SMOKE_ALARM", label: "Smoke alarm", Icon: Lamp },
  FIRE_EXTINGUISHER: { key: "FIRE_EXTINGUISHER", label: "Fire extinguisher", Icon: LifeBuoy },
  FIRST_AID: { key: "FIRST_AID", label: "First aid kit", Icon: ShieldCheck },

  LOCK: { key: "LOCK", label: "Smart lock", Icon: Lock },

  WORKSPACE: { key: "WORKSPACE", label: "Dedicated workspace", Icon: Briefcase },
  DESK: { key: "DESK", label: "Desk", Icon: LampDesk },

  FAMILY_FRIENDLY: { key: "FAMILY_FRIENDLY", label: "Family friendly", Icon: Baby },
  PET_FRIENDLY: { key: "PET_FRIENDLY", label: "Pet friendly", Icon: Dog },
  NO_SMOKING: { key: "NO_SMOKING", label: "No smoking", Icon: CigaretteOff },

  SLEEPS: { key: "SLEEPS", label: "Guests", Icon: Users },
  BEDROOMS: { key: "BEDROOMS", label: "Bedrooms", Icon: BedDouble },
  BATHROOMS: { key: "BATHROOMS", label: "Bathrooms", Icon: Bath },

  LOCATION: { key: "LOCATION", label: "Location", Icon: MapPin },
  HOUSEKEEPING: { key: "HOUSEKEEPING", label: "Housekeeping", Icon: Sparkles },
  BALCONY: { key: "BALCONY", label: "Balcony", Icon: TreePalm },
  SEA_VIEW: { key: "SEA_VIEW", label: "Sea view", Icon: Sun },
  CITY_VIEW: { key: "CITY_VIEW", label: "City view", Icon: Building2 },

  COFFEE: { key: "COFFEE", label: "Coffee", Icon: Coffee },
  SOUND_SYSTEM: { key: "SOUND_SYSTEM", label: "Sound system", Icon: Music },
  SOFA: { key: "SOFA", label: "Sofa", Icon: Sofa },

  CONCIERGE: { key: "CONCIERGE", label: "Concierge", Icon: ConciergeBell },

  "24H_CHECKIN": { key: "24H_CHECKIN", label: "24-hour check-in", Icon: Clock },
  CHECKIN_TIME: { key: "CHECKIN_TIME", label: "Check-in time", Icon: Clock },
  CHECKOUT_TIME: { key: "CHECKOUT_TIME", label: "Check-out time", Icon: Clock },

  OTHER,
};

export function normalizeAmenityKey(input: string): AmenityKey {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "_");
  return (Object.prototype.hasOwnProperty.call(AMENITY_CATALOG, cleaned)
    ? (cleaned as AmenityKey)
    : "OTHER");
}

export function getAmenityMeta(input: string): AmenityMeta {
  const key = normalizeAmenityKey(input);
  if (key === "OTHER") return { ...OTHER, label: input.trim() || OTHER.label };
  return AMENITY_CATALOG[key];
}
