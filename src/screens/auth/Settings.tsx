import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
} from "@/components/layout/DialogWrapper";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { getDefaultStore } from "jotai";
import { settingsAtom, settingsSavedAtom } from "@/store/settings";
import { screenAtom } from "@/store/screens";
import { X } from "lucide-react";
import * as React from "react";
import { apiTokenAtom } from "@/store/tokens";

// Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "ghost" | "outline";
    size?: "icon";
  }
>(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
        {
          "border border-input bg-transparent hover:bg-accent": variant === "outline",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "size-8 sm:size-10": size === "icon",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-9 sm:h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Textarea Component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] sm:min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

// Label Component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});
Label.displayName = "Label";

// Select Component
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-9 sm:h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Select.displayName = "Select";

export const Settings: React.FC = () => {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);
  const [, setSettingsSaved] = useAtom(settingsSavedAtom);

  const languages = [
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Italian", value: "it" },
    { label: "Portuguese", value: "pt" },
  ];

  const interruptSensitivities = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  const handleClose = () => {
    setScreenState({ 
      currentScreen: token ? "instructions" : "intro" 
    });
  };

  const handleSave = async () => {
    console.log('Current settings before save:', settings);
    
    // Create a new settings object to ensure we have a fresh reference
    const updatedSettings = {
      ...settings,
    };
    
    // Save to localStorage
    localStorage.setItem('tavus-settings', JSON.stringify(updatedSettings));
    
    // Update the store with the new settings object
    const store = getDefaultStore();
    store.set(settingsAtom, updatedSettings);
    
    // Wait a moment to ensure the store is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check both localStorage and store
    const storedSettings = localStorage.getItem('tavus-settings');
    const storeSettings = store.get(settingsAtom);
    
    console.log('Settings in localStorage:', JSON.parse(storedSettings || '{}'));
    console.log('Settings in store after save:', storeSettings);
    
    setSettingsSaved(true);
    handleClose();
  };

  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
          <div className="sticky top-0 pb-4 sm:pb-6 z-10 bg-white/95">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute right-0 top-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <X className="size-4 sm:size-6" />
            </Button>
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Settings</h2>
          </div>
          
          <div className="h-[calc(100vh-350px)] sm:h-[calc(100vh-400px)] overflow-y-auto pr-2 sm:pr-4 -mr-2 sm:-mr-4">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Your Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Enter your name"
                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-gray-700">Language</Label>
                <Select
                  id="language"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option 
                      key={lang.value} 
                      value={lang.value}
                      className="bg-white text-gray-800"
                    >
                      {lang.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interruptSensitivity" className="text-gray-700">Interrupt Sensitivity</Label>
                <Select
                  id="interruptSensitivity"
                  value={settings.interruptSensitivity}
                  onChange={(e) => setSettings({ ...settings, interruptSensitivity: e.target.value })}
                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
                >
                  {interruptSensitivities.map((sensitivity) => (
                    <option 
                      key={sensitivity.value} 
                      value={sensitivity.value}
                      className="bg-white text-gray-800"
                    >
                      {sensitivity.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context" className="text-gray-700">Custom Context</Label>
                <Textarea
                  id="context"
                  value={settings.context}
                  onChange={(e) => setSettings({ ...settings, context: e.target.value })}
                  placeholder="Paste or type custom context"
                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiToken" className="text-gray-700">API Token</Label>
                <Input
                  id="apiToken"
                  type="password"
                  value={token || ""}
                  onChange={(e) => {
                    const newToken = e.target.value;
                    setToken(newToken);
                    localStorage.setItem('tavus-token', newToken);
                  }}
                  placeholder="Enter Tavus API Key"
                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Default Configuration</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <p><strong>Greeting:</strong> "Hello, What do you need today?"</p>
                  <p><strong>Persona ID:</strong> p3bb4745d4f9 (Medical Assistant)</p>
                  <p><strong>Replica ID:</strong> rb17cf590e15 (Medical Replica)</p>
                  <p className="text-xs text-blue-600 mt-2">
                    These are hardcoded defaults. You can override them by setting custom values in the optional fields below.
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800">Optional Overrides</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="greeting" className="text-gray-700">Custom Greeting (Optional)</Label>
                  <Input
                    id="greeting"
                    value={settings.greeting || ""}
                    onChange={(e) => setSettings({ ...settings, greeting: e.target.value })}
                    placeholder="Leave empty to use default greeting"
                    className="bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="persona" className="text-gray-700">Custom Persona ID (Optional)</Label>
                  <Input
                    id="persona"
                    value={settings.persona || ""}
                    onChange={(e) => setSettings({ ...settings, persona: e.target.value })}
                    placeholder="Leave empty to use default persona"
                    className="bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replica" className="text-gray-700">Custom Replica ID (Optional)</Label>
                  <Input
                    id="replica"
                    value={settings.replica || ""}
                    onChange={(e) => setSettings({ ...settings, replica: e.target.value })}
                    placeholder="Leave empty to use default replica"
                    className="bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 mt-4 sm:mt-6 border-t border-gray-200 pt-4 sm:pt-6 pb-2 bg-white/95">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 px-4 rounded-md transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};