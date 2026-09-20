# Deploy vibecheck to EC2

Use this guide for the current React + Express + Gemini app. No Lambda conversion, Amplify, Docker, or Bedrock setup required.

**Route:** browser → Nginx (HTTPS) → Express on `127.0.0.1:8787`. Express serves both the built frontend and `/api`.

Commands labelled **Windows** run in your laptop's PowerShell. Commands labelled **EC2** run in the SSH terminal on Ubuntu. Replace every `YOUR_...` placeholder before running a command.

This guide was checked against the repository on 20 September 2026. It has not been executed on your AWS account.

## 1. Launch one server — AWS console

Open **EC2 → Instances → Launch instances** in your team member's account.

| Setting | Choose |
|---|---|
| Name | `vibecheck-demo` |
| Image | Ubuntu Server 24.04 LTS, **64-bit x86** |
| Instance | `t3.small` if your account permits it; 2 GB RAM is a reasonable demo starting point |
| Key pair | Create an RSA key pair; download the `.pem` and keep it private |
| Network | Default VPC, public subnet, **Auto-assign public IP: Enable** |
| Storage | 20 GB gp3, encrypted |
| IAM instance role | None needed for this Gemini-only path |

Do not select ARM (`t4g`) for these commands; the Node download below is x86-64. Build on your laptop to avoid exhausting server memory. Check the account's available credits and the displayed instance estimate before launching; an existing account is not automatically eligible for free usage.

Security group inbound rules:

| Type | Port | Source |
|---|---:|---|
| SSH | 22 | **My IP** only |
| HTTP | 80 | `0.0.0.0/0` |
| HTTPS | 443 | `0.0.0.0/0` |

Keep normal outbound access enabled so the server can reach Gemini and package repositories. Do **not** expose ports 5173 or 8787. These are the standard SSH/web security-group patterns. [AWS documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules-reference.html)

Wait for the instance status checks to pass. Copy its **Public IPv4 address**. If the default VPC has been removed, use a subnet with an internet-gateway route; a private subnet alone will not work for this guide.

## 2. Build and package — Windows

Open PowerShell in the project:

```powershell
Set-Location 'C:\Users\Sri-Krishna\OneDrive\Desktop\VibeCheck'
npm run build
```

Stop if the build fails. Then package only the runtime files and built website:

```powershell
tar -czf "$env:TEMP\vibecheck-ec2.tar.gz" package.json package-lock.json server shared scripts dist public/models
```

This includes local uncommitted UI work. It excludes `.env.local`, `.git`, Windows `node_modules`, design sources and logs. Never upload your whole workspace as the deployment package.

Transfer it, replacing the key path and IP:

```powershell
scp -i 'C:\Users\Sri-Krishna\Downloads\vibecheck-demo.pem' "$env:TEMP\vibecheck-ec2.tar.gz" ubuntu@YOUR_PUBLIC_IP:/home/ubuntu/
ssh -i 'C:\Users\Sri-Krishna\Downloads\vibecheck-demo.pem' ubuntu@YOUR_PUBLIC_IP
```

Use the `ubuntu` username, not `ec2-user`. On first connection, verify the server fingerprint before accepting it. If SSH times out, check the public IP and update the SSH rule's **My IP** after changing networks. AWS also documents alternative connection methods. [Connection guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect.html)

## 3. Install Node and Nginx — EC2

```bash
sudo apt-get update
sudo apt-get install -y nginx curl ca-certificates xz-utils
```

Install the latest Node 22 build from the official Node distribution. These commands select the Linux x64 archive and verify its published checksum before installation. [Official release files](https://nodejs.org/download/release/latest-v22.x/)

```bash
mkdir -p ~/node-install
cd ~/node-install
curl -fsSLO https://nodejs.org/download/release/latest-v22.x/SHASUMS256.txt
NODE_ARCHIVE=$(awk '$2 ~ /^node-v22\..*-linux-x64\.tar\.xz$/ {print $2; exit}' SHASUMS256.txt)
test -n "$NODE_ARCHIVE"
curl -fsSLO "https://nodejs.org/download/release/latest-v22.x/$NODE_ARCHIVE"
grep "  $NODE_ARCHIVE$" SHASUMS256.txt | sha256sum --check --strict
```

Continue only if the checksum reports **OK**:

```bash
sudo tar -xJf "$NODE_ARCHIVE" -C /usr/local --strip-components=1
node --version
npm --version
```

The Node version should start with `v22.`. Now install the app:

```bash
sudo install -d -o ubuntu -g ubuntu /opt/vibecheck
tar -xzf ~/vibecheck-ec2.tar.gz -C /opt/vibecheck
cd /opt/vibecheck
npm ci --include=dev
test -f dist/index.html
```

**Keep `--include=dev`.** This app's start command uses `tsx`, currently a development dependency. Installing production dependencies only will break startup. Install dependencies on Linux; do not copy Windows `node_modules` because packages such as Sharp have native binaries.

## 4. Configure Gemini — EC2

Create a server-only environment file:

```bash
sudo install -m 600 /dev/null /etc/vibecheck.env
sudo nano /etc/vibecheck.env
```

Paste the following into the editor, replacing placeholders locally. Use the **same working model names and key** as your local setup. Do not paste the key into chat or put it in any `VITE_` variable.

```dotenv
NODE_ENV=production
PORT=8787
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_WORKING_GEMINI_KEY
GEMINI_MODEL=YOUR_WORKING_ANALYSIS_MODEL
ENABLE_IMAGE_GENERATION=false
ALLOWED_ORIGIN=http://YOUR_PUBLIC_IP
```

Save with **Ctrl+O**, Enter, then **Ctrl+X**. No spaces around `=`. The file stays outside the website and deployment archive.

Keep image generation disabled if you are submitting only Story, comparison and loox analysis. If you have verified image generation and want it enabled, set `ENABLE_IMAGE_GENERATION=true` and add `GEMINI_IMAGE_MODEL=YOUR_WORKING_IMAGE_MODEL`. Enabling it does not fix unfinished 3D or garment-generation features.

`ALLOWED_ORIGIN` is required for browser POST requests. Match the exact scheme and hostname, without a trailing slash. Later, add the HTTPS domain as shown in step 7.

## 5. Run it permanently — EC2

Create a service so the app survives closing SSH and restarting the server:

```bash
sudo tee /etc/systemd/system/vibecheck.service > /dev/null <<'EOF'
[Unit]
Description=VibeCheck web app and Gemini API
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/vibecheck
EnvironmentFile=/etc/vibecheck.env
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/local/bin/node --import tsx scripts/start.mjs
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
UMask=0077

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now vibecheck
sudo systemctl status vibecheck --no-pager
curl -fsS http://127.0.0.1:8787/api/health
```

Expected: service **active (running)**; JSON contains `"configured":true` and `"provider":"gemini"`. This proves a key is present, **not** that Gemini accepts it or has quota. A real photo check in step 8 verifies that.

The existing `npm start` performs the same production startup. Do not use `npm run dev` or Vite's development server on EC2.

## 6. Expose the website through Nginx — EC2

Create the proxy configuration. Leave the quoted `EOF` markers unchanged: they preserve Nginx's `$host` variables.

```bash
sudo tee /etc/nginx/sites-available/vibecheck > /dev/null <<'EOF'
server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 42m;

    location / {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
EOF
sudo unlink /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/vibecheck /etc/nginx/sites-enabled/vibecheck
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
curl -fsS http://127.0.0.1/api/health
```

The `unlink` command removes only Ubuntu Nginx's default-site link; it does not delete app files. On a repeat deployment, an already-missing default link or already-existing vibecheck link can be skipped. Do not reload Nginx if `nginx -t` fails.

Open **`http://YOUR_PUBLIC_IP`** on your laptop. The app should load; refreshing `/story` should also work because Express already handles frontend routes.

**This HTTP address is a connectivity check, not the final camera-enabled URL.** Browser camera access and service-worker installation require a secure context. Use HTTPS for recording the camera flow or sharing photos.

## 7. Add HTTPS — EC2 + your DNS provider

Use a domain or subdomain your team controls, such as `vibecheck.example.com`. You do not need to transfer it to Route 53.

1. Create a DNS **A record** pointing that hostname to the instance's public IPv4.
2. Remove any stale AAAA record unless IPv6 is deliberately configured.
3. In `/etc/nginx/sites-available/vibecheck`, replace `server_name _;` with `server_name YOUR_DOMAIN;`.
4. Run:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo apt-get install -y snapd
sudo snap install --classic certbot
sudo /snap/bin/certbot --nginx -d YOUR_DOMAIN
```

Enter an email, review the terms yourself and follow Certbot's prompts. It configures the certificate and HTTPS redirect. Ports 80 and 443 must be reachable, and DNS must point to this instance. [Certbot instructions](https://certbot.eff.org/instructions?os=snap&ws=nginx)

Update the existing environment file:

```bash
sudo nano /etc/vibecheck.env
```

Set this line, keeping the other settings:

```dotenv
ALLOWED_ORIGIN=https://YOUR_DOMAIN,http://YOUR_PUBLIC_IP
```

Then:

```bash
sudo systemctl restart vibecheck
sudo /snap/bin/certbot renew --dry-run
curl -fsS https://YOUR_DOMAIN/api/health
```

Open **`https://YOUR_DOMAIN`**. Use that exact address in the submission. If you lack a domain, the HTTP IP link can demonstrate the non-camera UI, but it is not a substitute for HTTPS. Do not bypass certificate warnings.

Stopping and starting EC2 can change its ordinary public IP. An Elastic IP provides a stable address; otherwise update DNS and `ALLOWED_ORIGIN` after an IP change. Public IPv4 addresses, including Elastic IPs, have a separate hourly charge. [AWS pricing](https://aws.amazon.com/vpc/pricing/)

## 8. Verify before submitting

- Open Home, Story, loox, Wardrobe and Saved; refresh a nested route.
- Switch Soft/Sharp; confirm images load, including model assets if you retain that screen.
- Upload a sample photo and run one real Story check. Confirm it returns an AI result rather than a labelled example.
- Check comparison and one loox analysis. A configured health endpoint alone is insufficient.
- Save a look, refresh and confirm it remains available in that browser.
- Test the public URL from a phone on mobile data, not only from your laptop.
- If retaining the camera, test it on HTTPS. If retaining image generation, test it separately; analysis quota does not prove generation access.

**Scope of this deployment:** Gemini stays on Google; AWS hosts the web app and API on EC2. Existing saves remain in each browser's IndexedDB. This path does not add Cognito, S3 backups, DynamoDB, or cross-device syncing. Export local looks and import them at the deployed origin if needed; localhost data does not move automatically.

The current Express path has no account authentication, and the photo-processing toggle affects the whole server. Public visitors can consume your Gemini quota; origin checking is not authentication. Use it as a supervised hackathon demo, monitor usage, and do not leave the unrestricted AI endpoint running indefinitely. Per-process request limits are shared behind this proxy; a busy demo can return 429.

## 9. Fast troubleshooting

| Symptom | Check |
|---|---|
| SSH timeout | Public IP, instance running, SSH rule allows your current IP, public-subnet route |
| Nginx welcome screen | Disable the default site; enable vibecheck; reload Nginx |
| 502 Bad Gateway | `sudo systemctl status vibecheck --no-pager` and the service log below |
| `Cannot find package tsx` | Run `npm ci --include=dev` in `/opt/vibecheck`; restart |
| API says unconfigured | Correct `/etc/vibecheck.env`, then restart the service |
| 403 / `ORIGIN_DENIED` | Add the exact browser origin to `ALLOWED_ORIGIN`, then restart |
| 413 upload error | Confirm Nginx `client_max_body_size 42m`; app also enforces its own photo limits |
| Gemini 429 / quota message | Check the Google project's actual model quota; restarting EC2 does not restore it |
| Old UI after updating | Hard-refresh; if needed unregister the old service worker in browser developer tools |
| Missing saved looks | Saves are specific to browser and origin; import an exported backup |
| Camera unavailable | Use valid HTTPS and allow the browser's camera permission |
| Face alignment unavailable | Optional Python/OpenCV dependency; skip that unfinished flow or install below |

Logs and health checks, on EC2:

```bash
sudo journalctl -u vibecheck -n 80 --no-pager
sudo tail -n 50 /var/log/nginx/error.log
curl -fsS http://127.0.0.1:8787/api/health
```

Do not share credentials or photo payloads when sharing logs. Do not print `/etc/vibecheck.env` to troubleshoot.

Optional, only if using the existing face-alignment endpoint:

```bash
sudo apt-get install -y python3-opencv python3-numpy
/usr/bin/python3 -c 'import cv2, numpy; print("Face alignment dependencies ready")'
```

Add `PYTHON_BIN=/usr/bin/python3` to the environment file and restart. The archive includes `public/models` used by this route. This installs dependencies; it does not validate realistic 3D fitting or clothing generation.

## 10. Publish an update

On Windows, repeat **step 2** after your edits. On EC2:

```bash
sudo systemctl stop vibecheck
tar -xzf ~/vibecheck-ec2.tar.gz -C /opt/vibecheck
cd /opt/vibecheck
npm ci --include=dev
sudo systemctl start vibecheck
curl -fsS http://127.0.0.1:8787/api/health
```

This simple update has brief downtime. It preserves the separate environment file. Files removed from your project may remain from the previous extraction; use a fresh release directory for larger changes instead of treating this overlay update as a general release system.

## 11. After judging

Keep the instance reachable for the full judging period. Afterwards, stop it when unused or terminate it when you no longer need it. Check retained EBS volumes and Elastic IPs separately; stopping an instance does not remove every charge. Confirm credits in Billing rather than assuming the deployment is free.
