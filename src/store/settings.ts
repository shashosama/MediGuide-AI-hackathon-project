import { atom } from "jotai";

interface Settings {
  name: string;
  language: string;
  interruptSensitivity: string;
  context: string;
  persona?: string;
  replica?: string;
  greeting?: string;
}

const getInitialSettings = (): Settings => {
  const savedSettings = localStorage.getItem('tavus-settings');
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    return {
      name: parsed.name || "",
      language: parsed.language || "en",
      interruptSensitivity: parsed.interruptSensitivity || "medium",
      context: parsed.context || "",
      persona: parsed.persona || "",
      replica: parsed.replica || "",
      greeting: parsed.greeting || "",
    };
  }
  return {
    name: "",
    language: "en",
    interruptSensitivity: "medium",
    context: "",
    persona: "",
    replica: "",
    greeting: "",
  };
};

export const settingsAtom = atom<Settings>(getInitialSettings());

export const settingsSavedAtom = atom<boolean>(false);