import OBR from "@owlbear-rodeo/sdk";
import { ID } from "./main.tsx";
import StatBlock from "./StatBlock.tsx";

function App() {
  const popover = () => {
    OBR.popover.open({
      id: `${ID}/statblock`,
      url: "/statblock",
      height: 500,
      width: 400,
      disableClickAway: true,
    });
  };

  const combat = () => {
    console.log("Click");
  };

  if (window.location.pathname === "/statblock") {
    return <StatBlock />;
  }

  return (
    <section>
      <h1>StatBlock</h1>
      <button type="button" onClick={popover}>
        Show
      </button>
      <button type="button" onClick={combat}>
        Combat!
      </button>
    </section>
  );
}

export default App;
