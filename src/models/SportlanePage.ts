import type { Sportlane } from "./Sportlane";

export type SportlanePage = {
  content: Sportlane[];
  totalPages: number;
  totalElements: number;
  number: number;
  first: boolean;
  last: boolean;
}