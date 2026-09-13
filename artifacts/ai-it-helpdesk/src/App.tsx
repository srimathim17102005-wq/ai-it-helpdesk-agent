import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { HelpdeskShell } from '@/components/helpdesk-shell';
import Home from '@/pages/home';
import Tickets from '@/pages/tickets';
import TicketDetail from '@/pages/ticket-detail';
import Activity from '@/pages/activity';
import Settings from '@/pages/settings';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <HelpdeskShell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/tickets" component={Tickets} />
          <Route path="/tickets/:id" component={TicketDetail} />
          <Route path="/activity" component={Activity} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </HelpdeskShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
