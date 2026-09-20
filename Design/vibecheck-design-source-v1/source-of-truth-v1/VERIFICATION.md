# Design package verification

20 September 2026. This report validates the design documentation package, not the production application.

## Checked

- The registry contains 63 unique screen IDs, 13 representative journeys and 169 action contracts.
- Each action and back destination resolves to a registered screen. Each journey references registered screens.
- All 63 construction previews were opened in the in-app browser at a requested 1440×1024 viewport. No empty preview, broken image or horizontal document overflow was detected.
- Story intake navigation from S01 to S02 was exercised through its Continue button.
- Soft/Sharp, Desktop/Mobile and the construction/visual-target selectors were exercised.
- The stale-result preview replaces score digits with a dash. The empty preview removes the score ticket. Error recovery returns to the same screen's default state.
- At a requested 390×844 viewport, the mobile construction preview and model-consent screen rendered without horizontal document overflow. The browser reported a 390px inner width and a 375px document width; these are recorded as reported rather than claimed to be identical raster dimensions.
- Generated female desktop targets were visually inspected after generation and copied into the package. Male targets and mobile boards were copied from the preceding design work.
- JavaScript syntax was checked. The package validator checks registry/viewer consistency, document links, PNG headers and desktop image count.

## Verification limits

The atlas simulates navigation for design review. It does not validate real uploads, accounts, file persistence, cloud backup, AI jobs or 3D reconstruction. Its construction previews use reusable layout patterns and labelled sample imagery. They are not 63 individually finished high-fidelity screens. State selection demonstrates shared state patterns; the exact per-screen applicability is specified in STATES.md.

The six main desktop screens per style are the high-fidelity visual references. Generated text, photo edits and fine decorative shapes can contain differences. The written screen and component contracts take precedence. Mobile hero targets remain the original multi-screen reference boards; isolated mobile views in the atlas are construction previews.

## Recheck after changing a contract

Run `node refresh-docs.mjs` from this folder to rebuild the viewer data and workflow document from screens.json and flows.json. Then run `node validate-package.mjs`. Open index.html to check the affected screen and its inbound/outbound actions. Repeat visual browser checks for any layout or state-rendering change.

## Release gates outside this package

The sign-in timing question remains unanswered; v1 preserves guest local exploration and signed-in AWS AI as its declared default. Personal model reconstruction and compatible garment dressing require a verified provider contract and live validation before their target screens can be presented as working capabilities.
