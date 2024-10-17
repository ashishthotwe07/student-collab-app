import React from "react";

export default function App() {
  return (
    <div>
      <div class="container mx-auto p-4">
        <h1 class="text-primary text-4xl font-bold mb-4">Welcome to Our App</h1>
        <p class="text-gray-600 mb-6">
          This is a high-end application that connects you with like-minded
          individuals.
        </p>
        <button class="btn">Get Started</button>

        <div class="bg-primary p-6 mt-6 rounded shadow">
          <h2 class="text-accent text-2xl mb-2">Featured Resources</h2>
          <ul class="list-disc pl-5">
            <li class="text-primary">Resource 1</li>
            <li class="text-primary">Resource 2</li>
            <li class="text-primary">Resource 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
