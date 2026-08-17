import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";

import { ProblemPanel } from "@/features/problem-detail/components/problem-panel";
import { EditorPanel } from "@/features/problem-detail/components/editor-panel";
import { api } from "@/services/axios-interceptor";
import { cn } from "@/lib/utils";

import type {
  ProblemDetails,
  TestCase,
  ProblemTemplate,
  ProblemHints,
} from "@/types/problem-detail";

export default function ProblemDetail() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [templates, setTemplates] = useState<ProblemTemplate[]>([]);
  const [hints, setHints] = useState<ProblemHints[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [problemRes, testCasesRes, templatesRes, hintsRes] = await Promise.all([
          api.get(`/problems/${id}`),
          api.get(`/problems/${id}/testcases/visible`),
          api.get(`/problem-templates/problem/${id}`),
          api.get(`/problems/${id}/hints`),
        ]);
        setProblem(problemRes.data.data);
        setTestCases(testCasesRes.data.data ?? []);
        setHints(hintsRes.data.data ?? []);
        setTemplates(templatesRes.data.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Failed to load problem.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <ProblemSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!problem) {
    return null;
  }

  return (
    <div className="bg-background flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="hidden flex-1 overflow-hidden md:flex">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={65}>
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel defaultSize={40}>
                <div className="border-border h-full border-r">
                  <ProblemPanel problem={problem} testCases={testCases} hints={hints} />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={60}>
                <EditorPanel problemId={problem.id} templates={templates} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />
        </ResizablePanelGroup>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden md:hidden">
        <MobileView problem={problem} testCases={testCases} templates={templates} hints={hints} />
      </div>
    </div>
  );
}

function MobileView({
  problem,
  testCases,
  templates,
  hints,
}: {
  problem: ProblemDetails;
  testCases: TestCase[];
  templates: ProblemTemplate[];
  hints: ProblemHints[];
}) {
  const tabs = ["Problem", "Editor"] as const;

  const [active, setActive] = useState<(typeof tabs)[number]>("Problem");

  return (
    <>
      <div className="border-border flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium",
              active === tab ? "border-primary" : "text-muted-foreground border-transparent",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {active === "Problem" && (
          <ProblemPanel problem={problem} testCases={testCases} hints={hints} />
        )}
        {active === "Editor" && <EditorPanel problemId={problem.id} templates={templates} />}
      </div>
    </>
  );
}

function ProblemSkeleton() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 space-y-4 p-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>

      <div className="flex-1 p-4">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
