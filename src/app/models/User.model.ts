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
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED'; // adjust to match your `Status` enum
  profilePicUrl?: string; // Or `Blob | null` if you're returning it directly
  createdAt?:Date;
  totalRating?: number;
  ratingCount?: number;
  totalRentals?: number;
  totalEarnings?: number;
  totalReviews?:number;
  responseRate?:number;
  location?:Location;
}
