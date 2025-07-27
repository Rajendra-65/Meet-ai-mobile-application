import { SidebarProvider } from "@/components/ui/sidebar";

interface Props {
    children : React.ReactNode;
}

const Layout = ({children} : Props) => {
    return(
        <SidebarProvider>
            <main className = "flex flex-col h-screen w-screen bg-muted">
                {children}
            </main>
        </SidebarProvider>
    )
}

export default Layout;