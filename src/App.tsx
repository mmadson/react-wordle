import React from 'react';
import './App.css';
import {GameBoard} from "./GameBoard";

function App() {
    return (
        <div className="App">
            <header>
                <div className="title">Women Who Wordle</div>
            </header>
            <GameBoard/>
        </div>
    );
}

export default App;
