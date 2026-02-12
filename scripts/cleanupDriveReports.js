/** @format */

const https = require("https");
const { URL } = require("url");

const clientId = process.env.GDRIVE_CLIENT_ID;
const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
const refreshToken = process.env.GDRIVE_REFRESH_TOKEN;
const retentionDays = Number(process.env.REPORT_RETENTION_DAYS || "30");

function requireEnv(name, value) {
	if (!value) throw new Error(`Missing ${name}`);
	return value;
}

function httpRequest(urlString, { method = "GET", headers = {}, body } = {}) {
	return new Promise((resolve, reject) => {
		const url = new URL(urlString);
		const req = https.request(
			{
				method,
				hostname: url.hostname,
				path: url.pathname + url.search,
				headers,
			},
			(res) => {
				let data = "";
				res.setEncoding("utf8");
				res.on("data", (chunk) => (data += chunk));
				res.on("end", () => resolve({ status: res.statusCode, body: data }));
			}
		);
		req.on("error", reject);
		if (body) req.write(body);
		req.end();
	});
}

async function getAccessToken() {
	requireEnv("GDRIVE_CLIENT_ID", clientId);
	requireEnv("GDRIVE_CLIENT_SECRET", clientSecret);
	requireEnv("GDRIVE_REFRESH_TOKEN", refreshToken);

	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		refresh_token: refreshToken,
		grant_type: "refresh_token",
	}).toString();

	const res = await httpRequest("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Content-Length": Buffer.byteLength(body),
		},
		body,
	});

	if (res.status < 200 || res.status >= 300) {
		throw new Error(`Token refresh failed: ${res.body}`);
	}

	return JSON.parse(res.body).access_token;
}

async function listFiles(accessToken) {
	const q =
		"name contains '-report-' and mimeType = 'application/zip' and trashed = false";

	const res = await httpRequest(
		`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
			q
		)}&fields=files(id,name,createdTime)`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	);

	if (res.status < 200 || res.status >= 300) {
		throw new Error(`List files failed: ${res.body}`);
	}

	return JSON.parse(res.body).files || [];
}

async function deleteFile(accessToken, fileId) {
	const res = await httpRequest(
		`https://www.googleapis.com/drive/v3/files/${fileId}`,
		{
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	);

	if (res.status !== 204) {
		throw new Error(`Delete failed for ${fileId}`);
	}
}

(async function run() {
	if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
		throw new Error("Invalid REPORT_RETENTION_DAYS");
	}

	const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
	console.log(`🧹 Deleting Drive reports older than ${retentionDays} days`);

	const token = await getAccessToken();
	const files = await listFiles(token);

	let deleted = 0;
	let skipped = 0;

	for (const file of files) {
		const createdAt = Date.parse(file.createdTime);
		if (!createdAt || createdAt >= cutoff) {
			skipped++;
			continue;
		}

		console.log(`🗑 Deleting ${file.name} (${file.createdTime})`);
		await deleteFile(token, file.id);
		deleted++;
	}

	console.log(`✅ Cleanup done. Deleted: ${deleted}, Skipped: ${skipped}`);
})().catch((err) => {
	console.error("❌ Drive cleanup failed");
	console.error(err.message || err);
	process.exit(1);
});
