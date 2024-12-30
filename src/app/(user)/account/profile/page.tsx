// app/(user)/users/[userId]/profile/page.tsx
import { auth } from "@/server/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();

  if (!session?.user) {
    return null; // Layout will handle the redirect
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                defaultValue={session.user.name ?? ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue={session.user.email ?? ""}
                disabled
              />
            </div>
          </div>
          <Button className="mt-4">Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
