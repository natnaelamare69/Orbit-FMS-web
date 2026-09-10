import { request } from "../../app/api/request";
import type { FleetDocument } from "../../app/domain/types";

export interface UploadDocumentInput {
  /** Vehicle or Driver id the compliance file is attached to. */
  ownerType: "VEHICLE" | "DRIVER";
  ownerId: number;
  documentType: string;
  expiryDate?: string;
  file: File;
}

export function listDocuments(): Promise<FleetDocument[]> {
  return request<FleetDocument[]>("/api/v1/documents", { method: "GET" });
}

/**
 * Multipart upload for compliance documents (registration, insurance,
 * inspection certificate, license). Sent through the gateway.
 * NOTE: figure 9 storage/return shape will be reconciled with the generated
 * document client once the backend spec is finalized (see ADR 0008).
 */
export function uploadDocument(input: UploadDocumentInput): Promise<FleetDocument> {
  const form = new FormData();
  form.append("ownerType", input.ownerType);
  form.append("ownerId", String(input.ownerId));
  form.append("documentType", input.documentType);
  if (input.expiryDate) {
    form.append("expiryDate", input.expiryDate);
  }
  form.append("file", input.file);
  return request<FleetDocument>("/api/v1/documents", {
    method: "POST",
    formData: form,
  });
}