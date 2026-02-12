/** @format */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { URL } = require("url");

const clientId = process.env.GDRIVE_CLIENT_ID;
const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
const refreshToken = process.env.GDRIVE_REFRESH_TOKEN;

const reportZip = process.env.REPORT_ZIP;
const reportNamePrefix = process.env.REPORT_NAME_PREFIX || "report";

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
				res.on("end", () =>
					resolve({ status: res.statusCode, headers: res.headers, body: data })
				);
			}
		);
		req.on("error", reject);
		if (body) req.write(body);
		req.end();
	});
}

function httpRequestStream(
	urlString,
	{ method = "PUT", headers = {}, stream } = {}
) {
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
				res.on("end", () =>
					resolve({ status: res.statusCode, headers: res.headers, body: data })
				);
			}
		);
		req.on("error", reject);
		stream.on("error", reject);
		stream.pipe(req);
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

	if (!res.status || res.status < 200 || res.status >= 300) {
		throw new Error(
			`Failed to refresh token (HTTP ${res.status}): ${res.body || ""}`
		);
	}

	const parsed = JSON.parse(res.body);
	if (!parsed.access_token)
		throw new Error("Token response missing access_token");
	return parsed.access_token;
}

async function createResumableUpload(accessToken, { filename, sizeBytes }) {
	const res = await httpRequest(
		"https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json; charset=UTF-8",
				"X-Upload-Content-Type": "application/zip",
				"X-Upload-Content-Length": String(sizeBytes),
			},
			body: JSON.stringify({ name: filename }),
		}
	);

	if (!res.status || res.status < 200 || res.status >= 300) {
		throw new Error(
			`Failed to start upload (HTTP ${res.status}): ${res.body || ""}`
		);
	}

	const location = res.headers.location;
	if (!location) throw new Error("Resumable upload missing Location header");
	return location;
}

async function uploadZip(accessToken, { zipPath, filename }) {
	const stats = fs.statSync(zipPath);
	const uploadUrl = await createResumableUpload(accessToken, {
		filename,
		sizeBytes: stats.size,
	});

	const res = await httpRequestStream(uploadUrl, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/zip",
			"Content-Length": String(stats.size),
		},
		stream: fs.createReadStream(zipPath),
	});

	if (!res.status || res.status < 200 || res.status >= 300) {
		throw new Error(
			`Failed to upload file bytes (HTTP ${res.status}): ${res.body || ""}`
		);
	}

	const parsed = JSON.parse(res.body);
	if (!parsed.id) throw new Error("Upload response missing file id");
	return parsed.id;
}

async function makePublic(accessToken, fileId) {
	const res = await httpRequest(
		`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ type: "anyone", role: "reader" }),
		}
	);

	if (!res.status || res.status < 200 || res.status >= 300) {
		throw new Error(
			`Failed to set permissions (HTTP ${res.status}): ${res.body || ""}`
		);
	}
}

async function getWebViewLink(accessToken, fileId) {
	const res = await httpRequest(
		`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/json",
			},
		}
	);

	if (!res.status || res.status < 200 || res.status >= 300) {
		throw new Error(
			`Failed to read file link (HTTP ${res.status}): ${res.body || ""}`
		);
	}

	const parsed = JSON.parse(res.body);
	if (!parsed.webViewLink)
		throw new Error("Drive response missing webViewLink");
	return parsed.webViewLink;
}

async function run() {
	requireEnv("REPORT_ZIP", reportZip);
	const zipPath = path.resolve(reportZip);
	if (!fs.existsSync(zipPath))
		throw new Error(`Report ZIP not found at: ${zipPath}`);

	const accessToken = await getAccessToken();
	const filename = `${reportNamePrefix}-${Date.now()}.zip`;
	const fileId = await uploadZip(accessToken, { zipPath, filename });
	await makePublic(accessToken, fileId);
	const link = await getWebViewLink(accessToken, fileId);

	console.log(`REPORT_LINK=${link}`);
}

run().catch((err) => {
	console.error("❌ Drive upload failed");
	console.error(err && err.message ? err.message : String(err));
	process.exit(1);
});
