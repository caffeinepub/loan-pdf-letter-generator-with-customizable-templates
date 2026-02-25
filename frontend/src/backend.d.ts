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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    convertDocumentToTemplate(documentId: string): Promise<void>;
    getAllDocumentContents(adminId: string): Promise<{
        contents: Array<string>;
        businessTemplates?: GlobalMasterTemplate;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDocumentContent(adminId: string, docType: string): Promise<DocumentContent | null>;
    getGlobalTemplate(adminId: string): Promise<GlobalMasterTemplate | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateGlobalTemplate(adminId: string, template: GlobalMasterTemplate): Promise<void>;
    updateMultipleDocumentTypes(adminId: string, docTypeContentList: Array<[string, DocumentContent]>): Promise<void>;
}
