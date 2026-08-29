import { ServicePage, serviceMetadata } from "@/components/service-page";

export const metadata = serviceMetadata("kfz-abmeldung");

export default function Page() {
  return <ServicePage slug="kfz-abmeldung" />;
}
