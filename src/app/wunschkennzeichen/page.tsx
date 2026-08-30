import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata = serviceMetadata("wunschkennzeichen");

export default function Page() {
  return <ServicePage slug="wunschkennzeichen" />;
}
