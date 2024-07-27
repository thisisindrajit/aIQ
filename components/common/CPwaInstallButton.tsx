"use client";

import { ReactNode, FC, useState, useEffect } from "react";

const CPwaInstallButton: FC<{ children: ReactNode }> = ({ children }) => {
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (event: any) => {
      event.preventDefault();
      setPromptInstall(event);
    };

    // beforeinstallprompt will only be fired when the below condition is true:
    // - The PWA must not already be installed
    window.addEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (event: any) => {
    event.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  return promptInstall ? <div onClick={onClick}>{children}</div> : null;
};

export default CPwaInstallButton;