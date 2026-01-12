import { Buffer } from 'buffer';

// Polyfill Buffer for Solana/Switchboard SDK browser compatibility
globalThis.Buffer = Buffer;

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
