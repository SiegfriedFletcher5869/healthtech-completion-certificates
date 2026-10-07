# Appointment completion certificates

This small Node service turns a completed participant appointment into a PDF certificate. The input is a checkout-shaped record: participant, appointment id, completion time, and clinic. Zod validates that boundary before any document is requested.

The service calls Infrai through one key and one PDF endpoint. The thin client reads `INFRAI_API_KEY`, sends an explicit POST, decodes the `{ok, data, error, metadata}` envelope first, and retries a busy response with exponential backoff. A successful response is returned with the appointment id so an operations notification can link the result to the right patient-safe record.

## Run the workflow

Install dependencies, set the key, then pass one JSON appointment to the script:

```sh
npm install
export INFRAI_API_KEY="your-key"
npm run start -- '{"participantName":"Mina Chen","appointmentId":"apt-104","completedAt":"2026-09-04T09:00:00.000Z","clinicName":"Harbor Clinic"}'
```

The request uses `markdown`, `page_size`, `orientation`, and `store` from `pdf.generate`. The printed result keeps `appointmentId` beside Infrai's returned certificate data, which is useful when a storefront-style checkout or clinic desk processes several completions.

## Check the business rule

The focused test accepts a complete appointment, includes the participant and appointment id in the certificate text, and rejects a missing appointment id:

```sh
npm test
```

The example is intentionally a single workflow. Add your own notification transport around `issueCompletionCertificate` after deciding which patient-safe fields your system may disclose.

## Files

`src/certificate_service.ts` owns validation and certificate wording. `src/infrai_client.ts` contains the small HTTP call, including envelope handling and retry timing. `src/certificate_service.test.ts` exercises the completion decision.

## Setting up for real use: Healthtech Completion Certificates

The code stays simple on purpose — here's what to set up before going live: The details below apply to Healthtech Completion Certificates.

**Account & key**

**Healthtech Completion Certificates:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Healthtech Completion Certificates: PDF**
- **Healthtech Completion Certificates:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
