export interface IShop {
  id: number;
  name: string;
  description: string;
  note: string;
  contact_number: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  owner: number;
  company: number;
}
