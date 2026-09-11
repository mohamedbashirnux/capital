"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/backend_super_admin/auth/auth"

export async function deleteDepartment(id: number) {
  const session = await auth()
  const facultyId = (session?.user as any)?.faculty_id as number | undefined
  if (!facultyId) return { error: "Not authenticated" }

  try {
    await prisma.departments.delete({ where: { id, faculty_id: facultyId } })
  } catch {
    return { error: "Cannot delete department (it has related classes or subjects)" }
  }
  revalidatePath("/faculty_user/department")
  return { ok: true as const }
}
