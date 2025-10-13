import * as contactUsSchema from "./contact-us.schema";
import * as authSchema from "./auth-schema";
import * as userDetailsSchema from "./user-details";
import * as userWishListGroupsSchema from "./wishlist-groups";

export const schema = {
  ...contactUsSchema,
  ...authSchema,
  ...userDetailsSchema,
  ...userWishListGroupsSchema,
};
