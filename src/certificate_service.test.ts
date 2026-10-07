import assert from "node:assert/strict";
import { certificateMarkdown, completionRequest } from "./certificate_service.js";

const input = { participantName: "Mina Chen", appointmentId: "apt-104", completedAt: "2026-09-04T09:00:00.000Z", clinicName: "Harbor Clinic" };
assert.equal(completionRequest.safeParse(input).success, true);
assert.match(certificateMarkdown(input), /Mina Chen/);
assert.match(certificateMarkdown(input), /apt-104/);
assert.equal(completionRequest.safeParse({ ...input, appointmentId: "" }).success, false);
console.log("certificate decision checks passed");
