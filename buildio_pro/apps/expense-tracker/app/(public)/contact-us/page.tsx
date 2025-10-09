import { ContactUsForm } from "@/components/organisms/contact-us/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function Page() {
  return (
    <div className="flex flex-col justify-center items-center gap-5 w-full">
      <div className="w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContactUsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
