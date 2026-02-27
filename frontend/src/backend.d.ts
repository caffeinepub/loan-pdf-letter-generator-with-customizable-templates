import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface DocumentContent {
    title: string;
    body: string;
    adminId: string;
}
export type TemplateResult = {
    __kind__: "unexpectedError";
    unexpectedError: string;
} | {
    __kind__: "alreadyExists";
    alreadyExists: null;
} | {
    __kind__: "unauthorizedField";
    unauthorizedField: null;
} | {
    __kind__: "notFound";
    notFound: null;
} | {
    __kind__: "success";
    success: null;
};
export interface LoanProcessingData {
    id: string;
    loanType: LoanType;
    timestamp: bigint;
    amount: bigint;
    processingCharge: bigint;
}
export interface LayoutSettings {
    watermarkText: string;
    qrPayload: string;
    headerColor: string;
    watermarkOpacity: bigint;
    showQrCode: boolean;
    footerLayout: Variant_twoColumn_centered;
    showWatermark: boolean;
    signatureLayout: Variant_stacked_sideBySide;
    footerText: string;
}
export interface GlobalMasterTemplate {
    signature?: ExternalBlob;
    logo?: ExternalBlob;
    layout: LayoutSettings;
    businessName: string;
    businessAddress: string;
    optionalCustomFieldValue?: string;
    stamp?: ExternalBlob;
    optionalCustomFieldLabel?: string;
    adminId: string;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export enum LoanType {
    home = "home",
    education = "education",
    personal = "personal",
    business = "business",
    vehicle = "vehicle"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_stacked_sideBySide {
    stacked = "stacked",
    sideBySide = "sideBySide"
}
export enum Variant_twoColumn_centered {
    twoColumn = "twoColumn",
    centered = "centered"
}
export interface backendInterface {
    addCustomTemplate(templateId: string, template: GlobalMasterTemplate): Promise<TemplateResult>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createLoanProcessingRecord(record: LoanProcessingData): Promise<void>;
    deleteLoanProcessingRecord(id: string): Promise<void>;
    getAllDocumentContents(adminId: string): Promise<{
        contents: Array<string>;
        businessTemplates?: GlobalMasterTemplate;
    }>;
    getAllLoanProcessingRecords(): Promise<Array<LoanProcessingData>>;
    getAllTemplates(): Promise<Array<GlobalMasterTemplate>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomTemplateById(templateId: string): Promise<GlobalMasterTemplate | null>;
    getDocumentContent(adminId: string, docType: string): Promise<DocumentContent | null>;
    getGlobalTemplate(adminId: string): Promise<GlobalMasterTemplate | null>;
    getLoanProcessingRecord(id: string): Promise<LoanProcessingData | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomTemplate(templateId: string, template: GlobalMasterTemplate): Promise<TemplateResult>;
    updateGlobalTemplate(adminId: string, template: GlobalMasterTemplate): Promise<void>;
    updateLoanProcessingRecord(id: string, update: LoanProcessingData): Promise<void>;
    updateMultipleDocumentTypes(adminId: string, docTypeContentList: Array<[string, DocumentContent]>): Promise<void>;
}
