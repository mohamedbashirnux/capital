"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/backend_super_admin/auth/auth"

const schema = z.object({
  department_name: z
    .string()
    .trim()
    .min(1, "Department name is required")
    .max(100),
})

export async function createDepartment(formData: FormData) {
  const session = await auth()
  const facultyId = (session?.user as any)?.faculty_id as number | undefined
  if (!facultyId) return { error: "Not authenticated" }

  const parsed = schema.safeParse({
    department_name: formData.get("department_name"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    await prisma.departments.create({
      data: {
        faculty_id: facultyId,
        department_name: parsed.data.department_name,
      },
    })
  } catch {
    return { error: "Could not create department" }
  }

  revalidatePath("/faculty_user/department")
  return { ok: true as const }
}
