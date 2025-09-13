"use client";

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Trash2, User, Phone, Plus, Clipboard, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Contact = { id: string; name: string; relation: string; phone: string };
type ListItem = { id: string; text: string };

export default function AboutMeTab() {
  const [name, setName] = useLocalStorage('about_me_name', '');
  const [contacts, setContacts] = useLocalStorage<Contact[]>('about_me_contacts', []);
  const [medical, setMedical] = useLocalStorage('about_me_medical', '');
  const [communication, setCommunication] = useLocalStorage('about_me_communication', '');
  const [likes, setLikes] = useLocalStorage<ListItem[]>('about_me_likes', []);
  const [dislikes, setDislikes] = useLocalStorage<ListItem[]>('about_me_dislikes', []);

  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');
  
  const { toast } = useToast();

  const addContact = () => {
    if (newContactName && newContactRelation && newContactPhone) {
      setContacts([...contacts, { id: Date.now().toString(), name: newContactName, relation: newContactRelation, phone: newContactPhone }]);
      setNewContactName('');
      setNewContactRelation('');
      setNewContactPhone('');
    }
  };

  const addLike = () => {
    if (newLike) {
      setLikes([...likes, { id: Date.now().toString(), text: newLike }]);
      setNewLike('');
    }
  };
  
  const addDislike = () => {
    if (newDislike) {
      setDislikes([...dislikes, { id: Date.now().toString(), text: newDislike }]);
      setNewDislike('');
    }
  };
  
  const deleteItem = <T extends {id: string}>(items: T[], setItems: (items: T[]) => void, id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const getShareableText = () => {
    let text = `--- ABOUT ME ---\n`;
    text += `Name: ${name || 'Not specified'}\n\n`;
    text += `--- EMERGENCY CONTACTS ---\n`;
    if (contacts.length > 0) {
        contacts.forEach(c => {
            text += `- ${c.name} (${c.relation}): ${c.phone}\n`;
        });
    } else {
        text += 'No contacts listed.\n';
    }
    text += `\n--- ALLERGIES & MEDICAL NOTES ---\n`;
    text += `${medical || 'No notes.'}\n\n`;
    text += `--- COMMUNICATION STYLE ---\n`;
    text += `${communication || 'Not specified.'}\n\n`;
    text += `--- LIKES ---\n`;
    text += likes.length > 0 ? likes.map(l => `- ${l.text}`).join('\n') : 'No likes listed.';
    text += `\n\n--- DISLIKES ---\n`;
    text += dislikes.length > 0 ? dislikes.map(d => `- ${d.text}`).join('\n') : 'No dislikes listed.';
    return text;
  }

  const handleShare = () => {
    const shareText = getShareableText();
    navigator.clipboard.writeText(shareText);
    toast({
        title: "Information Copied!",
        description: "Your 'About Me' info has been copied to the clipboard.",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
        printWindow.document.write('<html><head><title>About Me</title>');
        printWindow.document.write('<style>body { font-family: sans-serif; line-height: 1.6; } h2 { border-bottom: 2px solid #eee; padding-bottom: 5px; } ul { padding-left: 20px; } .section { margin-bottom: 20px; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>About ${name || 'Me'}</h1>`);
        
        printWindow.document.write('<div class="section">');
        printWindow.document.write(`<h2>Basic Information</h2><p><strong>Name:</strong> ${name || 'Not specified'}</p>`);
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="section">');
        printWindow.document.write('<h2>Allergies & Medical Notes</h2>');
        printWindow.document.write(`<p>${medical ? medical.replace(/\n/g, '<br>') : 'No notes.'}</p>`);
        printWindow.document.write('</div>');

        printWindow.document.write('<div class="section">');
        printWindow.document.write('<h2>Communication Style</h2>');
        printWindow.document.write(`<p>${communication ? communication.replace(/\n/g, '<br>') : 'Not specified.'}</p>`);
        printWindow.document.write('</div>');

        printWindow.document.write('<div class="section">');
        printWindow.document.write('<h2>Emergency Contacts</h2>');
        if (contacts.length > 0) {
            printWindow.document.write('<ul>');
            contacts.forEach(c => {
                printWindow.document.write(`<li><strong>${c.name}</strong> (${c.relation}): ${c.phone}</li>`);
            });
            printWindow.document.write('</ul>');
        } else {
            printWindow.document.write('<p>No contacts listed.</p>');
        }
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="section">');
        printWindow.document.write('<h2>Likes</h2>');
        if (likes.length > 0) {
            printWindow.document.write('<ul>');
            likes.forEach(l => printWindow.document.write(`<li>${l.text}</li>`));
            printWindow.document.write('</ul>');
        } else {
            printWindow.document.write('<p>No likes listed.</p>');
        }
        printWindow.document.write('</div>');

        printWindow.document.write('<div class="section">');
        printWindow.document.write('<h2>Dislikes</h2>');
        if (dislikes.length > 0) {
            printWindow.document.write('<ul>');
            dislikes.forEach(d => printWindow.document.write(`<li>${d.text}</li>`));
            printWindow.document.write('</ul>');
        } else {
            printWindow.document.write('<p>No dislikes listed.</p>');
        }
        printWindow.document.write('</div>');

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">About Me</h2>
          <p className="text-muted-foreground">A safe place for important personal information. All data is stored on this device only.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleShare} variant="outline"><Clipboard className="mr-2 h-4 w-4"/> Share</Button>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Print</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name..." />
            </div>
            <div>
              <Label htmlFor="medical">Allergies & Medical Notes</Label>
              <Textarea id="medical" value={medical} onChange={(e) => setMedical(e.target.value)} placeholder="e.g., Allergic to peanuts, asthma..." />
            </div>
             <div>
              <Label htmlFor="communication">Communication Style</Label>
              <Textarea id="communication" value={communication} onChange={(e) => setCommunication(e.target.value)} placeholder="e.g., I use this app to talk. Please be patient." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Emergency Contacts</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Input value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="Name" />
                <Input value={newContactRelation} onChange={(e) => setNewContactRelation(e.target.value)} placeholder="Relation (e.g., Mom)" />
                <Input type="tel" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} placeholder="Phone Number" />
                <Button onClick={addContact} size="sm" className="w-full"><Plus className="mr-2 h-4 w-4"/>Add Contact</Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {contacts.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4"/>
                            <div>
                               <p className="font-semibold">{c.name} <span className="text-xs text-muted-foreground">({c.relation})</span></p>
                               <p className="flex items-center text-sm"><Phone className="h-3 w-3 mr-1"/>{c.phone}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteItem(contacts, setContacts, c.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>My Favorite Things (Likes)</CardTitle></CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input value={newLike} onChange={e => setNewLike(e.target.value)} placeholder="e.g., Watching cartoons" />
                    <Button onClick={addLike}><Plus className="h-4 w-4"/></Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {likes.map(l => (
                        <div key={l.id} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                            <p>{l.text}</p>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem(likes, setLikes, l.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Things I Don't Like (Dislikes)</CardTitle></CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input value={newDislike} onChange={e => setNewDislike(e.target.value)} placeholder="e.g., Loud noises" />
                    <Button onClick={addDislike}><Plus className="h-4 w-4"/></Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {dislikes.map(d => (
                        <div key={d.id} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                            <p>{d.text}</p>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem(dislikes, setDislikes, d.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
