import { Address } from "./Address.model";

export type User = {
  id?: string; // UUID as string
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?:string;
  phoneNumber?: string;
  nationalId?: string;
  nICVerified?: boolean;
  emailVerified?: boolean;
  status?:  'ACTIVE' | 'INACTIVE' | 'BANNED'; // adjust to match your `Status` enum
  profilePicUrl?: string;
  createdAt?:Date;
  totalRating?: number;
  ratingCount?: number;
  totalRentals?: number;
  totalEarnings?: number;
  totalReviews?:number;
  responseRate?:number;
  location?:Location;
  gender?:string;
  address?:Address;
  dateOfBirth?:Date,
  website?:string,
  reports?:number,
  role?:string,
  menuOpen?:boolean

}
