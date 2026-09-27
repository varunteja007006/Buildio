import { Database, Droplets, File, Leaf, type LucideIcon } from "lucide-react";

export type ConnectionTypeOption = {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
};

export const connectionTypeOptions: ConnectionTypeOption[] = [
  {
    value: "postgres",
    label: "PostgreSQL",
    description: "Connect to a PostgreSQL server.",
    icon: Database,
    enabled: true,
  },
  {
    value: "mongodb",
    label: "MongoDB",
    description: "Connect to a MongoDB server.",
    icon: Leaf,
    enabled: true,
  },
  {
    value: "mysql",
    label: "MySQL",
    description: "Connect to a MySQL server.",
    icon: Droplets,
    enabled: false,
  },
  {
    value: "sqlite",
    label: "SQLite",
    description: "Upload a SQLite database file.",
    icon: File,
    enabled: false,
  },
];
