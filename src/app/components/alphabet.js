import { useState, useEffect } from "react";
import styles from "./component.module.css";

const Alphabet = ({ nfaTable }) => {
    const [alphabet, setAlphabet] = useState([]);

    useEffect(() => {
        if (nfaTable) {
            const parsedSymbols = new Set();

            // Loop through each state and its transitions
            for (const fromState in nfaTable) {
                const transitions = nfaTable[fromState];

                // Loop through each symbol
                for (const symbol in transitions) {
                    parsedSymbols.add(symbol); // Collect the symbols
                }
            }

            // Convert Set to Array and sort them
            const sortedSymbols = Array.from(parsedSymbols).sort();
            console.log('sortedSymbols', sortedSymbols);
            setAlphabet(sortedSymbols);
        }
    }, [nfaTable]);

    return (
        <div className={styles.transitionsTable}>
            <h2>Alfabeto</h2>
            <div className={styles.Alphabet}>
                𝛴 = <span>{`{ ${alphabet.join(', ')} }`}</span>
            </div>
        </div>
    );
};

export default Alphabet;
