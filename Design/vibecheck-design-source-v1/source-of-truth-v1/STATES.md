# Shared state and recovery catalogue

These states apply identically to both visual styles and every relevant screen. They are part of the design contract, not optional engineering polish.

| State | Trigger | Visible UI / exact copy | Recovery and data rule |
|---|---|---|---|
| EMPTY | No user content | Context-specific empty message and one Add action | Keep navigation; example mode explicitly labelled |
| INVALID_FILE | Wrong MIME, >12 MiB or decode failure | “Choose a JPG, PNG or WebP photo under 12 MB.” or “That photo could not be opened.” | Choose another; retain last valid input |
| MISSING_INPUT | Required field absent | “Add a photo to continue.” / named inline field error | Disabled primary with explanation; focus first invalid field after submit |
| CAMERA_DENIED | Permission refused/unavailable | “Camera access is unavailable. You can choose a photo instead.” | Choose photo; no repeated permission loop |
| UPLOADING | Bytes being transferred | “Uploading your photo…”; real byte progress only | Cancel; keep local preview |
| PROCESSING | Accepted job pending | Purpose-specific status, indeterminate spinner | Cancel/leave as defined; no invented percentages |
| EMPTY_RESULT | Provider returns no usable content | “We couldn't create a useful result from this photo.” | Replace photo or retry; no score |
| NO_FACE | Missing/unclear/multiple portrait faces | “Choose a clear portrait of one person.” | Replace or crop; retain goal and preferences |
| OFFLINE | Request cannot reach service | “You're offline. Your draft is still here.” | Reconnect and retry explicitly; local editing remains available |
| SERVICE_ERROR | Provider/network/server failure | “That didn't finish. Your inputs are still here.” | Retry same draft; log internal detail without exposing secrets |
| SESSION_EXPIRED | Protected action receives 401 | “Sign in again to continue. Your draft is saved here.” | A01 with returnTo; retry only after user confirmation |
| QUOTA | Service returns quota/rate limit | “You've reached the check limit for now.” plus server-provided reset time | Preserve draft; do not invent a reset time or charge |
| CANCELLED | User cancels | Return to setup; optional “Check cancelled.” | Ignore late completion; preserve original inputs |
| STALE | Input changed since result | “This combination changed. Check it again for updated feedback.” | Hide old score on new candidate; saved history unchanged |
| SAVING | Persistence pending | “Saving…” with stable-width disabled button | One request; no navigation before successful commit |
| SAVE_FAILED | Local quota/storage or cloud failure | “Your look couldn't be saved. Try again.” | Preserve completed result, offer export if supported |
| SUCCESS | Persist confirmed | “Saved on this device.” or “Saved to your account.” | Link to Saved; show real destination |
| NO_MATCHES | Search/filter yields none | “No pieces match these filters.” | Clear filters / Add piece |
| TIE | Compare result is tied | “Both work, for different reasons.” | Show differences; user chooses, no fabricated winner |
| PREVIEW_REJECTED | User rejects generated likeness | “Keep your original. Try another style.” | Discard generated candidate only |
| MODEL_UNAVAILABLE | Reconstruction service missing | “Personal reconstruction is not available in this build.” | M08 and adjustable/manual path |
| MODEL_LOAD_FAILED | Invalid/unrenderable asset | “This model couldn't be opened.” | Retry loading or keep previous model; no blank stage |
| INCOMPATIBLE_GARMENT | Item cannot dress current model | “This piece is available for photo styling, not this 3D model.” | Offer 2D preview/manual pairing; no false 3D fit |
| BACKUP_CONFLICT | Remote version advanced | “Another device updated your backup. Refresh before saving.” | Refresh remote version; never silently overwrite |
| DELETE_PARTIAL | Device deletion succeeded, cloud failed | “Removed from this device. Cloud removal still needs a retry.” | Retry cloud only; preserve accurate scope |
| UNSAVED_CHANGES | Leaving edited form | “Keep your changes?” with Keep editing / Discard changes | Do not show on unchanged forms |
| GENERATION_RECOVERED | Return to pending persistent job | “Your preview is still processing.” | Resume status by job ID; never resubmit automatically |
| DISABLED_FEATURE | Provider/capability not enabled | Name unavailable action and reason next to it | Offer supported alternative; never inert unexplained control |

## Required state selection per screen
- Intake screens S01, S03, S09, L01, W03, M02, M03: empty, selected, invalid file, camera denial, pending upload, offline.
- Setup forms: default, incomplete, invalid, edited, unsaved changes and restored draft.
- Jobs S05, S10, L03, L06, M06, C03, C07: pending, success, cancel, offline, service error, quota, expired session and stale response.
- Result screens S06, S11, L04, L07, C04, C08: complete, example, stale, save pending/failure, missing optional evidence and rejected preview when relevant.
- Collections W02/V02: empty, populated, filtered, no matches, load error, item deleted and missing referenced item.
- Destructive dialogs W06/V04/P06/P07: default, pending, failed, successful and cancelled.
- Backup P04/P05/P08: absent backup, preview, invalid file, conflict, pending, failed and successful.

## Back and resume behavior
Each registry screen has a default back destination. In a modal/drawer or a route opened from another flow, a validated internal returnTo overrides that default. Keep a small navigation context containing origin screen, selected record, draft ID and input revision. Never store arbitrary external return URLs. Save draft changes explicitly or on local autosave; indicate unsaved state if persistence fails.

Job completion events may only update the matching draft revision and request ID. A late response from an old portrait must never replace the currently displayed portrait's feedback. Browser refresh restores local drafts and accepted model versions, while authentication secrets remain outside exported design data.

## V1 sign-in policy
This source defaults to existing capabilities: guest example exploration and local drafts/saves; signed-in live AWS AI and cloud backup. The user has not answered the sign-in timing question. If the product owner chooses guest AI or sign-in-only saving later, update A01, S04, S13 and backend service permissions together. Do not hide this dependency in a frontend-only patch.

