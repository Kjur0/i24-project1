import { ProfileSettings } from "@/components/settings/profile-settings"
import { requireCurrentUser } from "@/lib/auth"

export default async function ProfileSettingsPage() {
  const user = await requireCurrentUser()

  return <ProfileSettings username={user.username} avatar={user.avatar ?? ""} />
}
