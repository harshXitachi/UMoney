export interface DashboardStats {
  todayDeposit: number;
  totalDeposit: number;
  totalCommission: number;
  commissionYesterday: number;
  teamCount: number;
  commissionToday: number;
  todayNewTeam: number;
}

export interface TeamMember {
  id: string;
  level: number;
  count: number;
  rate: string;
  amount: number;
}

export enum SocialPlatform {
  FACEBOOK = 'Facebook',
  TELEGRAM = 'Telegram',
  WHATSAPP = 'WhatsApp',
  QR_CODE = 'QR Code',
  SHARE = 'Share'
}

export interface LinkedAccount {
  provider: 'PhonePe' | 'Google Pay' | 'Paytm';
  upiId: string;
  status: 'VERIFIED' | 'PENDING' | 'FAILED';
  operateEnabled: boolean;
  linkedAt: any;
}

export interface UserLocation {
  ip: string;
  city: string;
  region: string;
  country: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  phone?: string;
  inrBalance: number;
  usdtBalance: number;
  referralCode: string;
  referrerId?: string;
  createdAt: any;
  linkedAccount?: LinkedAccount;
  
  // Admin/Security Fields
  isBanned?: boolean;
  banExpires?: number; // Timestamp
  lastLocation?: UserLocation;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT_INR' | 'DEPOSIT_USDT' | 'WITHDRAW';
  amount: number;
  amountInr?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: any;
  utr?: string;
  description?: string;
  // Snapshot of user details at time of tx
  userEmail?: string; 
}

export interface SystemSettings {
  usdtRate: number;
  maintenanceMode: boolean;
  adminUpi: string;
  adminQrCode: string; // URL
  inrPaymentEnabled: boolean;
  usdtPaymentEnabled: boolean;
}