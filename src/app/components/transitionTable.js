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

            for (const fromState in nfaTable) {
                parsedStates.add(fromState);
                const transitions = nfaTable[fromState];

                for (const symbol in transitions) {
                    parsedSymbols.add(symbol); 
                    const toStates = transitions[symbol];

                    const formattedStates =
                        toStates.length > 1 ? `{${toStates.join(", ")}}` : toStates[0];

                    if (!transitionMatrix[fromState]) {
                        transitionMatrix[fromState] = {};
                    }

                    transitionMatrix[fromState][symbol] = formattedStates;
                }
            }

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
            <div className={styles.wrapper}>
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
        </div>
    );
};

export default TransitionTable;
