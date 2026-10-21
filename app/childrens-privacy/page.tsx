import LegalPage, { ContactLine } from "@/components/LegalPage";
export const metadata = { title: "Children's Privacy — AccuratKey" };
export default function ChildrensPrivacyPage() {
  return (
    <LegalPage
      title="Children's Privacy"
      intro="This page is for parents and guardians. AccuratKey lets a parent or guardian set up a profile for a child under 13. These profiles are kept limited, and parents can review or delete everything at any time."
      sections={[
        { h: "1. How child profiles work", p: ["Accounts are held by an adult who signs in with email, Google or GitHub. That adult creates a profile for each person who practices, and enters a birthday for each profile. When a profile's birthday shows the person is under 13, AccuratKey treats it as a restricted child profile."] },
        { h: "2. What restricted profiles can and can't do", ul: [
            "No public profile page and no leaderboard or daily-challenge scores.",
            "No username, so other players can't search for or find the profile, and challenges aren't available.",
            "No profile photo uploads. Avatars are chosen from the built-in icons.",
            "Ongoing practice progress (sessions, Keys, personal bests, streaks, stats) is kept on the device, not sent to our servers.",
          ] },
        { h: "3. What we do hold for a child profile", p: ["The profile itself — display name, birthday, and chosen avatar — is stored in our database under the parent's account so the profile can be found and managed. We do not ask for a child's email address, phone number, address, or precise location. We do not show ads to children or use their information for advertising."] },
        { h: "4. AI coach tips", p: ["After a level the app may show a short coaching tip. To create it, our server sends Google's Gemini service only the level name, pass/fail, WPM, accuracy and most-missed keys — never a name, birthday, username, email or account ID."] },
        { h: "5. What stays on the device", p: ["Preferences, run history, achievements and practice data live in the browser on that device. Clearing browser data or using \"Clear saved settings\" in Preferences removes them."] },
        { h: "6. Parent rights", p: ["As a parent or guardian you can:"], ul: [
            "Review the information in your child's profile from the profile settings.",
            "Delete your child's profile at any time from the profile settings; this removes the profile and any session records we hold.",
            "Delete the whole account, which removes every profile on it.",
            "Contact us to ask what we hold about your child, to have anything removed, or to refuse any further collection.",
          ] },
        { h: "7. Sharing", p: ["We do not share a child profile's information with other players. We share it only with the service providers that run the app (Google Firebase for the database and sign-in, and Vercel for hosting), and where the law requires."] },
        { h: "8. Contact", node: <p>To exercise any of these rights or ask a question about a child's information, <ContactLine />.</p> },
      ]}
    />
  );
}
