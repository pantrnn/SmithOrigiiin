import AdminLayout from "../components/sidebar/Sidebar";

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode; }>) {
  return <AdminLayout>{children}</AdminLayout>;
}