import { Button } from "@/components/ui/button";
import { LoginSchema } from "@/validation-schema/auth";

export const metadata = { title: "Home" };

export default function Home() {
    console.log(LoginSchema); // usage
    return (
        <main>
            <Button>Click me</Button>
        </main>
    );
}

// Ensure generateMetadata is ignored too
export function generateMetadata() {
    return { title: "Dynamic" };
}
