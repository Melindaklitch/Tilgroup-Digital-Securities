export interface Asset {
  key: string;
  nameKey: string;
  typeKey: string;
  spotlightKey: string;
  price: number;
  image: string;

  quantity?: number;

  translatedName?: string;
  displayName?: string;

  physicalDetails?: Record<string, string>;

  [key: string]: any;
}
