MultiStepTaskCreationModal
├── Dialog
│   └── DialogContent
│       ├── StepIndicator
│       │   └── StepDot (repeated)
│       └── Card
│           ├── CardHeader
│           │   ├── CardTitle
│           │   │   └── FileTextIcon
│           │   └── CardDescription
│           ├── CardContent
│           │   ├── Step0Content (conditional)
│           │   │   ├── Textarea (Note)
│           │   │   └── TaskCategoryToggle
│           │   └── Step1Content (conditional)
│           │       ├── Textarea (Original Note)
│           │       ├── TaskCategoryToggle
│           │       └── Textarea (Generated Description)
│           └── CardFooter
│               ├── Step0Buttons (conditional)
│               │   ├── Button (Cancel)
│               │   └── Button (Generate)
│               │       └── ReloadIcon (conditional)
│               └── Step1Buttons (conditional)
│                   ├── Button (Back)
│                   └── Button (Accept)
│                       └── CheckIcon
