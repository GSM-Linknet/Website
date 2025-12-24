import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { Toaster } from "@/components/ui/toaster";

/**
 * App is the root entry point of the GSM Dashboard application.
 * It utilizes the modern RouterProvider with a centralized route configuration
 * for improved maintainability and cleaner code structure.
 */
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
