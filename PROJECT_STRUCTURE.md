# PROJECT_STRUCTURE.md

## Project Structure

This document provides a detailed overview of the folder structure for the `si-u-quan-tr-ng` project.

```
si-u-quan-tr-ng/
├── src/
│   ├── components/         # Reusable components
│   ├── pages/              # Page components (one component per page)
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── docs/                   # Documentation files
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies and scripts
└── README.md               # Project overview and setup instructions
```

## Explanation of Folders

- **src/**: Contains all source code.
  - **components/**: Holds the reusable components used throughout the application.
  - **pages/**: Each page of the application is represented as a component in this folder.
  - **utils/**: A place for utility functions used in various parts of the application.

- **public/**: Used for static assets like images and manifest files that are served directly to clients.

- **tests/**: Contains all the test files.
  - **unit/**: These tests focus on individual units of code.
  - **integration/**: These test how multiple components work together.

- **docs/**: Documentation related to the project.

- **.gitignore**: Specifies files and directories Git should ignore.

- **package.json**: Tracks project dependencies and scripts allowing for easy management of project libraries.

- **README.md**: Provides a basic overview of the project and setup instructions.