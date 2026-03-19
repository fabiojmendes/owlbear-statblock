import Actions from "./components/Actions.tsx";
import StatBlock from "./components/StatBlock.tsx";

function App({ isGM = false }) {
  if (window.location.pathname === "/statblock") {
    return <StatBlock />;
  }

  return (
    <section className="app-container">
      <h2>StatBlock</h2>
      <hr />
      {isGM ? <Actions /> : <p>Only GMs have access to stat blocks</p>}
    </section>
  );
}

export default App;
