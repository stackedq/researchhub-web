import { ValueOf } from "../../../../config/types/root_types";

export const NEW_SOURCE_BODY_TYPES = {
  NEW_PAPAER_UPLOAD: "NEW_PAPAER_UPLOAD",
  SEARCH: "SEARCH",
  STAND_BY: "STAND_BY",
};

export type BodyTypeVals = ValueOf<typeof NEW_SOURCE_BODY_TYPES>;
