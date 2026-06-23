import { useEffect } from "react";
import { Provider } from "jotai";
import initGame from "./game/initGame";
import TextBox from "./game/TextBox";
import { store } from "./game/store";

function App() {
  useEffect(() => {
    initGame();
  }, []);

  return (
    <Provider store={store}>
      <div id="game-wrapper">
        <canvas id="game"></canvas>
        <TextBox />
        <div id="ui"></div>
      </div>
    </Provider>
  );
}

export default App;
