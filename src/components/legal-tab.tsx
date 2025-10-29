
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ShieldCheck, Server, CircleUserRound, Info, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const PrivacyPolicyContent = () => (
    <div className="space-y-6 text-muted-foreground">
        <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertTitle>A Friendly Note</AlertTitle>
            <AlertDescription>
                This privacy policy was created as a starting point. To make sure it fully complies with all legal requirements and fits your specific situation, it's always a good idea to review it with a legal professional.
            </AlertDescription>
        </Alert>
        
        <p className="text-foreground">Privacy Matters: We believe everyone deserves control over their own information. Here’s how we protect your data when you use Easy Speech AAC.</p>

        <div className="space-y-4">
        <h3 className="font-semibold text-xl text-foreground flex items-center gap-2"><Server className="h-5 w-5"/> For Guest Users</h3>
        <p>
            When you use the app as a guest, everything you create—like custom phrases, schedules, or mood entries—is saved directly on your device in your web browser.
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Your data stays with you.</strong> We do not have access to it, and it never gets sent to our servers.</li>
            <li><strong>It's completely private.</strong> Since your information is only on your device, it's for your eyes only.</li>
            <li><strong>Keep in mind:</strong> If you clear your browser's data or switch to a new device, your guest data will be lost. To save your data across devices, we recommend creating a free account.</li>
        </ul>
        </div>
        
        <div className="space-y-4">
        <h3 className="font-semibold text-xl text-foreground flex items-center gap-2"><ShieldCheck className="h-5 w-5"/> For Users with an Account</h3>
            <p>
                When you sign in with Google, we use Google's secure Firebase services to save your information and sync it across all your devices. Here’s what that means in simple terms:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>Secure Sign-In:</strong> We use your Google account to log you in. We only see basic info like your name and email, and we never see or store your password.</li>
                <li><strong>Cloud Sync:</strong> Your app data (phrases, moods, etc.) is stored securely in the cloud and linked only to your account.</li>
                <li><strong>Private To You:</strong> Thanks to strong security rules, only you can access your own information. No other user can ever see your data.</li>
                <li><strong>We do not sell, share, or use your data for advertising or analytics.</strong></li>
            </ul>
        </div>

        <div className="space-y-4">
        <h3 className="font-semibold text-xl text-foreground flex items-center gap-2"><CircleUserRound className="h-5 w-5"/> Your Rights & Data Control</h3>
            <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Access & Deletion:</strong> You can access, edit, and delete your data at any time directly within the app (e.g., deleting phrases, clearing mood history).</li>
            <li><strong>Account Deletion:</strong> If you wish to permanently delete your account and all associated data from our servers, please contact us at <a href="mailto:easyspeechaac@gmail.com" className="underline">easyspeechaac@gmail.com</a>. Once processed, all data will be removed from our Firebase database within 7 business days.</li>
        </ul>
        </div>
    </div>
);

const TermsOfServiceContent = () => (
    <div className="space-y-6 text-muted-foreground">
        <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertTitle>A Friendly Note</AlertTitle>
            <AlertDescription>
                Just like our Privacy Policy, this Terms of Service is a template. It's a solid starting point, but we strongly recommend consulting with a legal professional to make sure it's perfect for your needs.
            </AlertDescription>
        </Alert>

        <div className="space-y-4">
            <h3 className="font-semibold text-xl text-foreground">1. Use of the App</h3>
            <p>Easy Speech AAC is made to assist with communication and organization. You agree to use the app responsibly, for lawful purposes, and in a way that does not disrupt others' experience.</p>
        </div>

        <div className="space-y-4">
            <h3 className="font-semibold text-xl text-foreground">2. User Accounts</h3>
            <p>You are responsible for keeping your account secure. If you use Google to sign in, you also agree to Google’s terms of service. Guest data is stored locally on your device and may be lost if your browser data is cleared.</p>
        </div>

        <div className="space-y-4">
            <h3 className="font-semibold text-xl text-foreground">3. Disclaimers</h3>
            <p>This app is provided "as is," without any warranties. While we strive to make it reliable and accessible, we cannot guarantee complete error-free performance. Easy Speech AAC is a supportive tool, not a medical device!</p>
        </div>

        <div className="space-y-4">
            <h3 className="font-semibold text-xl text-foreground">4. Limitation of Liability</h3>
            <p>To the fullest extent permitted by law, the creator of Easy Speech AAC shall not be liable for any indirect, incidental, or consequential damages arising from using the app.</p>
        </div>
         <div className="space-y-4">
            <h3 className="font-semibold text-xl text-foreground">5. Changes to Terms</h3>
            <p>We may update these Terms from time to time. We encourage you to review this page periodically. Continued use of the app after updates indicates acceptance of the revised terms.</p>
        </div>
    </div>
);


export default function LegalTab() {
  return (
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Terms & Privacy</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="privacy">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="privacy">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Privacy Policy
                    </TabsTrigger>
                    <TabsTrigger value="tos">
                        <FileText className="mr-2 h-4 w-4" /> Terms of Service
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="privacy">
                    <PrivacyPolicyContent />
                </TabsContent>
                <TabsContent value="tos">
                    <TermsOfServiceContent />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
