import { lazy, Suspense, useState } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const AyurSutraBot = lazy(() => import("./AyurSutraBot"));

export default function ChatLauncher() {
  const [opened, setOpened] = useState(false);
  if (opened) {
    return <Suspense fallback={<p className="fixed bottom-6 right-6 rounded-lg bg-white p-3 shadow" role="status">Loading Sahayak…</p>}>
      <AyurSutraBot initiallyOpen />
    </Suspense>;
  }
  return <button type="button" aria-label="Open Sahayak" onClick={() => setOpened(true)}
    className="fixed bottom-6 right-6 z-40 rounded-full bg-green-700 p-4 text-white shadow-lg hover:bg-green-800">
    <ChatBubbleLeftRightIcon className="h-6 w-6" />
  </button>;
}
