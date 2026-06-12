import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim();
});

async function uploadFile() {
    const key = env.VITE_GEMINI_API_KEY;
    const body = new Blob(["test file content"], { type: 'text/plain' });
    
    // Initial resumable request
    const initRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${key}`, {
        method: 'POST',
        headers: {
            'X-Goog-Upload-Protocol': 'resumable',
            'X-Goog-Upload-Command': 'start',
            'X-Goog-Upload-Header-Content-Length': '17',
            'X-Goog-Upload-Header-Content-Type': 'text/plain',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file: { displayName: 'test.txt' } })
    });
    
    const uploadUrl = initRes.headers.get('x-goog-upload-url');
    console.log("Upload URL:", !!uploadUrl);
    console.log(await initRes.json());
}
uploadFile();
