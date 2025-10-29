
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Gift, HeartHandshake } from 'lucide-react';

const resources = [
    {
        name: "Autism Speaks",
        description: "Promotes solutions across the spectrum and throughout the lifespan for individuals with autism and their families.",
        url: "https://www.autismspeaks.org"
    },
    {
        name: "Autism Society",
        description: "Offers support and resources to improve the lives of people with autism and their families.",
        url: "https://www.autism-society.org"
    },
    {
        name: "Autistic Self Advocacy Network",
        description: "Run by and for autistic people, advancing disability rights.",
        url: "https://autisticadvocacy.org"
    },
    {
        name: "Understood.org",
        description: "Provides resources and community for people with learning and attention issues.",
        url: "https://www.understood.org"
    }
];

export default function ResourcesTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
          <CardHeader>
              <CardTitle className="text-3xl">Resources</CardTitle>
              <CardDescription>Helpful links for caregivers and disability support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {resources.map(resource => (
                  <a 
                    key={resource.name} 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block p-4 border rounded-lg hover:bg-secondary transition-colors"
                    aria-label={`Opens ${resource.name} website in a new tab`}
                  >
                      <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-lg">{resource.name}</h3>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                  </a>
              ))}
          </CardContent>
      </Card>
      
       <Card>
          <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                    <Gift className="h-6 w-6 text-accent"/>
                    Support Our Mission
                </CardTitle>
                 <CardDescription>Your contribution can make a difference in two meaningful ways. Choose how you'd like to help.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg bg-background">
                    <h3 className="font-semibold flex items-center gap-2"><HeartHandshake className="h-5 w-5 text-red-500" /> Donate to Autism Research</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                        As the caretaker for my nonverbal, autistic brother, this mission is personal. Your donation to Autism Speaks helps fund therapies, resources, and research that empower individuals with autism.
                    </p>
                    <a href="https://www.gofundme.com/f/support-autism-speaks-every-dollar-helps" target="_blank" rel="noopener noreferrer" aria-label="Donate to Autism Speaks on GoFundMe (opens in a new tab)">
                        <Button className="w-full">Donate via GoFundMe <ExternalLink className="ml-2 h-4 w-4"/></Button>
                    </a>
                </div>
                <div className="p-4 border rounded-lg bg-background">
                    <h3 className="font-semibold flex items-center gap-2"><Gift className="h-5 w-5 text-blue-500" /> Support App Funding</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                        This app is free to use, but hosting and development have costs. A small contribution helps keep the servers running, supports future updates, and brings communication tools to families who need them most.
                    </p>
                    <a href="https://buymeacoffee.com/easyspeechs" target="_blank" rel="noopener noreferrer" aria-label="Support the app on Buy Me a Coffee (opens in a new tab)">
                        <Button className="w-full" variant="default">Support the App <ExternalLink className="ml-2 h-4 w-4"/></Button>
                    </a>
                </div>
            </CardContent>
      </Card>
      
    </div>
  );
}

    