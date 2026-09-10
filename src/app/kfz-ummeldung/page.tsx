import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata = serviceMetadata("kfz-ummeldung");

export default function Page() {
  return <ServicePage slug="kfz-ummeldung" />;
}
