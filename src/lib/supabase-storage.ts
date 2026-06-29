import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { prisma } from "@/lib/prisma"

const BUCKET_NAME = "attachments"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface UploadResult {
  url: string
  name: string
  size: number
  type: string
}

export async function uploadAttachment(
  topicId: string,
  file: File
): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  const supabase = createAdminClient()
  const bytes = await file.arrayBuffer()
  const buffer = new Uint8Array(bytes)
  const filePath = `${topicId}/${crypto.randomUUID()}-${file.name}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  const attachment = await prisma.attachment.create({
    data: {
      topicId,
      name: file.name,
      url: urlData.publicUrl,
      type: file.type,
      size: file.size,
    },
  })

  return {
    url: attachment.url,
    name: attachment.name,
    size: attachment.size ?? 0,
    type: attachment.type,
  }
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const supabase = createAdminClient()

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: { url: true },
  })

  if (!attachment) {
    throw new Error("Attachment not found")
  }

  const filePath = attachment.url.split("/").slice(-2).join("/")

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }

  await prisma.attachment.delete({
    where: { id: attachmentId },
  })
}

export async function ensureBucketExists(): Promise<void> {
  const supabase = createAdminClient()

  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === BUCKET_NAME)

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip",
      ],
    })

    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`)
    }
  }
}
