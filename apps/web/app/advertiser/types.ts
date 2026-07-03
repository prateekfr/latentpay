export type Surface = "extension" | "terminal";
export type DeliverySpeed = "slow" | "medium" | "fast";
export type CampaignStatus = "serving" | "queued" | "paused" | "completed";

// "Extension"/"Terminal" are the internal auction surface names — this maps
// each to the actual client product advertisers recognize.
export const SURFACE_LABELS: Record<Surface, string> = {
  extension: "Extension (Chrome)",
  terminal: "Terminal (VS Code)",
};

export interface CampaignDTO {
  id: string;
  adLine: string;
  targetUrl: string;
  companyName: string | null;
  brandIconUrl: string | null;
  showOnLeaderboard: boolean;
  surface: Surface;
  deliverySpeed: DeliverySpeed;
  bidPerBlock: number;
  numBlocks: number;
  viewsPurchased: number;
  viewsDelivered: number;
  clicksDelivered: number;
  spend: number;
  status: CampaignStatus;
  createdAt: string;
}

export interface BidQueueEntry {
  id: string;
  adLine: string;
  companyName: string | null;
  brandIconUrl: string | null;
  bidPerBlock: number;
  viewsDelivered: number;
  status: CampaignStatus;
}
