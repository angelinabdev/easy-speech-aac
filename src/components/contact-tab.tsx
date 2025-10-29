
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Mail, Github, Instagram } from 'lucide-react';

export default function ContactTab() {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-3xl">Contact Us</CardTitle>
            <CardDescription>Have questions or feedback? We'd love to hear.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Contact Form</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">For general inquiries or feedback, please use the contact form below. Since this is an independent project, I’ll do my best to respond within a few days. All responses appreciated!</p>
                <a href="https://formsubmit.co/el/covedi" target="_blank" rel="noopener noreferrer">
                    <Button>Open Contact Form <ExternalLink className="ml-2 h-4 w-4"/></Button>
                </a>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <a href="mailto:easyspeechaac@gmail.com" className="block p-4 border rounded-lg hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                        <Mail className="h-6 w-6 text-accent"/>
                        <div>
                            <h4 className="font-semibold">Email</h4>
                            <p className="text-sm text-muted-foreground">easyspeechaac@gmail.com</p>
                        </div>
                    </div>
                </a>
                <a href="https://github.com/angelinabdev/easy-speech-aac" target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                        <Github className="h-6 w-6 text-accent"/>
                        <div>
                            <h4 className="font-semibold">GitHub</h4>
                            <p className="text-sm text-muted-foreground">View the project</p>
                        </div>
                    </div>
                </a>
                <a href="https://www.instagram.com/easyspeechaac" target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                        <Instagram className="h-6 w-6 text-accent"/>
                        <div>
                            <h4 className="font-semibold">Instagram</h4>
                            <p className="text-sm text-muted-foreground">Follow for updates</p>
                        </div>
                    </div>
                </a>
            </div>
        </CardContent>
    </Card>
  );
}

    