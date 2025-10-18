export async function sendEmail(emailRequestDetails: {
  id: string;
  email: string;
  url: string;
  token: string;
  request: Request | undefined;
}): Promise<void> {
  console.log("email sending", emailRequestDetails);

  const baseUrl = process.env.WORKERS_URL;
  if (!baseUrl) throw new Error("Missing WORKERS_URL env var");

  const url = new URL("/", baseUrl);

  const res = await fetch(url.toString(), {
    method: "POST",
    body: JSON.stringify({ userId: emailRequestDetails.id }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to send email via worker", text);
    throw new Error("Failed to send email via worker");
  }

  const json = await res.json();

  console.log("Worker response:", json);
}
