import {
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Zap,
  HeartPulse,
  Plane,
  GraduationCap,
  Gamepad2,
  Briefcase,
  PiggyBank,
  MoreHorizontal,
  Coffee,
  Smartphone,
  Wifi,
  Music,
  Film,
  Gift,
  Hammer,
  Landmark,
  LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  shopping: ShoppingBag,
  food: Utensils,
  dining: Utensils,
  groceries: ShoppingBag,
  transport: Car,
  transportation: Car,
  housing: Home,
  rent: Home,
  utilities: Zap,
  bills: Zap,
  health: HeartPulse,
  medical: HeartPulse,
  travel: Plane,
  education: GraduationCap,
  entertainment: Gamepad2,
  salary: Briefcase,
  income: Briefcase,
  savings: PiggyBank,
  investment: Landmark,
  coffee: Coffee,
  phone: Smartphone,
  internet: Wifi,
  subscriptions: Music,
  movies: Film,
  gifts: Gift,
  maintenance: Hammer,
  other: MoreHorizontal,
};

export function getCategoryIcon(categoryName: string | undefined | null): LucideIcon {
  if (!categoryName) return MoreHorizontal;
  
  const normalized = categoryName.toLowerCase().trim();
  
  // Direct match
  if (categoryIcons[normalized]) {
    return categoryIcons[normalized];
  }
  
  // Partial match (simple heuristic)
  for (const key in categoryIcons) {
    if (normalized.includes(key)) {
      return categoryIcons[key] as LucideIcon;
    }
  }
  
  return MoreHorizontal;
}

export function getCategoryColor(categoryName: string | undefined | null): string {
    if (!categoryName) return "bg-gray-100 text-gray-600";
    
    const normalized = categoryName.toLowerCase().trim();
    
    // Map categories to tailwind color classes (bg and text)
    // We'll return a string of classes
    if (['food', 'dining', 'coffee'].some(k => normalized.includes(k))) return "bg-orange-100 text-orange-600";
    if (['transport', 'car', 'fuel'].some(k => normalized.includes(k))) return "bg-blue-100 text-blue-600";
    if (['housing', 'rent', 'utilities'].some(k => normalized.includes(k))) return "bg-indigo-100 text-indigo-600";
    if (['health', 'medical'].some(k => normalized.includes(k))) return "bg-red-100 text-red-600";
    if (['salary', 'income', 'savings'].some(k => normalized.includes(k))) return "bg-green-100 text-green-600";
    if (['entertainment', 'movies', 'games'].some(k => normalized.includes(k))) return "bg-purple-100 text-purple-600";
    if (['shopping', 'gifts'].some(k => normalized.includes(k))) return "bg-pink-100 text-pink-600";
    
    return "bg-gray-100 text-gray-600";
}
