export function toUserFriendlyUploadError(error: unknown): string {
  const fallback = "We could not parse this export. Please try exporting again from WhatsApp and upload the ZIP file.";

  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.toLowerCase();

  if (message.includes("not a valid zip")) {
    return "This file is not a valid ZIP archive. Re-export your chat from WhatsApp and upload the .zip file.";
  }

  if (message.includes("no .txt chat files found")) {
    return "ZIP opened, but no WhatsApp .txt chat files were found. Make sure you selected Export Chat and uploaded the full ZIP.";
  }

  if (message.includes("no chat messages were detected")) {
    return "We found chat files, but no messages could be parsed. Try a fresh export and keep WhatsApp's original date format.";
  }

  if (message.includes("unsupported format") || message.includes("invalid timestamp")) {
    return "This export format looks unsupported. Try a new export from WhatsApp without editing the .txt files.";
  }

  return error.message || fallback;
}
