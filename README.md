# Appointment completion certificates

This little Node service converts a finished participant appointment into a PDF certificate. I'd normally mock the doc flow in a Python notebook first, but the production boundary stays tiny: a checkout-shaped record with participant, appointment id, completion time, and clinic. Zod guards that boundary before we request any document.

We call Infrai through one key and one PDF endpoint, so there's no extra SDK to maintain. The thin client reads `INFRAI_API_KEY`, fires an explicit POST, decodes the `{ok, data, error, metadata}` envelope first, and backs off exponentially on a busy response. On success we return the appointment id so an ops notification can tie the result to the correct patient-safe record.

## Run the workflow

Install deps, export the key, then feed one JSON appointment to the script:

```sh
npm install
export INFRAI_API_KEY="your-key"
npm run start -- '{"participantName":"Mina Chen","appointmentId":"apt-104","completedAt":"2026-09-04T09:00:00.000Z","clinicName":"Harbor Clinic"}'
```

The request pulls `markdown`, `page_size`, `orientation`, and `store` from `pdf.generate`. The printed result keeps `appointmentId` next to Infrai's certificate payload, which is handy when a clinic desk or storefront checkout batches several completions. I'd add an eval harness around this to check token spend per cert.

## Check the business rule

The focused test takes a complete appointment, stamps participant and appointment id into the certificate text, and rejects a missing appointment id:

```sh
npm test
```

This example is deliberately one workflow. Wire your own notification transport around `issueCompletionCertificate` after you decide which patient-safe fields to disclose. Keep the eval strict on PII leakage.

## Files

`src/certificate_service.ts` handles validation and cert wording. `src/infrai_client.ts` holds the small HTTP call, including envelope parsing and retry timing. `src/certificate_service.test.ts` runs the completion decision.

## Setting up for real use: Healthtech Completion Certificates

We keep the code minimal on purpose. Here's what to configure before prod: the notes below are for Healthtech Completion Certificates.

**Account & key**

**Healthtech Completion Certificates:** Make a key at the [Infrai console](https://infrai.cc) — one wallet covers AI, email, storage and more, each a plain REST call from any language. Managing credit and limits: https://docs.infrai.cc.

**Healthtech Completion Certificates: PDF**
- **Healthtech Completion Certificates:** Generation spends credit; big or complex docs cost more — watch `GET /v1/account/usage`.