import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
});

export const createRoomSchema = z.object({
  roomName: z.string().min(1, "Room name is required").max(100, "Room name must be less than 100 characters"),
});