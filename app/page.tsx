import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              AI Debate Skills Trainer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Improve your argumentation and debate skills by engaging with an AI
              that takes strong stances on controversial topics.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Start New Debate</CardTitle>
                <CardDescription>
                  Create a new debate session on any topic. The AI will take a
                  strong position to challenge your arguments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/debates/new">
                  <Button className="w-full" size="lg">
                    Create Debate
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>View History</CardTitle>
                <CardDescription>
                  Review your past debates and see how your argumentation skills
                  have improved over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/debates">
                  <Button className="w-full" size="lg" variant="outline">
                    Browse Debates
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mt-16 space-y-4">
            <h2 className="text-2xl font-semibold text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-4xl">🎯</div>
                <h3 className="font-semibold">Choose a Topic</h3>
                <p className="text-sm text-muted-foreground">
                  Select any controversial or ethical issue you want to debate
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl">🤖</div>
                <h3 className="font-semibold">AI Takes a Stance</h3>
                <p className="text-sm text-muted-foreground">
                  The AI will argue strongly for or against your chosen position
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl">💪</div>
                <h3 className="font-semibold">Build Your Skills</h3>
                <p className="text-sm text-muted-foreground">
                  Practice rhetoric, critical thinking, and persuasive arguments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
