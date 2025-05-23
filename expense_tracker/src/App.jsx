import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./context/AuthContext"; // Ensure this path is correct

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
