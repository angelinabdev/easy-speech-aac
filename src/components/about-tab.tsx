"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, HeartHandshake, Zap, Bot, Share2, Languages } from 'lucide-react';
import { Logo } from './logo';

export default function AboutTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="items-center text-center">
            <Logo className="h-16 w-16" />
            <CardTitle className="text-3xl pt-2">Easy Speech AAC</CardTitle>
            <CardDescription>An accessible, multi-functional AAC web platform.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 text-muted-foreground">
            <p>
                My name is Angelina, and I'm the creator of Easy Speech AAC. This project is deeply personal to me. My younger brother is autistic and nonverbal, and most AAC tools are expensive or complicated, putting them out of reach for many families.
            </p>
            <p>
                I developed Easy Speech AAC as a free, web-based, nonprofit platform. It’s designed to help individuals communicate, organize daily routines, track moods, and learn through gamified activities—all accessible from any device with a browser.
            </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <HeartHandshake className="h-6 w-6 text-red-500" />
                Why I'm Asking For Your Support
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">My goal is to keep Easy Speech AAC free forever with no subscription or locked features.</p>
            <p className="text-muted-foreground">
                However, running a web application has real costs. Hosting currently costs about $25 per year, but as the user base grows, Firebase and database scaling can reach up to $150/month.
            </p>
            <div>
                <p className="font-semibold">Your support will directly fund:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    <li>Hosting costs to keep the platform online.</li>
                    <li>Development of new features based on community feedback.</li>
                    <li>Ongoing updates to ensure data privacy, reliability, and accessibility.</li>
                </ul>
            </div>
            <p className="font-semibold text-center pt-4">Every coffee you buy helps keep this project alive! Support this project to provide communication for people who need it most!</p>
            <a href="https://buymeacoffee.com/easyspeechs" target="_blank" rel="noopener noreferrer">
              <Button className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Support the App
              </Button>
            </a>
            <p className="text-center text-sm text-muted-foreground pt-2">Thank you so much for your generosity!</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Future Roadmap</CardTitle>
          <CardDescription>Easy Speech AAC continues to evolve through community feedback and user research. Upcoming features include:</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Languages className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Multi-Language Support</h4>
                  <p className="text-sm text-muted-foreground">Adding more languages for both the interface and text-to-speech to make the app globally accessible.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Shared Caregiver Accounts</h4>
                  <p className="text-sm text-muted-foreground">Allowing multiple caregivers, therapists, or family members to securely access and manage a single user's profile.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">AI-Assisted Communication</h4>
                  <p className="text-sm text-muted-foreground">Integrating AI to provide communication suggestions and deeper insights into mood and behavior patterns.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">PWA & Offline Support</h4>
                  <p className="text-sm text-muted-foreground">Making the app installable on devices (Progressive Web App) and ensuring core features work without an internet connection.</p>
                </div>
              </li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
