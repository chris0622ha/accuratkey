import LegalPage, { ContactLine } from "@/components/LegalPage";
export const metadata = { title: "Privacy Policy — AccuratKey" };
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="The short version: AccuratKey is a typing practice app. We collect only what we need to run accounts, save progress and keep things fair. We don't sell personal information and we don't show ads. Profiles for children under 13 are limited and keep their progress on the device — see Children's Privacy."
      sections={[
        { h: "1. Who we are", p: ["AccuratKey (\"we\", \"us\") is a typing trainer available at accuratkey.vercel.app. This policy explains what information the app collects, why, and the choices you have."] },
        { h: "2. What we collect", p: ["Account information. If you sign in with email, Google or GitHub, we receive your email address and, for Google or GitHub, your name and profile picture as provided by them. Passwords are handled by our sign-in provider (Google Firebase Authentication); we never see them."],
          ul: [
            "Profile information: the display name, avatar and birthday you enter for each profile (the birthday is used to decide which features are available by age), an optional profile photo (only for people 13 and older), and an optional profile PIN.",
            "Progress and activity: levels unlocked, Keys, items you've unlocked or equipped (themes, fonts, sounds), best WPM, accuracy, streaks, and a record of each practice session (WPM, accuracy, level, characters typed, keyboard layout, pass/fail).",
            "Public information (people 13 and older who choose a username): your username, avatar and, if you play the daily challenge, your WPM and accuracy on the daily leaderboard.",
            "Social features (13 and older): friend requests, friends, and challenges you send or receive.",
            "Community word sets (13 and older): if you submit a word set, we store its title and words, along with your account ID, only while it waits for review (the account ID is used to limit one pending submission per person and to deal with abuse, and is never shown to other users). When an administrator approves or rejects it, the pending record is deleted. An approved set is published with only its title, words and an optional quality badge, with no username or other identifying information. So we can tell you if an approved set is later removed, an administrator-only record links the set to your account ID; it is never public and is deleted when the set is removed. Submissions are also checked automatically for personal information and inappropriate words. Please don't put personal information in a word set.",
            "Feedback you send: your message, an optional screenshot you attach, and your account ID so we can reply to you.",
            "Safety records: bans, warnings and anti-cheat flags, and a log of actions taken by administrators.",
            "Technical data: our hosting provider (Vercel) and database provider (Google Firebase) process standard connection data such as IP address, browser type and request time to deliver the service and keep it secure.",
          ] },
        { h: "3. What stays on your device", p: ["Some features store data only in your browser's local storage on your device and never send it to us: your Preferences (text size, caret, volume and so on), personal bests and run history used by the Stats screen, achievements, daily goals, per-key practice data for the Practice lab, the first-run tour and \"What's new\" flags, and whether the installed app has been opened. Clearing your browser data, or using \"Clear saved settings\" in Preferences, removes it.","Cookies and similar storage: the storage needed to sign you in and keep your progress is always used. Run history, replays, key stats, missed words, goals and favorites are saved only if you accept them in the cookie notice, and you can change your choice at any time with the Cookies link in Settings or at the bottom of the legal pages. Turning them off erases what was saved. We remember your cookie choice in your browser's storage and in one small first-party cookie named ak_consent that lasts a year. We do not use advertising or tracking cookies."] },
        { h: "4. AI coach", p: ["After a level, the app can show a short coaching tip. To write it, our server sends Google's Gemini service the level name, whether you passed, your WPM and accuracy, and the keys you missed most. We do not send your name, email, username or account ID. Google processes that request under its own terms, and tips are generated automatically and can be wrong."] },
        { h: "5. How we use information", p: ["We do not sell personal information, we do not use it for advertising, and we do not use third-party advertising or analytics trackers in the app. We use information:"], ul: [
            "To run the app: sign you in, save and show your progress, unlock levels and items, and show leaderboards and friend features to people 13 and older.",
            "To keep things fair and safe: prevent cheating and abuse, enforce our Terms, and respond to reports.",
            "To support you: answer feedback and requests.",
            "To maintain and improve AccuratKey, for example by looking at which levels people find hardest.",
          ] },
        { h: "6. Who we share it with", p: ["We share information only with the service providers that help us run AccuratKey, and only as needed:"],
          ul: [
            "Google Firebase (authentication and database) and Google Gemini (AI coach tips).",
            "Vercel (website hosting).",
            "Google or GitHub, if you choose to sign in with them.",
            "Other players, but only the public information in section 2 and only for people 13 and older.",
            "Authorities or other parties when we reasonably believe the law requires it or to protect the safety of our users.",
          ] },
        { h: "7. Keeping and deleting your information", p: ["We keep your information while your account exists. You can delete a profile (this removes the profile and its session records) or your whole account (this removes all of your profiles and your sign-in account) from the profile settings in the app. Some items are not removed automatically — for example old daily leaderboard entries, feedback messages you sent, and records of bans or warnings. If you want any of these removed, contact us and we'll take care of it. Backups and logs held by our providers are deleted on their normal schedules."] },
        { h: "8. Your choices", ul: [
            "See and correct your profile information in the profile settings.",
            "Download a copy of your profile and saved settings with \"Download my data\" in Preferences.",
            "Choose not to set a username, upload a photo, or use friends, challenges and the leaderboard.",
            "Delete a profile or your account at any time.",
            "Ask us to access, correct or delete anything we hold about you.",
          ] },
        { h: "9. Security", p: ["We use reputable providers that encrypt data in transit, and we limit who can see account data. No online service can promise perfect security, so please pick a strong password and don't share your sign-in."] },
        { h: "10. Where data is processed", p: ["AccuratKey is operated from the United States. Our providers may process data in the United States and other countries where they operate."] },
        { h: "11. Children", p: ["Profiles for children under 13 are handled differently and are described in our Children's Privacy page. We do not knowingly collect personal information from children under 13 outside of what that page describes."] },
        { h: "12. Changes", p: ["If we make meaningful changes to this policy we'll update the date above and, where appropriate, tell you in the app."] },
        { h: "13. Contact", node: <p>Questions, or a request about your information? <ContactLine />.</p> },
      ]}
    />
  );
}
