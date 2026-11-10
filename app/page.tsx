import Site from "@/components/Site";
import { SPRITES } from "@/components/sprites";
import { getPublicCampaigns, getSiteSettings } from "@/lib/campaigns";

export default function Page() {
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITES }} />
      <Site campaigns={getPublicCampaigns()} site={getSiteSettings()} initialNow={Date.now()} />
    </>
  );
}
