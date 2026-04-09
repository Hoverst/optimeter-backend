export type UtilityType = "electricity" | "gas" | "water";

export interface Home {
  id: string;
  name: string;
  address: string;
  userId: string;
  createdAt: string;
}

export interface MeterReading {
  id: string;
  homeId: string;
  utility: UtilityType;
  value: number;
  readingAt: string;
  createdAt: string;
}