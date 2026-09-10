import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata = serviceMetadata("umzugsmeldung");

export default function Page() {
  return <ServicePage slug="umzugsmeldung" />;
}
