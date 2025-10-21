import {
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { wishlistGroups } from "../schema/user-wishlist";

export const createWishListGroupZSchema = createInsertSchema(wishlistGroups);
export const updateWishListGroupZSchema = createUpdateSchema(wishlistGroups);
