# AWS setup for the vibecheck hackathon

You do not need to learn the whole AWS platform. This repository defines the infrastructure in one AWS SAM template. Your account supplies the credits, identity, and permission to create it.

## 1. Create the account and check credits

Use [AWS's normal Free Tier signup](https://aws.amazon.com/free/). The current standard offer gives **eligible new AWS customers $100 at signup**, plus up to $100 for introductory activities. No special hackathon referral is needed for that standard offer. Existing or former AWS customers are not eligible for the new-customer credits. The hackathon may have separate eligibility rules: its exact rules have not been supplied.

AWS offers Free and Paid plans. Free lasts up to six months or until credits run out, has service restrictions, and prevents normal usage charges. Paid offers broader service access but can bill beyond credits or for ineligible usage. Credits expire 12 months after account creation. Do not assume that seeing $100 means every model/service is available. Check the account's **Billing and Cost Management → Credits** page and the offer's applicable services, then check Bedrock access before deploying. Do not upgrade just to follow this guide; confirm that the required services need it first.

Sources checked September 19, 2026: [Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/), [plan comparison](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html). These terms can change. Creating or joining an AWS Organization can expire these credits, so do not create one as part of this single-account demo setup.

Create the account yourself, including payment verification and terms. Enable MFA on the account owner. Do not paste passwords, secret access keys, or card details into chat.

## 2. What each AWS service does

| Service | Its job in vibecheck | What you can demonstrate |
|---|---|---|
| Amazon Bedrock / Nova Lite | Reads photos and returns structured style feedback | A real Story Check, comparison, or loox analysis |
| Nova Canvas through Bedrock | Generates hairstyle and clothing previews | A generated preview next to the source photo |
| Amazon Rekognition | Supplies face landmarks, pose, and image quality for loox/avatar guidance | Geometry-assisted feedback; no face identification database |
| Amazon Cognito | Email signup, confirmation, sign-in, password reset | Two users with separate accounts |
| Amazon S3 | Private uploaded images, saved backup snapshots, static app files | Private user-owned media with temporary signed upload/download links |
| Amazon DynamoDB | Backup version/pointer, AI jobs, daily request counters | Restore a backup on another device; background job status |
| AWS Lambda | Runs the API and background AI worker | A DynamoDB job triggers actual model processing |
| Amazon API Gateway | Authenticated web API | Unauthenticated photo/job access is rejected |
| Amazon CloudFront | HTTPS app delivery | Open the deployed mobile web app |
| Amazon CloudWatch | Lambda operational logs | Diagnose a failed request without logging photos or tokens |
| AWS Budgets | Monthly spending notifications | $5 and $10 notifications for the default $10 budget |

The interactive 3D renderer runs on the device using Three.js. It is a parametric avatar, not an AWS body-reconstruction service. The architecture uses real AWS capabilities; service count alone does not establish judging merit.

## 3. Set up one region and model access

Use **US East (N. Virginia), `us-east-1`**, for this template's initial deployment. The default analysis model is the US Nova Lite inference profile `us.amazon.nova-lite-v1:0`; requests may be processed in its supported US destination regions. The image model is `amazon.nova-canvas-v1:0`.

In the Amazon Bedrock console, locate Nova Lite and Nova Canvas and verify they are available to your account in this region. Follow the console's access prompts if required. Account-plan restrictions, quotas, IAM permissions, and model availability are distinct. If denied, resolve the stated account/permission issue before retrying images. The repository includes no fallback that silently turns failed live responses into examples.

References: [Nova console getting started](https://docs.aws.amazon.com/nova/latest/userguide/getting-started-console.html), [Canvas virtual try-on](https://docs.aws.amazon.com/nova/latest/userguide/image-gen-vto.html). Canvas previews do not establish garment fit or measurements.

## 4. Install and authenticate deployment tools

Install Node.js 22.12+, [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), and [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) from their official installers. Restart the terminal after installation.

Use a non-root developer identity/profile authorized to deploy this stack. Prefer temporary credentials through your account's supported sign-in flow. Do not create an AWS Organization just to obtain SSO for this demo. A teammate with an existing authorized development identity can handle deployment. Keep credentials in the AWS profile store, not the app or source tree.

Verify the identity and tooling:

```powershell
aws --version
sam --version
aws sts get-caller-identity --profile vibecheck
```

The example profile name is `vibecheck`; substitute the one you actually configured. This identity needs permission to deploy the services in the template, including creating the Lambda IAM role. Review the template before granting deployment access.

## 5. Build and review the deployment

From the repository directory:

```powershell
npm install
npm test
npm run build
npm run build:lambda
sam validate --lint --template-file infra/template.yaml --region us-east-1
```

The Lambda packaging script explicitly includes Linux x64 sharp/libvips binaries even when built on Windows. SAM CLI validation and a real Linux Lambda cold start still need to be performed in your deployment environment.

The next command **creates billable AWS resources**. Run it only once the account/credits/model access and intended costs have been reviewed:

```powershell
sam deploy --guided --template-file infra/template.yaml --stack-name vibecheck-hackathon --region us-east-1 --profile vibecheck --capabilities CAPABILITY_IAM
```

Keep the two model defaults. Set `MonthlyBudgetUsd` to `10` and `BudgetEmail` to the team member monitoring costs. Keep **Confirm changes before deploy** enabled; inspect the change set. The health/config routes intentionally have no authentication; photo, cloud, and job routes have Cognito JWT authorizers. Save configuration locally if desired; `samconfig.toml` is ignored by Git.

After deployment, list the outputs:

```powershell
aws cloudformation describe-stacks --stack-name vibecheck-hackathon --region us-east-1 --profile vibecheck --query 'Stacks[0].Outputs' --output table
```

Copy `FrontendBucketName` and `DistributionId` into the commands below (the uppercase placeholders are not literal bucket IDs):

```powershell
aws s3 sync dist/ s3://FRONTEND_BUCKET_NAME/ --region us-east-1 --profile vibecheck
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths '/*' --profile vibecheck
```

Open the `DistributionUrl` HTTPS output. The app obtains Cognito identifiers from `/api/config`; there are no frontend secrets to paste or rebuild. The initial template permits cross-origin signed S3 requests; before public production use, restrict CORS to the final app origin.

## 6. Verify with one demo account

1. Open **Me**, create an account, confirm the email, and sign in.
2. Upload an AI-generated sample portrait and request one Story Check. Confirm the result is a live result, not the labelled example.
3. Run loox and one hairstyle preview. Check model latency and any quota errors.
4. Add sample clothes, rotate the avatar, choose a combination, and save it. Try one generated clothing preview using the generated sample portrait.
5. In Me, save a cloud backup. Open a different browser/device, sign in, restore it, and confirm saved looks and wardrobe photos appear.
6. Check the budget and service usage after the test. Cost reporting may lag. Keep generated sample photos for the judging demo until you have decided how to handle real participants' photos.

## 7. Cost controls and cleanup

The app limits accepted AI requests to **30 per user per UTC day**, generates one image per request, uses API throttling, and expires job metadata after about one day (DynamoDB TTL deletion is asynchronous). Large generated job-result files expire after seven days. The default budget emails at 50% and 100% of $10, excluding credits from its cost calculation so credits do not hide gross usage. **Alerts and per-user limits are not an account-wide spending cap.** Multiple users, storage, and other services can still incur costs.

No GPU server, NAT gateway, or always-running application server is provisioned. Photo uploads and backup objects remain in private S3 until removed; repeated backups create new immutable objects. Device reset and sign-out do not delete cloud objects.

For a hackathon, keep the deployment URL within the team and judges. Review usage before increasing quotas or opening public signup broadly. When finished, export any data you want to keep. Use CloudFormation/SAM to delete the stack and follow its resource-deletion report. S3 buckets containing objects require explicitly emptying them first; that is permanent deletion, so verify the exact bucket outputs and backup needs before doing it. Confirm the stack and any retained resources are gone in the AWS console. Do not assume closing the browser stops AWS costs.

## Current verification boundary

Source and mocked service tests are implemented. No AWS account was configured and no AWS resource was deployed during development. Live model access, email delivery, cloud backup/restore, regional quotas, actual spend, and a real Lambda cold start remain deployment checks. The local Google key supplied earlier was rejected as exposed; it is not needed for the AWS path.
