import { Button } from "./components/Button";
import { FiShare2 } from "react-icons/fi";
import { PlusIcon } from "./icons/PlusIcon";

function App() {
  return (
    <>
      <h1 className="underline text-3xl font-bold">Tailwind check</h1>
      <Button
        variant="primary"
        text="Add new Content"
        onClick={() => alert("Added new content!")}
        icon={<PlusIcon size="sm" />}
      />
      <Button
        variant="secondary"
        size="lg"
        text="Share the Brain"
        onClick={() => alert("Brain shared!")}
        icon={<FiShare2 />}
      />
    </>
  );
}

export default App;
