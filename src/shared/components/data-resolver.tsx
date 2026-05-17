"use client";

import * as React from "react";
import { LucideAlertTriangle, LucideRefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import Loading from "@/shared/components/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type DataResolverProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  resetKey?: string | number;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: (error: Error, reset: () => void) => React.ReactNode;
  resetKey?: string | number;
};

type ErrorBoundaryState = {
  error: Error | null;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      prevProps.resetKey !== this.props.resetKey &&
      this.state.error !== null
    ) {
      this.setState({ error: null });
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Card className="mx-auto w-full max-w-xl border-destructive/20 bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <LucideAlertTriangle className="size-4" />
          Nepodařilo se načíst data
        </CardTitle>
        <CardDescription>
          Během načítání došlo k chybě. Zkuste to prosím znovu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline" onClick={reset}>
          <LucideRefreshCw />
          Zkusit znovu
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DataResolver({
  children,
  fallback = <Loading />,
  errorFallback,
  resetKey,
}: DataResolverProps) {
  return (
    <ErrorBoundary
      resetKey={resetKey}
      fallback={(error, reset) =>
        errorFallback ?? <DefaultErrorFallback error={error} reset={reset} />
      }
    >
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}
