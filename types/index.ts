export type LeadStatus = "searching" | "assigned" | "closed";
export type Urgency = "low" | "medium" | "high";

export type ClassificationResult = {
  category: string;
  urgency: Urgency;
};

export type Lead = {
  id: string;
  message: string;
  category: string;
  urgency: Urgency;
  status: LeadStatus;
  client_phone: string;
  technician_id: string | null;
  created_at: string;
};

export type Technician = {
  id: string;
  name: string;
  category: string;
  phone: string;
  active: boolean;
};
