"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface HelpContentProps {
  activeTab: string;
}

const helpData: { [key: string]: { title: string; steps: string[] }[] } = {
  dashboard: [
    {
      title: "Switching Your Role",
      steps: [
        "1. Locate the 'Switch Role' card on the right side of the screen.",
        "2. Click on the dropdown menu which shows your current role (e.g., 'user' or 'caregiver').",
        "3. Select the desired role from the list. The view will automatically update."
      ]
    },
    {
        title: "Understanding Features",
        steps: [
            "1. The 'Welcome' card on the left lists the key features of the app.",
            "2. Read through the list to get an overview of what you can do.",
        ]
    }
  ],
  "about-me": [
    {
        title: "Editing Your Information",
        steps: [
            "1. Click into any text field (like 'Name' or 'Allergies') to start typing.",
            "2. Your changes are saved automatically as you type.",
        ]
    },
    {
        title: "Managing Lists (Contacts, Likes, Dislikes)",
        steps: [
            "1. To add an item, fill out the input fields in the corresponding card (e.g., 'Name' and 'Phone' for a contact).",
            "2. Click the 'Add' button to save the item to the list.",
            "3. To remove an item, click the trash can icon next to it.",
        ]
    },
    {
        title: "Sharing & Printing Your Info",
        steps: [
            "1. Click the 'Share' button at the top to copy a summary of your information to the clipboard.",
            "2. You can then paste this into an email or text to share it.",
            "3. Click the 'Print' button to open a printer-friendly version of your 'About Me' page.",
        ]
    }
  ],
  planner: [
    {
      title: "Adding an Activity to the Schedule",
      steps: [
        "1. Find the 'Activities' list on the left.",
        "2. Click and hold on an activity you want to add (e.g., 'Brush Teeth').",
        "3. Drag the activity to the 'Schedule' box on the right and release the mouse button.",
        "4. The activity will now appear in your daily schedule."
      ]
    },
    {
      title: "Creating a Custom Activity",
      steps: [
        "1. Type your new activity into the 'Add a custom activity...' input field.",
        "2. You can add emojis using the smiley face button.",
        "3. Press 'Enter' or click the '+' button to add it to the 'Activities' list.",
        "4. You can now drag your custom activity to the schedule."
      ]
    },
    {
        title: "Completing a Scheduled Activity",
        steps: [
            "1. In the 'Schedule' box, find the activity you have completed.",
            "2. Click the checkmark icon on the right side of the activity.",
            "3. The activity will be marked as complete, and you'll earn points for it!",
        ]
    },
    {
        title: "Managing the Schedule",
        steps: [
            "To remove an item, click the trash can icon next to it.",
            "To clear the entire schedule but keep points, use the 'Clear Schedule' button.",
            "To print your schedule, click the 'Print Schedule' button."
        ]
    }
  ],
  phrases: [
    {
      title: "Speaking a Phrase",
      steps: [
        "1. Navigate to the correct tab ('Want', 'Need', or 'Feel').",
        "2. Find the phrase you want to say.",
        "3. Click the speaker icon next to the phrase to have it spoken aloud.",
      ]
    },
    {
        title: "Adding a New Phrase",
        steps: [
            "1. In the desired category, type your new phrase into the input field (e.g., 'Add a 'want' phrase...').",
            "2. Click the '+' button or press Enter to add it to the list."
        ]
    },
    {
        title: "Managing Phrases",
        steps: [
            "To favorite a phrase, click the star icon.",
            "To delete a phrase, click the trash can icon.",
            "Use the search bar and sort dropdown to find phrases easily."
        ]
    },
    {
        title: "Changing the Voice",
        steps: [
            "1. Find the 'Custom Voice' card.",
            "2. Click the dropdown to see a list of available voices.",
            "3. Select a new voice. All spoken phrases will now use this voice."
        ]
    }
  ],
  soundboard: [
    {
        title: "Playing a Sound",
        steps: [
            "1. Simply click on any button in the grid.",
            "2. The sound described on the button (e.g., 'Yes', 'No') will play immediately.",
            "3. Use these sounds for quick, non-verbal communication.",
        ]
    }
  ],
  games: [
    {
        title: "Playing Sentence Builder",
        steps: [
            "1. Click the 'Play Now' button to start the game.",
            "2. Read the instruction prompt at the top.",
            "3. Drag and drop the word tiles into the correct order to form a sentence.",
            "4. Once you think the sentence is correct, click the 'Check Sentence' button.",
            "5. If correct, you'll move to the next sentence. If incorrect, try rearranging the words again."
        ]
    },
    {
        title: "Playing Emotion Match",
        steps: [
            "1. Click the 'Play Now' button to open the game.",
            "2. Read the question at the top, which asks you to find a specific feeling (e.g., 'Happy').",
            "3. Click on the face emoji that you think matches the word.",
            "4. If you're correct, you can click 'Next' to continue or 'Explain' to learn more about that feeling."
        ]
    }
  ],
  mood: [
    {
        title: "Tracking Your Mood",
        steps: [
            "1. In the 'Mood Tracker' card, find the button that matches how you feel (e.g., 'Happy', 'Sad').",
            "2. Click the button. Your mood will be logged in the 'Mood History' and a helpful tip will appear.",
        ]
    },
    {
        title: "Viewing Mood History",
        steps: [
            "1. The 'Mood History' card shows a list of all your logged moods with timestamps.",
            "2. The 'Mood Analytics' chart provides a visual summary of how often you've felt each mood.",
            "3. To delete a single entry, hover over it and click the trash can icon.",
            "4. To clear all history, click the 'Clear All' button.",
        ]
    }
  ],
  notes: [
    {
        title: "Securing Your Notes",
        steps: [
            "1. The first time you visit, you'll be asked to set a 4-digit passcode.",
            "2. Enter and confirm your new passcode, then click 'Set Passcode'.",
            "3. On future visits, you will need to enter this passcode to unlock and view your notes.",
        ]
    },
    {
        title: "Managing Notes",
        steps: [
            "To add a new note, type in the 'Caregiver Notes' text area and click 'Save Note'.",
            "Your saved notes will appear in the 'Previous Notes' list.",
            "To delete a note, hover over it and click the trash can icon.",
        ]
    },
    {
        title: "Changing Your Passcode",
        steps: [
            "1. After unlocking your notes, click the 'Change Passcode' button.",
            "2. Enter and confirm your new passcode.",
            "3. Click 'Update Passcode' to save the change."
        ]
    }
  ],
  resources: [
    {
        title: "Accessing Resources",
        steps: [
            "1. The 'Resources' card contains links to helpful organizations.",
            "2. Click on any resource block to open its website in a new tab.",
        ]
    },
    {
        title: "Donating",
        steps: [
            "1. The 'Donate Today' card provides a way to support autism research.",
            "2. Click the 'Donate on GoFundMe' button to be taken to the official donation page."
        ]
    }
  ],
  contact: [
     {
        title: "Getting in Touch",
        steps: [
            "This tab provides multiple ways to contact the app developers.",
            "Click the 'Open Contact Form' button for general inquiries.",
            "Alternatively, use the email, GitHub, or Instagram links to connect with us.",
        ]
    }
  ],
};

export default function HelpContent({ activeTab }: HelpContentProps) {
  const content = helpData[activeTab] || [];

  if (content.length === 0) {
    return <p>No help available for this section.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
        {content.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>
                    <ul className="space-y-2 list-none pl-2">
                        {item.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-muted-foreground">{step}</li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
  );
}
