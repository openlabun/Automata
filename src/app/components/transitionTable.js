import { useState, useEffect } from "react";
import styles from "./component.module.css";

const TransitionTable = ({ nfaTable }) => {
    const [states, setStates] = useState([]);
    const [symbols, setSymbols] = useState([]);
    const [transitionsMatrix, setTransitionsMatrix] = useState({});

    useEffect(() => {
        if (nfaTable) {
            const parsedStates = new Set();
            const parsedSymbols = new Set();
            const transitionMatrix = {};

            // Loop through each state and its transitions
            for (const fromState in nfaTable) {
                parsedStates.add(fromState);
                const transitions = nfaTable[fromState];

                // Loop through each symbol and destination states
                for (const symbol in transitions) {
                    parsedSymbols.add(symbol); // Collect the symbols
                    const toStates = transitions[symbol];

                    // Format the states: if multiple, wrap in curly braces
                    const formattedStates =
                        toStates.length > 1 ? `{${toStates.join(", ")}}` : toStates[0];

                    // Add transitions to the matrix
                    if (!transitionMatrix[fromState]) {
                        transitionMatrix[fromState] = {};
                    }

                    transitionMatrix[fromState][symbol] = formattedStates;
                }
            }

            // Convert Set to Array and sort them (optional for cleaner order)
            const sortedStates = Array.from(parsedStates).sort((a, b) => a - b);
            const sortedSymbols = Array.from(parsedSymbols);
            setStates(sortedStates);
            setSymbols(sortedSymbols);
            setTransitionsMatrix(transitionMatrix);
        }
    }, [nfaTable]);

    return (
        <div className={styles.transitionsTable}>
            <h2>Transiciones del Autómata</h2>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Estado</th>
                            {symbols.map((symbol) => (
                                <th key={symbol}>{symbol}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {states.map((fromState) => (
                            <tr key={fromState}>
                                <td>{fromState}</td>
                                {symbols.map((symbol) => (
                                    <td key={`${fromState}-${symbol}`}>
                                        {transitionsMatrix[fromState]?.[symbol] || "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransitionTable;
