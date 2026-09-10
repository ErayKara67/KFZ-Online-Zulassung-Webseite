import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata = serviceMetadata("umweltplakette");

export default function Page() {
  return <ServicePage slug="umweltplakette" />;
}
