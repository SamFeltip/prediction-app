export async function sendEmail(emailRequestDetails: {
  id: string;
  email: string;
  url: string;
  token: string;
  request: Request | undefined;
}): Promise<void> {
  console.log(emailRequestDetails);

  throw new Error("not implemented");
}
