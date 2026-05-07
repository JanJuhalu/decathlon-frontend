import type { Tulemus } from "./Tulemus";

export type Sportlane = {
  id?: number;
  nimi: string;
  riik: string;
  tulemused?: Tulemus[];
}