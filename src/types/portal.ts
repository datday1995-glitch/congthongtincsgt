export type SectionType = 'procedure' | 'guide' | 'news';
export type ArticleStatus = 'draft' | 'published' | 'hidden';
export type AdminRole = 'super_admin' | 'editor' | 'officer' | 'viewer';

export type ProcedureGroupKey =
  | 'cap-lan-dau'
  | 'doi-gplx'
  | 'cap-lai-gplx'
  | 'phuc-hoi-diem'
  | 'sat-hach-qua-han'
  | 'gplx-quoc-te';

export type ProcedureIconKey =
  | 'car'
  | 'refresh'
  | 'file-x'
  | 'award'
  | 'clock-alert'
  | 'globe'
  | 'globe-refresh'
  | 'shield-check';

export interface ProcedureStep {
  stepNumber: number;
  title: string;
  description: string;
  note?: string;
}

export interface ProcedureFormItem {
  name: string;
  code: string;
  note: string;
  url: string;
  verificationStatus: 'verified' | 'verifying';
}

export interface ProcedureFaqInline {
  question: string;
  answer: string;
}

export interface ProcedureSubCase {
  title: string;
  summary: string;
  conditions: string;
  extraDossier: string;
  note?: string;
}

export interface ProcedureGuide {
  id: string;
  title: string;
  slug: string;
  cardOrder: number;
  isCoreCard: boolean;
  iconKey: ProcedureIconKey;
  groupKey: ProcedureGroupKey;
  shortDescription: string;
  intro: string;
  targetAudience: string;
  conditions: string;
  dossierItems: string[];
  dossierQuantity: string;
  submissionMethods: string[];
  receivingLocation: string;
  steps: ProcedureStep[];
  processingTime: string;
  fees: string;
  result: string;
  legalBasis: string[];
  forms: ProcedureFormItem[];
  faqs: ProcedureFaqInline[];
  subCases: ProcedureSubCase[];
  referenceNotes: string;
  onlinePortalUrl: string;
  keywords: string[];
  status: ArticleStatus;
  isVerifiedSeed: boolean;
  authorId: string;
  authorName: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdAtIso?: string;
  updatedAtIso?: string;
}

export type LegalDocType = 'law' | 'decree' | 'circular' | 'decision' | 'form' | 'guide';
export type LegalValidityStatus = 'effective' | 'amended' | 'expired' | 'verifying';

export interface LegalDocument {
  id: string;
  docNumber: string;
  title: string;
  docType: LegalDocType;
  issuedDate: string;
  effectiveDate: string;
  issuingAuthority: string;
  validityStatus: LegalValidityStatus;
  summary: string;
  pdfUrl: string;
  relatedProcedureSlugs: string[];
  status: ArticleStatus;
  authorId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdAtIso?: string;
  updatedAtIso?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedProcedureSlug: string;
  legalRef: string;
  order: number;
  status: ArticleStatus;
  authorId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdAtIso?: string;
  updatedAtIso?: string;
}

export interface AttachmentItem {
  name: string;
  url: string;
  sizeBytes?: number;
  mimeType?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  sectionType: SectionType;
  shortDescription: string;
  coverImage: string;
  contentHtml: string;
  attachments: AttachmentItem[];
  keywords: string[];
  status: ArticleStatus;
  publishedDate: string;
  authorId: string;
  authorName: string;
  isSample: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdAtIso?: string;
  updatedAtIso?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isVisible: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SiteSettings {
  siteTitle: string;
  agencyName: string;
  departmentName: string;
  logoUrl: string;
  bannerUrl: string;
  bannerTitle: string;
  bannerSubtitle: string;
  address: string;
  phone: string;
  facebookUrl: string;
  websiteUrl: string;
  introContent: string;
  footerNote: string;
  mapEmbedUrl: string;
  updatedBy?: string;
  updatedAt?: unknown;
  updatedAtIso?: string;
}

export interface PasscodeAccount {
  id: string;
  ownerName: string;
  passcodeHash: string;
  note: string;
  status: 'active' | 'locked';
  failedAttempts: number;
  lockedUntil: string;
  lastLoginAt: string;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'editor' | 'viewer';
  status: 'active' | 'revoked';
  addedBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  kind: 'image' | 'document';
  uploadedBy: string;
  uploadedByName: string;
  createdAt?: unknown;
}

export interface ActivityLog {
  id: string;
  actorName: string;
  actorType: 'google_admin' | 'passcode_officer';
  actorId: string;
  action: string;
  targetType: string;
  targetTitle: string;
  details: string;
  createdAt?: unknown;
  createdAtIso?: string;
}

export interface AdminSession {
  mode: 'google' | 'passcode';
  uid: string;
  displayName: string;
  email?: string;
  role: AdminRole;
  isSuperAdmin: boolean;
  isReadOnly?: boolean;
}
