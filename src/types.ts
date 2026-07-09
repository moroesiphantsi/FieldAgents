// src/types.ts

// Priority type
export type Priority = "Low" | "Medium" | "High";

// Violation types
export type ViolationType =
  | "Speeding"
  | "Reckless Driving"
  | "Drunk Driving"
  | "Unroadworthy Vehicle"
  | "Illegal Parking"
  | "Other";

// Report statuses
export type ReportStatus = "Submitted" | "Under Review" | "Resolved" | "Rejected"| "Pending" | "Under Review" | "Resolved" | "Actioned" | "Dismissed";


// Media items
export interface ViolationMediaItem {
  url: string;
  type: "image" | "video";
}

// Location info
export interface Location {
  lat: number | null;
  lng: number | null;
}

// Main report
export interface ViolationReport {
  id?: string; // Firebase auto ID
  reporterUid: string;
  reporterEmail: string;
  type: ViolationType;
  description: string;
  priority: Priority;
  status: ReportStatus;
  createdAt: number;
  updatedAt: number;

  // Optional
  location?: Location;
  media: ViolationMediaItem[];
  plateNumber?: string;
  vehicleInfo?: string;
  dateTime?: string;
  witness?: string;
  contact?: string;
  notes?: string;

  // Offline support
  offline?: boolean;
}

// User roles
export type UserRole = "user" | "admin";

// User profile
export interface AppUserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string; // ✅ added to fix Signup.tsx
  role: UserRole;
  createdAt?: number;
}

// Notifications
export interface NotificationItem {
  status: any;
  id: string;
  title: string;
  body?: string;
  link?: string;
  createdAt: number;
  read: boolean;
}


// Chat messages
export interface ChatMessage {
  id: string;
  reportId: string;
  senderUid: string;
  senderEmail?: string;
  senderRole: "admin" | "user";
  text: string;
  createdAt: number;
}

