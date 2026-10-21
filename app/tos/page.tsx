import LegalPage, { ContactLine } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";
export const metadata = { title: "Terms of Service — AccuratKey" };
export default function TOSPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="By using AccuratKey you agree to these terms. They're written to be readable — the basics are: be fair, be kind, don't cheat or break things, and know that Keys are just in-app points."
      sections={[
        { h: "1. Using AccuratKey", p: ["AccuratKey is a typing practice app. These terms apply to your use of the site and the app (the \"Service\"). If you don't agree, please don't use it."] },
        { h: "2. Who can use it", ul: [
            "You must be 13 or older to hold your own account and use social features such as usernames, friends, challenges and leaderboards.",
            "A parent or guardian may create and manage a restricted profile for a child under 13 on their own account. The adult is responsible for that profile and for confirming they are the child's parent or legal guardian.",
            "Everyone must provide accurate birthday information. Entering a false birthday to unlock features is not allowed.",
          ] },
        { h: "3. Your account", p: ["You're responsible for activity on your account and for keeping your sign-in secure. Tell us if you think someone else has access. You can delete your profiles or account at any time from the profile settings."] },
        { h: "4. Play fair and be kind", p: ["Please don't:"], ul: [
            "Cheat or bypass the game's rules, including using bots, scripts, macros or automated input, editing local data or network requests to change scores, Keys or unlocks, or exploiting bugs (please report them instead).",
            "Choose a username, name or photo that is offensive, hateful, sexual, or impersonates someone else.",
            "Harass, threaten or bully other people, or post personal information about others.",
            "Probe, scrape, overload or attempt to break into the Service or other people's accounts.",
            "Use the Service for anything illegal.",
          ] },
        { h: "5. Keys and unlockable items", p: ["Keys are an in-app point system you earn by practicing and spend on themes, fonts and sounds. Keys and items have no cash value, can't be bought with money, sold or transferred, and aren't your property. We may change prices, earning rates and daily limits, and may adjust or reset Keys, items or scores that were obtained unfairly or by mistake."] },
        { h: "6. Your content", p: ["You keep ownership of what you submit (such as feedback, a screenshot, or text you paste into the Practice lab, which stays on your device). You give us permission to use feedback and screenshots you send us to run, fix and improve the Service. Public information such as your username, avatar and daily-challenge score may be shown to other players."] },
        { h: "7. AI coach tips", p: ["Coaching tips are generated automatically and are general practice guidance. They can be wrong, and they are not professional advice."] },
        { h: "8. Our content", p: ["The AccuratKey name, design, icons, level content and code belong to us or our licensors. You may use the Service for your own personal practice, but you may not copy, resell or build a competing service from it."] },
        { h: "9. Changes, availability and ending use", p: ["We may update, pause or discontinue features, and the Service may be unavailable for maintenance or reasons outside our control. We may warn, suspend or ban accounts that break these terms or harm other players. You can stop using AccuratKey and delete your account whenever you like."] },
        { h: "10. No warranty", p: ["AccuratKey is provided \"as is\" and \"as available\". We don't promise it will be uninterrupted, error-free, or that your progress will never be lost, so don't rely on it for anything critical."] },
        { h: "11. Limit of liability", p: ["To the extent the law allows, AccuratKey and the people who run it are not liable for indirect, incidental or consequential damages, or for loss of data or progress, arising from your use of the Service. Nothing in these terms limits rights you have under the law that can't be limited."] },
        { h: "12. Privacy", p: ["Our Privacy Policy and Children's Privacy page explain how we handle information, and form part of these terms."] },
        { h: "13. Governing law", p: [`These terms are governed by the laws of the State of ${LEGAL.state}, without regard to conflict-of-law rules. Any dispute will be handled in the state or federal courts located in ${LEGAL.state}, unless the law requires otherwise.`] },
        { h: "14. Changes to these terms", p: ["We may update these terms. If changes are significant we'll update the date above and, where appropriate, tell you in the app. Continuing to use AccuratKey after a change means you accept it."] },
        { h: "15. Contact", node: <p>Questions about these terms? <ContactLine />.</p> },
      ]}
    />
  );
}
