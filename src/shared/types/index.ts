

export enum LeaseStatus {
  PROCESSING = 'Processing',
  IN_REVIEW = 'In Review',
  ABSTRACTED = 'Abstracted',
  FAILED = 'Failed',
  AMENDMENT_REVIEW = 'Amendment Review',
}

export enum ReviewStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export enum Role {
  USER,
  ADMIN, // Deploy Admin / Org Admin
  REVIEWER,
  SUPER_ADMIN, // Root Access
}

export type WorkflowStage =
  | 'R1_PENDING'
  | 'R1_ASSIGNED'
  | 'R1_IN_PROGRESS'
  | 'R1_COMPLETED'
  | 'R2_ASSIGNED'
  | 'R2_IN_PROGRESS'
  | 'ESCALATED'
  | 'COMPLETED';

export type View =
  | 'home'
  | 'pricing'
  | 'portfolio'
  | 'assets'
  | 'abstract'
  | 'choose-template'
  | 'review-template'
  | 'configure-templates'
  | 'batch-review-templates'
  | 'history'
  | 'locations'
  | 'entities'
  | 'reminders'
  | 'lease-insights'
  | 'lease-summaries'
  | 'client-chats'
  | 'profile'
  | 'terms'
  | 'privacy'
  | 'admin-dashboard'
  | 'admin-analytics'
  | 'admin-total-activity'
  | 'admin-review-queue'
  | 'admin-workbench'
  | 'admin-clients'
  | 'admin-completed-reviews'
  | 'admin-client-detail'
  | 'admin-ai-leases'
  | 'admin-bookings'
  | 'admin-reviewers'
  | 'admin-amendments'
  | 'admin-chats'
  | 'admin-lease-database'
  | 'deploy-admins'
  | 'org-detail'
  | 'reviewer-dashboard'
  | 'reviewer-workbench'
  | 'reviewer-activity'
  | 'reviewer-amendments'
  | 'reviewer-chats'
  | 'product-asset-mapping'
  | 'product-critical-events'
  | 'product-ai-abstraction'
  | 'product-ai-assistant'
  | 'product-portfolio-intelligence'
  | 'solution-lease-summaries'
  | 'solution-document-storage'
  | 'solution-expert-verification'
  | 'solution-analytics'
  | 'solution-due-diligence';

export interface SelectionField {
  id: string;
  label: string;
  isSelected: boolean;
  isDate?: boolean;
}

export interface SelectionSection {
  id: string;
  title: string;
  fields: SelectionField[];
}

export interface SavedTemplate {
  id: string;
  name: string;
  type: 'us' | 'eu';
  sections: SelectionSection[];
  dateCreated: Date;
  lastModified: Date;
}

export interface User {
  id: string;        // Supabase auth user UUID
  username: string;
  email: string;
  role: Role;
  savedTemplates?: SavedTemplate[];
  dailyCapacity?: number;
  dailyGoal?: number;
}

export interface Organization {
  id: string;
  name: string;
  status: 'Active' | 'Suspended';
  planType: string;
  createdAt: Date;
  maxReviewers: number;
  maxClients: number;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  status: 'Active' | 'Invited' | 'Disabled';
}

export interface OrganizationClient {
  id: string;
  organizationId: string;
  clientUserId: string;
  assignedAt: Date;
  status: 'Active' | 'Inactive';
}

export interface Document {
  id: string;
  name: string;
  url: string;
  storagePath?: string;  // Supabase Storage path (userId/leaseId/filename)
}

export interface AbstractedField {
  label: string;
  value: string | null;
  page: number | null;
  snippet: string | null;
  fileName?: string | null;
  isVerified?: boolean;
  isVerifiedR2?: boolean;
  isCustom?: boolean;
  isDate?: boolean;
}

export interface AbstractedSection {
  title: string;
  fields: AbstractedField[];
  isCustom?: boolean;
}

export type AbstractedData = AbstractedSection[];

export interface LeaseAmendment {
  id: string;
  name: string;
  date: Date;
  document: Document;
}

export interface ChatMessage {
  id: string;
  referenceId?: string;
  type?: 'lease' | 'support';
  senderRole: Role;
  senderName: string;
  content: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

export interface SupportChat {
  id: string;
  clientEmail: string;
  clientName: string;
  messages: ChatMessage[];
  allowedReviewers: string[];
  lastUpdated: Date;
}

export interface Lease {
  id: string;
  displayId?: string;
  name: string;
  documents: Document[];
  uploadDate: Date;
  status: LeaseStatus;
  abstractedData: AbstractedData;
  processingMode: 'ai' | 'human';
  user?: User;

  reviewStatus?: ReviewStatus;
  reviewer?: User;
  previousReviewer?: User;
  assignedDate?: Date;
  reviewerNotes?: string;

  reviewerR2?: User;
  reviewStatusR2?: ReviewStatus;
  reviewerNotesR2?: string;
  assignedDateR2?: Date;

  workflowStage?: WorkflowStage;

  reviewId?: string;
  lastSaved?: Date;
  isUpdateSeen?: boolean;

  isEscalated?: boolean;
  wasEscalated?: boolean;
  escalationNotes?: string;

  templateConfig?: SelectionSection[];
  templateType?: 'us' | 'eu';
  fileObjects?: File[];

  amendments?: LeaseAmendment[];
  chatHistory?: ChatMessage[];

  aiSummary?: string;

  timeSpent?: number;
  timeSpentR1?: number;
  timeSpentR2?: number;
  aiModelLatency?: number;

  paidRentEvents?: string[]; // IDs of rent events marked as paid
}

export interface PendingIndividualLeaseConfig {
  file: File;
  name: string;
  processingMode: 'ai' | 'human';
  templateType: 'us' | 'eu';
}

export interface TemplateSet {
  main: SelectionSection[];
  optional: SelectionSection[];
  originalOptionalIds: Set<string>;
}

export interface BatchTemplateData {
  us?: TemplateSet;
  eu?: TemplateSet;
}

export interface DemoBooking {
  id: string;
  name: string;
  email: string;
  company: string;
  date: Date;
  timeSlot: string;
  timeZone: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  createdAt: Date;
}

export type Availability = Record<string, string[]>;