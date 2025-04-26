// src/components/Example.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";

// Example component (replace with your actual component)
const ExampleComponent = ({ message }: { message: string }) => {
  return <div>{message}</div>;
};

describe("ExampleComponent", () => {
  it("should render the message", () => {
    // Arrange
    const testMessage = "Hello, Vitest!";
    render(<ExampleComponent message={testMessage} />);

    // Act
    const messageElement = screen.getByText(testMessage);

    // Assert
    expect(messageElement).toBeInTheDocument();
  });
});
