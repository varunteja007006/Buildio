import * as contactUsSchema from "./contact-us.schema";
import * as authSchema from "./auth-schema";
import * as userDetailsSchema from "./user-details";
import * as userWishlistSchema from "./user-wishlist";

export const schema = {
  ...contactUsSchema,
  ...authSchema,
  ...userDetailsSchema,
  ...userWishlistSchema,
};
