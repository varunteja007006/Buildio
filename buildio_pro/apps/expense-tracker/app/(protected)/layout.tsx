import PageWrapper from "@/components/organisms/navigation/page-wrapper";
import ProtectedProvider from "./protected-provider";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PageWrapper>
      <ProtectedProvider>{children}</ProtectedProvider>
    </PageWrapper>
  );
}
