import { z } from "zod";
import { generateCertificate } from "./infrai_client.js";

export const completionRequest = z.object({
  participantName: z.string().min(1),
  appointmentId: z.string().min(1),
  completedAt: z.string().datetime(),
  clinicName: z.string().min(1)
});
export type CompletionRequest = z.infer<typeof completionRequest>;

export function certificateMarkdown(input: CompletionRequest): string {
  return `# Completion certificate\n\nThis certifies that **${input.participantName}** completed the healthtech appointment workflow.\n\nAppointment: ${input.appointmentId}\nCompleted: ${input.completedAt}\nClinic: ${input.clinicName}`;
}

export async function issueCompletionCertificate(input: unknown): Promise<unknown> {
  const parsed = completionRequest.parse(input);
  return generateCertificate({ markdown: certificateMarkdown(parsed), page_size: "A4", orientation: "portrait", store: true });
}

if (process.argv[1]?.endsWith("certificate_service.ts")) {
  const body = process.argv[2] ? JSON.parse(process.argv[2]) : null;
  issueCompletionCertificate(body)
    .then((result) => console.log(JSON.stringify({ appointmentId: body?.appointmentId, certificate: result })))
    .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}
