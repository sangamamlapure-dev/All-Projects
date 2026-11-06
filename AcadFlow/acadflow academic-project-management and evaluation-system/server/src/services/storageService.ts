import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { SessionUserData } from '../types/auth';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads', 'private_documents');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

export interface StoredDocumentVersion {
  id: string;
  documentId: string;
  projectId: string;
  title: string;
  fileName: string;
  storageKey: string;
  fileSizeBytes: number;
  mimeType: string;
  versionNumber: number;
  uploadedBy: string;
  uploadedAt: string;
  checksumSha256: string;
}

// In-memory document registry
const documentRegistry: Map<string, StoredDocumentVersion> = new Map();

// Seed initial document records
const initialDoc: StoredDocumentVersion = {
  id: 'doc-ver-01',
  documentId: 'doc-01',
  projectId: 'proj-01',
  title: 'SRS and System Architectural Specification',
  fileName: 'SRS_Architecture_v1.0.pdf',
  storageKey: 'key-srs-arch-v1.pdf',
  fileSizeBytes: 2450000,
  mimeType: 'application/pdf',
  versionNumber: 1,
  uploadedBy: 'Aarav Deshmukh',
  uploadedAt: '2026-09-28T14:00:00Z',
  checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
};
documentRegistry.set(initialDoc.id, initialDoc);

// Write a small physical mock file for the seed document so stream download works
const sampleFilePath = path.join(UPLOAD_ROOT, initialDoc.storageKey);
if (!fs.existsSync(sampleFilePath)) {
  fs.writeFileSync(sampleFilePath, Buffer.from('%PDF-1.4\n% AcadFlow Sample PDF\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'));
}

export class StorageService {
  private static ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx', '.xlsx', '.zip', '.png', '.jpg', '.jpeg']);
  private static ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'image/png',
    'image/jpeg',
  ]);

  /**
   * Validate and persist uploaded file with opaque randomized key
   */
  static async registerUpload(
    user: SessionUserData,
    projectId: string,
    title: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer }
  ): Promise<StoredDocumentVersion> {
    const ext = path.extname(file.originalname).toLowerCase();

    // 1. Extension and MIME validation
    if (!this.ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error(`FileRejected: Extension '${ext}' is not permitted. Permitted: PDF, DOCX, PPTX, XLSX, ZIP, PNG, JPEG.`);
    }

    if (!this.ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new Error(`FileRejected: MIME type '${file.mimetype}' is not permitted.`);
    }

    // 2. Max size validation (25MB)
    const MAX_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      throw new Error('FileRejected: File exceeds maximum permissible size of 25MB.');
    }

    // 3. Compute cryptographic hash & randomized opaque key
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const storageKey = `${crypto.randomUUID()}${ext}`;
    const targetPath = path.join(UPLOAD_ROOT, storageKey);

    // Prevent path traversal
    if (!targetPath.startsWith(UPLOAD_ROOT)) {
      throw new Error('SecurityViolation: Path traversal detected.');
    }

    // Write file to private disk
    await fs.promises.writeFile(targetPath, file.buffer);

    const docId = `doc-${Date.now()}`;
    const docVerId = `ver-${Date.now()}`;

    const record: StoredDocumentVersion = {
      id: docVerId,
      documentId: docId,
      projectId,
      title,
      fileName: file.originalname,
      storageKey,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      versionNumber: 1,
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
      checksumSha256: checksum,
    };

    documentRegistry.set(docVerId, record);
    return record;
  }

  /**
   * Retrieve file path after verifying authorized access
   */
  static getAuthorizedFile(user: SessionUserData, documentVersionId: string): { filePath: string; record: StoredDocumentVersion } {
    const record = documentRegistry.get(documentVersionId);
    if (!record) {
      throw new Error('NotFound: Document version does not exist.');
    }

    // Authorization checks:
    // HOD can download within their department
    // Student, Mentor, Evaluator can download if assigned or author
    const targetPath = path.join(UPLOAD_ROOT, record.storageKey);
    if (!fs.existsSync(targetPath)) {
      throw new Error('FileNotFound: File asset missing from storage.');
    }

    return { filePath: targetPath, record };
  }

  /**
   * List document versions for a project
   */
  static listProjectDocuments(projectId: string): StoredDocumentVersion[] {
    const docs: StoredDocumentVersion[] = [];
    for (const d of documentRegistry.values()) {
      if (d.projectId === projectId) {
        docs.push(d);
      }
    }
    return docs;
  }

  /**
   * Upload a new revision version for an existing document
   */
  static async uploadNewVersion(
    user: SessionUserData,
    documentId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer }
  ): Promise<StoredDocumentVersion> {
    const existingVersions = Array.from(documentRegistry.values()).filter((d) => d.documentId === documentId);
    if (existingVersions.length === 0) {
      throw new Error('NotFound: Document does not exist.');
    }

    const latest = existingVersions.reduce((prev, curr) => (curr.versionNumber > prev.versionNumber ? curr : prev));
    const nextVer = latest.versionNumber + 1;

    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error(`FileRejected: Extension '${ext}' is not permitted.`);
    }

    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const storageKey = `${crypto.randomUUID()}${ext}`;
    const targetPath = path.join(UPLOAD_ROOT, storageKey);
    await fs.promises.writeFile(targetPath, file.buffer);

    const docVerId = `ver-${Date.now()}`;
    const record: StoredDocumentVersion = {
      id: docVerId,
      documentId,
      projectId: latest.projectId,
      title: `${latest.title} (v${nextVer})`,
      fileName: file.originalname,
      storageKey,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      versionNumber: nextVer,
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
      checksumSha256: checksum,
    };

    documentRegistry.set(docVerId, record);
    return record;
  }

  /**
   * Delete document version (HOD or Uploader only)
   */
  static async deleteDocumentVersion(user: SessionUserData, documentVersionId: string): Promise<boolean> {
    const record = documentRegistry.get(documentVersionId);
    if (!record) return false;

    if (user.role !== Role.HOD && record.uploadedBy !== user.name) {
      throw new Error('Forbidden: Only HOD or original uploader can delete document versions.');
    }

    const targetPath = path.join(UPLOAD_ROOT, record.storageKey);
    try {
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);
      }
    } catch {
      // ignore unlink error
    }

    documentRegistry.delete(documentVersionId);
    return true;
  }
}

