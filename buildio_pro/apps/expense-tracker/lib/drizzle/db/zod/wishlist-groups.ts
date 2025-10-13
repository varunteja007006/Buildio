import {
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { wishlistGroups } from "../schema/wishlist-groups";

export const createWishListGroupZSchema = createInsertSchema(wishlistGroups);
export const updateWishListGroupZSchema = createUpdateSchema(wishlistGroups);
