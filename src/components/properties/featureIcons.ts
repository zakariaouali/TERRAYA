import {
  Building, Building2, Car, Castle, ConciergeBell, Droplets, Dumbbell, Flower2, Landmark, Mountain,
  PawPrint, ShieldCheck, Smartphone, Snowflake, Sofa, Sparkles, Sun, Trees, Waves, House,
  type LucideIcon,
} from "lucide-react";

export const FEATURE_ICONS: Record<string, LucideIcon> = {
  pool: Waves,
  garden: Flower2,
  terrace: Sun,
  views: Mountain,
  hammam: Droplets,
  spa: Sparkles,
  gym: Dumbbell,
  furnished: Sofa,
  ac: Snowflake,
  smart_home: Smartphone,
  pets: PawPrint,
  parking: Car,
  staff: ConciergeBell,
  security: ShieldCheck,
};

export const TYPE_ICONS: Record<string, LucideIcon> = {
  VILLA: House,
  ESTATE: Castle,
  PENTHOUSE: Building2,
  RESIDENCE: Building,
  RIAD: Landmark,
  LAND: Trees,
};
