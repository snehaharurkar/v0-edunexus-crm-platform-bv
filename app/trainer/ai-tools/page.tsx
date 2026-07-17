"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, HelpCircle, ClipboardList, ListChecks, Download, Sparkles, Loader2 } from 'lucide-react';

export default function AIToolsPage() {
  // Lecture Notes Generator
  const [notesTopic, setNotesTopic] = useState('');
  const [notesOutput, setNotesOutput] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  // Quiz Generator
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');
  const [quizOutput, setQuizOutput] = useState('');
  const [quizLoading, setQuizLoading] = useState(false);

  // Assignment Generator
  const [assignmentTopic, setAssignmentTopic] = useState('');
  const [assignmentOutput, setAssignmentOutput] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Class Summary
  const [summaryInput, setSummaryInput] = useState('');
  const [summaryOutput, setSummaryOutput] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleGenerateNotes = async () => {
    setNotesLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setNotesOutput(`# ${notesTopic}

## Introduction
${notesTopic} is a fundamental concept in modern web development that enables developers to create more efficient and maintainable code.

## Key Concepts

### 1. Core Principles
- **Declarative Approach**: Focus on what you want to achieve rather than how to achieve it
- **Component-Based Architecture**: Build encapsulated components that manage their own state
- **Unidirectional Data Flow**: Data flows in one direction, making it easier to understand and debug

### 2. Best Practices
- Keep components small and focused on a single responsibility
- Use meaningful naming conventions for better code readability
- Write tests to ensure reliability and maintainability

### 3. Common Patterns
- Container and Presentational components
- Higher-Order Components (HOCs)
- Render Props pattern
- Custom Hooks for logic reuse

## Implementation Example

\`\`\`javascript
// Example implementation
function Example({ data }) {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effect logic
  }, [dependencies]);
  
  return <Component {...props} />;
}
\`\`\`

## Summary
Understanding ${notesTopic} is crucial for building scalable applications. Practice these concepts regularly to master them.`);
    setNotesLoading(false);
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setQuizOutput(`## Quiz: ${quizTopic}
### Difficulty: ${quizDifficulty}

---

**Question 1:** What is the primary purpose of ${quizTopic.split(' ')[0]} in modern development?

A) To make code longer and more complex
B) To improve code organization and reusability ✓
C) To slow down application performance
D) To remove all JavaScript from the project

**Answer: B**

---

**Question 2:** Which of the following is a best practice when working with ${quizTopic.split(' ')[0]}?

A) Writing all code in a single file
B) Avoiding comments entirely
C) Breaking code into small, focused modules ✓
D) Using global variables everywhere

**Answer: C**

---

**Question 3:** What happens when state changes in a component?

A) Nothing happens
B) The entire application restarts
C) The component and its children re-render ✓
D) The browser crashes

**Answer: C**

---

**Question 4:** Which hook is used for side effects?

A) useState
B) useEffect ✓
C) useContext
D) useReducer

**Answer: B**

---

**Question 5:** What is the correct way to pass data to child components?

A) Using global variables
B) Through props ✓
C) By modifying the DOM directly
D) Using local storage

**Answer: B**`);
    setQuizLoading(false);
  };

  const handleGenerateAssignment = async () => {
    setAssignmentLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAssignmentOutput(`## Assignment: ${assignmentTopic}

### Task 1: Build a Basic Component
**Objective:** Create a reusable component that demonstrates your understanding of ${assignmentTopic}.

**Requirements:**
- Create a functional component with proper props
- Implement state management using hooks
- Add proper error handling
- Include meaningful comments

**Deliverables:**
- Source code file
- Brief documentation explaining your approach

---

### Task 2: Implement Data Handling
**Objective:** Work with data fetching and display.

**Requirements:**
- Fetch data from a provided API endpoint
- Display the data in a user-friendly format
- Handle loading and error states
- Implement basic filtering or sorting

**Deliverables:**
- Working component with data fetching
- Screenshot of the working application

---

### Task 3: Mini Project
**Objective:** Combine all concepts learned to build a small project.

**Requirements:**
- Build a simple application using ${assignmentTopic}
- Include at least 3 different components
- Implement proper state management
- Add basic styling

**Evaluation Criteria:**
- Code quality and organization (30%)
- Functionality (40%)
- UI/UX design (20%)
- Documentation (10%)

**Submission Deadline:** 7 days from assignment date`);
    setAssignmentLoading(false);
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSummaryOutput(`## Class Summary

### Key Points Covered:

• **Introduction to the Topic**
  - Overview of core concepts and their importance
  - Historical context and evolution

• **Main Concepts**
  - Fundamental principles explained with examples
  - Best practices for implementation
  - Common pitfalls to avoid

• **Practical Applications**
  - Real-world use cases demonstrated
  - Step-by-step implementation guide
  - Code examples and explanations

• **Advanced Topics**
  - Performance optimization techniques
  - Scaling considerations
  - Integration with other technologies

### Action Items:
1. Review the code examples shared in class
2. Complete the practice exercises
3. Prepare questions for the next session

### Resources Shared:
- Documentation links
- Recommended reading materials
- Video tutorials for further learning`);
    setSummaryLoading(false);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Tools</h1>
        <p className="text-muted-foreground mt-1">AI-powered tools to help you create content faster</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lecture Notes Generator */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Lecture Notes Generator</h3>
              <p className="text-sm text-muted-foreground">Generate structured notes for any topic</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notesTopic">Topic</Label>
              <Input
                id="notesTopic"
                value={notesTopic}
                onChange={(e) => setNotesTopic(e.target.value)}
                placeholder="e.g., React Hooks"
              />
            </div>
            <Button onClick={handleGenerateNotes} disabled={!notesTopic || notesLoading} className="w-full">
              {notesLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Generate Notes</>
              )}
            </Button>
            {notesOutput && (
              <div className="mt-4">
                <div className="p-4 rounded-lg bg-muted text-sm max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
                  {notesOutput}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleDownload(notesOutput, `${notesTopic}-notes.md`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Generator */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Quiz Generator</h3>
              <p className="text-sm text-muted-foreground">Create MCQ quizzes automatically</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quizTopic">Topic</Label>
              <Input
                id="quizTopic"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g., JavaScript Arrays"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateQuiz} disabled={!quizTopic || quizLoading} className="w-full">
              {quizLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Generate Quiz</>
              )}
            </Button>
            {quizOutput && (
              <div className="mt-4">
                <div className="p-4 rounded-lg bg-muted text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {quizOutput}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleDownload(quizOutput, `${quizTopic}-quiz.md`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Generator */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Assignment Generator</h3>
              <p className="text-sm text-muted-foreground">Create practical assignments</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignmentTopic">Topic</Label>
              <Input
                id="assignmentTopic"
                value={assignmentTopic}
                onChange={(e) => setAssignmentTopic(e.target.value)}
                placeholder="e.g., React State Management"
              />
            </div>
            <Button onClick={handleGenerateAssignment} disabled={!assignmentTopic || assignmentLoading} className="w-full">
              {assignmentLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Generate Assignment</>
              )}
            </Button>
            {assignmentOutput && (
              <div className="mt-4">
                <div className="p-4 rounded-lg bg-muted text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {assignmentOutput}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleDownload(assignmentOutput, `${assignmentTopic}-assignment.md`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Class Summary */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <ListChecks className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Class Summary</h3>
              <p className="text-sm text-muted-foreground">Summarize your class notes</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summaryInput">Paste Notes</Label>
              <Textarea
                id="summaryInput"
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder="Paste your class notes here..."
                rows={4}
              />
            </div>
            <Button onClick={handleGenerateSummary} disabled={!summaryInput || summaryLoading} className="w-full">
              {summaryLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Summarizing...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Summarize</>
              )}
            </Button>
            {summaryOutput && (
              <div className="mt-4">
                <div className="p-4 rounded-lg bg-muted text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {summaryOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
