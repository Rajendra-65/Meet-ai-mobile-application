import { createLoader, parseAsInteger , parseAsString } from "nuqs/server";
import { DEFAULT_PAGE } from "@/constants";

export const FilterSearchParams =  {
        search : parseAsString.withDefault("").withOptions({
            clearOnDefault : true
        }),
        page : parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({
            clearOnDefault : true
        })
}

export const loadSearchParams = createLoader(FilterSearchParams)