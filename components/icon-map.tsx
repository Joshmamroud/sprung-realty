import {
  Award,
  Briefcase,
  Building2,
  MapPin,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/payload/defaults";

const ICONS: Record<IconName, LucideIcon> = {
  Award,
  Briefcase,
  Building2,
  MapPin,
  Target,
  TrendingUp,
  Users,
};

export function getIcon(name: IconName | string | null | undefined): LucideIcon {
  if (!name) return Building2;
  return (ICONS as Record<string, LucideIcon>)[name] ?? Building2;
}
