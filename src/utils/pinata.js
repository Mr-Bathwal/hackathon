import { PinataSDK } from "pinata-web3";

export const pinata = new PinataSDK({
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlOTVmNjIwNC0yODExLTRkMmQtOTc3My0zOGIzMjg4ODE3YmQiLCJlbWFpbCI6ImFsZW5pc3NhY3NhbTA1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJhMWIzYTkzYTcwNmE0ODJkOTE3NyIsInNjb3BlZEtleVNlY3JldCI6ImEzOTU2YTExYzA5ZWE4Y2YyMmFhYjY5MTJmNmMxYTkwOTg4NDBiY2E3NjUxMjI0ZmUyZjBlM2FiOGViODYyZTgiLCJleHAiOjE3ODc1MTI2NjJ9.kireLFFQ07Ld_bIehOR6tRooTLOCaGhxGyJo3A1L-_0",
  pinataGateway: "gateway.pinata.cloud",
});

export const PINATA_CONFIG = {
  apiKey: 'a1b3a93a706a482d9177',
  apiSecret: 'a3956a11c09ea8cf22aab6912f6c1a9098840bca7651224fe2f0e3ab8eb862e8',
  gateway: 'https://gateway.pinata.cloud/ipfs/',
};

export async function uploadToPinata(file, metadata) {
  try {
    const upload = await pinata.upload.file(file).addMetadata({
      name: `${metadata.name} - ${metadata.seatNumber}`,
      keyValues: {
        eventName: metadata.eventName,
        seatNumber: metadata.seatNumber.toString(),
        isVIP: metadata.isVIP.toString(),
        venue: metadata.venue,
      }
    });
    return upload;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

export async function uploadMetadataToPinata(metadata) {
  try {
    const upload = await pinata.upload.json(metadata).addMetadata({
      name: `${metadata.name} Metadata`,
    });
    return upload;
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw error;
  }
}

export async function generateTicketImage(ticketData) {
  // Generate a simple ticket image using canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 400;
  canvas.height = 200;
  
  // Background
  const gradient = ctx.createLinearGradient(0, 0, 400, 200);
  gradient.addColorStop(0, ticketData.isVIP ? '#ffd700' : '#667eea');
  gradient.addColorStop(1, ticketData.isVIP ? '#ff8c00' : '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 200);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(ticketData.eventName, 20, 40);
  
  ctx.font = '16px Arial';
  ctx.fillText(`Venue: ${ticketData.venue}`, 20, 70);
  ctx.fillText(`Seat: #${ticketData.seatNumber}`, 20, 95);
  ctx.fillText(`Type: ${ticketData.isVIP ? 'VIP' : 'Regular'}`, 20, 120);
  
  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
}
