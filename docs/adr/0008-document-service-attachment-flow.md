# ADR 0008: Compliance Document Storage and Attachment Flow

## Status
Accepted

## Context
Commercial vehicles and drivers must maintain up-to-date compliance records, including commercial vehicle registration, annual roadworthiness inspection certificates, commercial liability insurance policies, and professional driving licenses. These documents require multipart file uploads and expiration tracking with proactive warnings.

## Decision
1. Attach documents to either a `VEHICLE` or `DRIVER` owner entity via `ownerType` and `ownerId`.
2. Implement multipart file transmission via `FormData` in `src/microservice/document/api.ts` through the shared `request` client.
3. Track document expiration dates and highlight documents that are expired or expiring within a 30-day window.
4. Render direct secure download links when document URLs are returned from storage, and gracefully disable actions if backend object storage processing is pending.

## Consequences
- Single unified compliance interface across both vehicles and drivers.
- Visual alerts for imminent compliance lapses (such as expired insurance or driver license).
- Decouples UI file handling from backend storage providers (local storage vs S3/MinIO).
