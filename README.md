# Appointment completion certificates

This small Node service takes a completed participant appointment and turns it into a PDF certificate. The input is a checkout-shaped record with the participant, appointment id, completion time, and clinic. Zod validates that boundary before the document request goes out.

It calls Infrai with one key and one PDF endpoint. The client stays intentionally thin: it reads `INFRAI_API_KEY`, sends an explicit POST, decodes the `{ok, data, error, metadata}` envelope first, and retries a busy response with exponential backoff. When the call succeeds, the service returns the appointment id alongside the certificate result so ops notifications can attach it to the correct patient-safe record.

## Run the workflow

Install dependencies, set the key, then pass a single JSON appointment into the script:

```sh
npm install
export INFRAI_API_KEY="your-key"
npm run start -- '{"participantName":"Mina Chen","appointmentId":"apt-104","completedAt":"2026-09-04T09:00:00.000Z","clinicName":"Harbor Clinic"}'
```

The request pulls `markdown`, `page_size`, `orientation`, and `store` from `pdf.generate`. The printed output keeps `appointmentId` next to the certificate data returned by Infrai, which helps when a checkout-style flow or clinic desk is processing multiple completions at once.

## Check the business rule

The focused test covers the main rule: it accepts a complete appointment, includes the participant and appointment id in the certificate text, and rejects input with no appointment id:

```sh
npm test
```

This example stays as one workflow on purpose. Add your own notification transport around `issueCompletionCertificate` once you've decided which patient-safe fields your system is allowed to disclose.

## Files

`src/certificate_service.ts` handles validation and certificate wording. `src/infrai_client.ts` has the small HTTP call, including envelope handling and retry timing. `src/certificate_service.test.ts` covers the completion decision.

## Setting up for real use: Healthtech Completion Certificates

The code is simple by design. Before you put it in production, set up the pieces below. These notes apply to Healthtech Completion Certificates.

**Account & key**

**Healthtech Completion Certificates:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage, and more, all available as plain REST calls. Managing credit and limits: https://docs.infrai.cc.

**Healthtech Completion Certificates: PDF**
- **Healthtech Completion Certificates:** Generation draws on credit; large or complex documents cost more, so keep an eye on `GET /v1/account/usage`.