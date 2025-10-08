import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";

interface UploadedFile {
  key: string;
  url: string;
  name: string;
  // optional metadata
  contentType?: string;
  size?: number;
}

interface UploadedFilesCardProps {
  uploadedFiles: UploadedFile[];
}

export function UploadedFilesCard({
  uploadedFiles,
}: Readonly<UploadedFilesCardProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded files</CardTitle>
        <CardDescription>View the uploaded files here</CardDescription>
      </CardHeader>
      <CardContent>
        {uploadedFiles.length > 0 ? (
          <ScrollArea className="pb-4">
            <div className="flex w-max space-x-2.5">
              {uploadedFiles.map((file) => (
                <div key={file.key} className="relative aspect-video w-64">
                  <img
                    src={file.url}
                    alt={file.name}
                    sizes="(min-width: 640px) 640px, 100vw"
                    loading="lazy"
                    className="rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : null}
      </CardContent>
    </Card>
  );
}
