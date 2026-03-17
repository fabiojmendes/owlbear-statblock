import OBR from "@owlbear-rodeo/sdk";
import { ID } from "./main.tsx";
import StatBlock from "./StatBlock.tsx";

function App() {
  const popover = () => {
    OBR.popover.open({
      id: `${ID}/statblock`,
      url: "/statblock",
      height: 500,
      width: 450,
      disableClickAway: true,
      anchorOrigin: { horizontal: "RIGHT", vertical: "TOP" },
      marginThreshold: 75,
    });
  };

  const combat = () => {
    console.log("Click");
  };

  if (window.location.pathname === "/statblock") {
    return <StatBlock />;
  }

  return (
    <section className="app-container">
      <h1>StatBlock</h1>
      <div className="button-group">
        <button className="action-button" type="button" onClick={popover}>
          Show
        </button>
      </div>
      <div className="button-group">
        <button className="action-button" type="button" onClick={combat}>
          Combat!
        </button>
      </div>
    </section>
  );
}

export default App;
