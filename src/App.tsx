import { useAtom } from "jotai";
import { screenAtom } from "./store/screens";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import {
  IntroLoading,
  Outage,
  OutOfMinutes,
  Intro,
  Instructions,
  Conversation,
  TextChat,
  FinalScreen,
  Settings,
} from "./screens";

function App() {
  const [{ currentScreen }] = useAtom(screenAtom);

  const renderScreen = () => {
    switch (currentScreen) {
      case "introLoading":
        return <IntroLoading />;
      case "outage":
        return <Outage />;
      case "outOfMinutes":
        return <OutOfMinutes />;
      case "intro":
        return <Intro />;
      case "settings":
        return <Settings />;
      case "instructions":
        return <Instructions />;
      case "conversation":
        return <Conversation />;
      case "textChat":
        return <TextChat />;
      case "finalScreen":
        return <FinalScreen />;
      default:
        return <IntroLoading />;
    }
  };

  return (
    <main className="flex h-svh flex-col items-center justify-between gap-3 p-2 sm:gap-4 sm:p-5 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50">
      {currentScreen !== "introLoading" && <Header />}
      <div className="flex-1 w-full flex items-center justify-center">
        {renderScreen()}
      </div>
      {currentScreen !== "introLoading" && <Footer />}
    </main>
  );
}

export default App;