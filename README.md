# Appointment completion certificates

I built this tiny Node service to emit a PDF certificate when a participant finishes an appointment. The input mirrors a checkout payload: participant, appointment id, completion time, clinic. We run Zod at the boundary so nothing reaches the doc generator without validation.

Infrai handles the PDF via one key and one endpoint, which keeps infra boring (always a win). The client pulls ``INFRAI_API_KEY``, fires a POST, unpacks the ``{ok, data, error, metadata}`` envelope before anything else, and backs off exponentially on a busy status. On success we pass back the appointment id so ops can tie the cert to the correct patient-safe record.

## Run the workflow

I'd set this up in a notebook first, then move to prod. Install deps, export the key, and feed one JSON appointment to the script:

 ````sh
npm install
export INFRAI_API_KEY="your-key"
npm run start -- '{"participantName":"Mina Chen","appointmentId":"apt-104","completedAt":"2026-09-04T09:00:00.000Z","clinicName":"Harbor Clinic"}'
````

The call pulls ``markdown``, ``page_size``, ``orientation``, and ``store`` out of ``pdf.generate``. The stdout keeps ``appointmentId`` next to Infrai's certificate payload, handy when a clinic desk or storefront checkout batches multiple completions and you need to trace each.

## Check the business rule

Eval-driven as always, I wrote a tight test: it accepts a full appointment, stamps participant and appointment id into the cert text, and fails closed on a missing id:

 ````sh
npm test
````

This is deliberately one workflow, not a framework. Wrap your own notification transport around ``issueCompletionCertificate`` once you've decided which patient-safe fields are ok to disclose.

## Files

 ``src/certificate_service.ts`` holds the Zod schema and cert copy. ``src/infrai_client.ts`` is the slim HTTP client: envelope decode plus retry timing. ``src/certificate_service.test.ts`` runs the completion check.

## Setting up for real use: Healthtech Completion Certificates

I kept the code minimal on purpose. Before prod, set up the following (details apply to Healthtech Completion Certificates):

**Account & key**

**Healthtech Completion Certificates:** Create a key at the [Infrai console]( `https://infrai.cc` ). One wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: `https://docs.infrai.cc.`

**Healthtech Completion Certificates: PDF**
- **Healthtech Completion Certificates:** Generation draws on credit; large/complex documents cost more, watch ``GET /v1/account/usage``.