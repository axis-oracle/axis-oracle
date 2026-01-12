import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/providers/WalletProvider";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import AppDashboard from "./pages/AppDashboard";
import NotFound from "./pages/NotFound";
import DocsLayout from "./components/docs/DocsLayout";
import DocsIndex from "./pages/docs/DocsIndex";
import IntroPage from "./pages/docs/IntroPage";
import QuickStartPage from "./pages/docs/QuickStartPage";
import ArchitecturePage from "./pages/docs/ArchitecturePage";
import DataFlowPage from "./pages/docs/DataFlowPage";
import TrustModelPage from "./pages/docs/TrustModelPage";
import LifecyclePage from "./pages/docs/LifecyclePage";
import IntegrationPage from "./pages/docs/IntegrationPage";
import ApiReferencePage from "./pages/docs/ApiReferencePage";
import CryptoModulePage from "./pages/docs/modules/CryptoModulePage";
import EsportsModulePage from "./pages/docs/modules/EsportsModulePage";
import MemecoinsModulePage from "./pages/docs/modules/MemecoinsModulePage";
import WeatherSportsPage from "./pages/docs/modules/WeatherSportsPage";
import InstallationPage from "./pages/docs/developers/InstallationPage";
import RustIntegrationPage from "./pages/docs/developers/RustIntegrationPage";
import TutorialPage from "./pages/docs/developers/TutorialPage";
import ErrorsPage from "./pages/docs/developers/ErrorsPage";
import TechnicalDocPage from "./pages/docs/TechnicalDocPage";

const queryClient = new QueryClient();

// Get initial theme based on time of day (dark: 6pm-6am)
const getTimeBasedTheme = (): 'light' | 'dark' => {
  const hour = new Date().getHours();
  return (hour >= 18 || hour < 6) ? 'dark' : 'light';
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme={getTimeBasedTheme()} enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app/*" element={<AppDashboard />} />
            
            {/* Documentation Routes */}
            <Route path="/docs" element={<DocsLayout />}>
              <Route index element={<DocsIndex />} />
              <Route path="intro" element={<IntroPage />} />
              <Route path="quickstart" element={<QuickStartPage />} />
              <Route path="architecture" element={<ArchitecturePage />} />
              <Route path="data-flow" element={<DataFlowPage />} />
              <Route path="trust-model" element={<TrustModelPage />} />
              <Route path="lifecycle" element={<LifecyclePage />} />
              <Route path="integration" element={<IntegrationPage />} />
              <Route path="api-reference" element={<ApiReferencePage />} />
              <Route path="contracts" element={<IntegrationPage />} />
              <Route path="accounts" element={<IntegrationPage />} />
              
              {/* Module Pages */}
              <Route path="modules/crypto" element={<CryptoModulePage />} />
              <Route path="modules/esports" element={<EsportsModulePage />} />
              <Route path="modules/memecoins" element={<MemecoinsModulePage />} />
              <Route path="modules/weather-sports" element={<WeatherSportsPage />} />
              
              {/* Developer Pages */}
              <Route path="developers/installation" element={<InstallationPage />} />
              <Route path="developers/rust-integration" element={<RustIntegrationPage />} />
              <Route path="developers/tutorial" element={<TutorialPage />} />
              <Route path="developers/errors" element={<ErrorsPage />} />
              <Route path="technical" element={<TechnicalDocPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
